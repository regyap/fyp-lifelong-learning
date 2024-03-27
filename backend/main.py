from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from flask import Flask
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from functools import wraps
import firebase_admin
from firebase_admin import db, credentials, auth, initialize_app, storage, firestore
import pyrebase
import PyPDF2
import json
import io
import requests

import datetime
from google.cloud import storage
import os
import psycopg2
from psycopg2 import Error
from config import load_config
from enum import Enum
from pdf2image import convert_from_bytes, convert_from_path

import os
import random


from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain.chains.question_answering import load_qa_chain

from cryptography.fernet import Fernet
import base64

import subprocess
from pdf2image import convert_from_path

import fitz  # PyMuPDF
import io
from PIL import Image

from firebase_admin import credentials, firestore, storage

os.environ["OPENAI_API_KEY"] = "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"
embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(temperature=0)


class DomainType(Enum):
    student = "student"
    recruiter = "recruiter"


app = Flask(__name__)
CORS(app)
app.secret_key = "68ea6a6ea2bb49c2b9d078604479ef4d"


# postgres connection
db_config = load_config()
conn = psycopg2.connect(**db_config)


def connect_to_db():
    try:
        connection = psycopg2.connect(
            user="postgres",
            password="",
            host="",
            port="5432",
            database="aija",
        )
        return connection
    except (Exception, Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return None


# firebase connection
cred = credentials.Certificate("admin_creds.json")
default_app = firebase_admin.initialize_app(cred)
bucket = storage.bucket("aija-fyp.appspot.com")

# JWT
app.config["JWT_SECRET_KEY"] = "68ea6a6ea2bb49c2b9d078604479ef4d"
jwt = JWTManager(app)


# @app.route("/loginfirst", methods=["POST", "GET"])
# def loginfirst():  # enteremail
# try:
#     email = request.get_json(force=True)["emailinput"]
#     domain = request.get_json(force=True)["domaininput"]

#     try:
#         print(email)
#         print(domain)
#         cursor = conn.cursor()
#         cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
#         user = cursor.fetchone()

#        if user:
#             message = "Suceess email check"

#             returner = jsonify(
#                 {"message": message, "email": email, "domain": domain}
#             )
#             return returner

#         print("USERRRR:", user)

#         if user is None:
#             message = "No user found"
#             returner = jsonify(
#                 {"message": message, "email": email, "domain": domain}
#             )
#             return returner
#     except Exception as e:

#         print("Exception from Loginfirst:", e)
#         pass

# except Exception as e:
#     # Handleother exceptions
#     print(e)
#     message = "Failed to create account"
#     return jsonify({"message": message})

# message ="User does not exist"
# returner = jsonify({"message": message, "email": email, "domain": domain})
# return returner
# from flask import request, jsonify


@app.route("/loginfirst", methods=["POST", "GET"])
def loginfirst():
    try:
        data = request.get_json(force=True)
        email = data.get("emailinput")
        domain = data.get("domaininput").lower()

        if not email or not domain:
            return jsonify({"message": "Email and domain are required"}), 400

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        print(user)

        if user:
            message = "Success email check"
            return jsonify({"message": message, "email": email, "domain": domain})

        else:
            message = "User does not exist"
            return jsonify({"message": message, "email": email, "domain": domain})

    except Exception as e:
        print("Exception from loginfirst:", e)
        return jsonify({"message": "Failed to process request"}), 500


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("emailinput")
    password = data.get("password")
    domain = data.get("domaininput").lower()
    domain_type_enum = string_to_enum(domain, DomainType)
    print(data)
    print(domain)

    try:
        if valid_credentials(email, password, domain_type_enum):

            is_valid, user_id = valid_credentials(email, password, domain_type_enum)
            if is_valid:
                refresh_token = create_refresh_token(identity=user_id)
                access_token = create_access_token(
                    identity=user_id, expires_delta=False
                )
                print(access_token)

                return (
                    jsonify(
                        {
                            "message": "Login Successful",
                            "email": email,
                            "domain": domain,
                            "access_token": access_token,
                            "refresh_token": refresh_token,
                        }
                    ),
                    200,
                )
            else:
                return jsonify({"error": "Invalid email, password, or domain"}), 401
        else:
            return jsonify({"error": "Invalid email, password, or domain"}), 401
    except Exception as e:
        # Check if the error is due to an invalid password
        if "INVALID_PASSWORD" in str(e):
            message = "Invalid password. Please try again."
        else:
            print(e)
            message = "Failed to login, please try again, invalid password"
            returner = {
                "message": message,
                "email": email,
                "domain": domain,
            }

            return jsonify({"message": message}), 404


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    frontend = request.get_json(force=True)
    current_user = get_jwt_identity()
    print("protected: ", current_user)
    return jsonify(logged_in_as=current_user), 200


@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user, fresh=15)
    print(new_token)
    return jsonify(access_token=new_token), 200


blacklist = set()


# Decorator to check if the token is revoked
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        if token in blacklist:
            return jsonify({"message": "Token is revoked!"}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"])
        except:
            return jsonify({"message": "Token is invalid!"}), 401

        return f(*args, **kwargs)

    return decorated


# Logout endpoint to revoke token
@app.route("/logout", methods=["POST"])
@token_required
def logout():
    token = request.headers.get("Authorization")
    blacklist.add(token)
    if token in blacklist:
        print("Token is revoked")
        return jsonify({"message": "Logout successful"}), 200
    else:
        return jsonify({"message": "Logout failed"}), 401


def valid_credentials(email, password, domain):
    try:
        cursor = conn.cursor()
        domain_str = domain.value
        query = """
        SELECT userid FROM users
        WHERE email = %s AND password = %s AND domain = %s::domain_type
        """
        cursor.execute(query, (email, password, domain_str))
        user = cursor.fetchone()
        cursor.close()
        if user:
            return True, user[0]  # Return both the validation result and the user ID
        else:
            return False, None

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error  ": "An internal server error occurred"}), 500


def string_to_enum(input_string: str, enum_class: Enum):
    for member in enum_class:
        if member.value == input_string:
            return member
    raise ValueError(f"{input_string} is not a valid value for {enum_class.__name__}")


# Get the Firestore credentials
# cred = credentials.Certificate("path/to/serviceAccountKey.json")
# firebase_admin.initialize_app(cred)

# # Get the Firestore client
# db = firestore.client()


# all the 5 image urls, how to display on main page and not new page
@app.route("/get_all_document_snapshot_by_user_id", methods=["GET"])
def getDocumentSnapshotFromFirestore():

    try:

        current_user_id = get_jwt_identity()

        conn = connect_to_db()
        # cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = "SELECT id, resumename, snapshot_location FROM resumes WHERE user_id = %s;"  # image must be embedded with id, parse id over to api and api fetch doc base on id
        # return doc url then display on main page
        cursor.execute(query, (current_user_id,))
        resume_ids = cursor.fetchall()

        cursor.close()
        conn.close()

        # Extracting just the IDs if needed or you can modify depending on your needs
        ids_only = [resume["id"] for resume in resume_ids]
        resumefirstpageonly = [resume["snapshot_location"] for resume in resume_ids]
        # TODOS - Add the snapshot location and resume name to the response

        return jsonify(ids_only), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to retrieve resume IDs from database"}), 500
    # try:
    #     current_user_id = get_jwt_identity()
    #     docs_ref = db.collection("users").document(current_user_id)
    #     docs = docs_ref.get()
    #     # get the resumeids from the userid
    #     images_info = []

    #     return jsonify(images_info), 200

    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     return jsonify({"error": "Failed to retrieve document from Firestore"}), 500


# dont have usage of this function
# @app.route("/get_all_document_url_by_user_id", methods=["GET"])
# def getDocumentFromFirestore():
#     try:
#         current_user_id = get_jwt_identity()
#         # cursor = conn.cursor()
#         # cursor.execute("SELECT * FROM resume WHERE userid = %i", (current_user_id,))
#         # firestore_link = cursor.fetchone()[0]
#         # cursor.close()

#         # Retrieve the item from Firestore
#         # doc_ref = db.document(firestore_link)
#         # document = doc_ref.get().to_dict()

#         doc_ref = db.collection("users").document(current_user_id)
#         doc = doc_ref.get()
#         if doc.exists:
#             document = doc.to_dict()
#             message = {
#                 "message": "Document retrieved successfully",
#                 "document": document,
#             }
#             return jsonify(message), 200

#         message = {"message": "Document does not exist"}
#         return jsonify(message), 200

#     except Exception as e:
#         print(f"An error occurred: {e}")
#         return jsonify({"error": "Failed to retrieve document from Firestore"}), 500


# parse me the documentID, then output the PDF url, display and able to click
@app.route("/get_document_url_by_document_and_user_id/:document_id", methods=["GET"])
def getDocumentFromFirestore(document_id):
    try:
        current_user_id = get_jwt_identity()

        conn = connect_to_db()
        # cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = "SELECT resumeid, resumename, file_location FROM resumes WHERE user_id = %s and resumeid = %s;"
        cursor.execute(query, (current_user_id, document_id))
        resume_ids = cursor.fetchall()

        cursor.close()
        conn.close()

        # Extracting just the IDs if needed or you can modify depending on your needs
        ids_only = [resume["resumeid"] for resume in resume_ids]
        resumename = [resume["resumename"] for resume in resume_ids]
        # TODOS - Add the file location and resume name to the response

        return (
            jsonify(
                {
                    "ids_only": ids_only,
                    "resumename ": resumename,
                    "file_location": file_location,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to retrieve document from Firestore"}), 500


# store resume, parse in from drag file, in doc format
@app.route("/upload_resume_and_link_to_user_id", methods=["POST"])
@jwt_required()
def store_resume():

    try:

        print("Upload resume and link to user id")
        # Assuming data is being sent in the request body as Base64 encoded string
        data = request.json.get(
            "data"
        )  # Correct usage of .get() without keyword arguments
        filename = request.json.get(
            "filename"
        )  # Correct usage of .get() without keyword arguments
        user_id = (
            get_jwt_identity()
        )  # Assuming this function returns the currently authenticated user's ID

        print(user_id)
        print("filename: ", filename)
        print("data: ", data)

        if not data or not user_id or not filename:
            return jsonify({"error": "Missing data"}), 400

        # Decode and convert PDF content to image
        pdf_content = base64.b64decode(data)
        print(pdf_content)
        snapshot_url = save_snapshot_of_resume_to_firestore(
            pdf_content, user_id, filename
        )

        # Connect to PostgreSQL database
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        # Insert resume data into the database
        query = """
        INSERT INTO resume (resumename, uploaddate, userid, file_location, snapshot_location)
        VALUES (%s, NOW(), %s, %s, %s)
        """
        cursor.execute(query, (filename, user_id, "pdf_url_placeholder", snapshot_url))

        conn.commit()
        cursor.close()
        conn.close()

        return (
            jsonify(
                {
                    "message": "Resume and snapshot stored successfully",
                    "file_location": "pdf_url_placeholder",  # Replace this with actual PDF URL if necessary
                    "snapshot_location": snapshot_url,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to store resume"}), 500


def save_snapshot_of_resume_to_firestore(pdf_content, user_id, filename):
    # bucket = storage.bucket(app=firebase_admin.get_app())
    # storage_client = storage.Client()

    # Convert PDF bytes to a PyMuPDF document
    pdf_doc = fitz.open("pdf", pdf_content)

    images_urls = []

    for page_num, page in enumerate(pdf_doc, start=1):
        pix = page.get_pixmap()
        img_byte_arr = io.BytesIO(pix.tobytes("png"))

        # Define a unique name for each image file including the page number to avoid overwriting
        image_filename = f"{user_id}/resume/{filename}_snapshot_{page_num}page.png"

        # Upload the image to Firebase Storage
        blob = bucket.blob(image_filename)
        blob.upload_from_file(img_byte_arr, content_type="image/png")
        blob.make_public()  # Make the image publicly accessible

        # Append the public URL of the image to the list
        images_urls.append(blob.public_url)
        print(images_urls)

    return images_urls
    # images = convert_from_bytes(pdf_content, first_page=1, last_page=1)
    # img_byte_arr = io.BytesIO()
    # images[0].save(img_byte_arr, format="JPEG")
    # img_byte_arr.seek(0)

    # # Upload converted image to Firebase Storage
    # bucket = storage.bucket()
    # snapshot_filename = f"{user_id}/{filename}_snapshot.jpg"
    # blob = bucket.blob(snapshot_filename)
    # blob.upload_from_file(img_byte_arr, content_type="image/jpeg")
    # blob.make_public()

    # return blob.public_url


@app.route("/applications", methods=["GET", "POST"])
@jwt_required()
def get_applications():
    print("Getting applications")
    try:
        user_id = get_jwt_identity()
        connection = connect_to_db()
        if connection:
            cursor = connection.cursor()
            cursor.execute(
                """
        SELECT 
           
            c.companyname, 
            cj.jobPostingTitle,
            cj.salary,
            afj.applicationTime, 
            afj.status,
            afj.applicationID
        FROM 
            applicationForJob afj
        JOIN 
            resume r ON afj.resumeID = r.resumeID
        JOIN 
            users u ON r.userID = u.userID
        JOIN 
            companyJobPostings cj ON afj.jobPostingID = cj.jobPostingID
        JOIN 
            companies c ON cj.companyid = c.companyID
        WHERE 
            u.userID = %s;
        """,
                (user_id,),
            )
            applications = cursor.fetchall()
            cursor.close()
            connection.close()

            # Format the data as JSON
            application_data = []
            for app in applications:
                application_data.append(
                    {
                        "companyname": app[0],
                        "jobPostingTitle": app[1],
                        "salary": app[2],
                        "applicationTime": app[3].isoformat(),
                        "status": app[4],
                        "applicationID": app[5],
                    }
                )

            return jsonify(application_data)
        else:
            refresh()
            return jsonify({"error": "Failed to connect to the database"}), 500
    except (Exception, Error) as error:
        print("Error fetching applications or identity:", error)
        return jsonify({"error": "Failed to fetch applications"}), 500


@app.route("/jobs", methods=["GET"])
def get_jobs():
    try:

        connection = connect_to_db()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT job.jobpostingid, job.jobpostingtitle, job.jobpostingposition, job.jobpostingdescription, 
                   job.companyID, job.salary, job.applicationclosingdate,
                   companies.companyname, companies.companylocation
            FROM companyJobPostings AS job
            INNER JOIN companies ON job.companyID = companies.companyid
        """
        )
        jobs = cursor.fetchall()

        print(jobs)
        # Format job data as JSON
        job_data = [
            {
                "id": job[0],
                "title": job[1],
                "position": job[2],
                "description": job[3],
                "companyID": job[4],
                "salary": job[5],
                "closingdate": job[6],
                "companyname": job[7],
                "location": job[8],
            }
            for job in jobs
        ]

        return jsonify(job_data)

    except Exception as e:
        print("Error fetching jobs:", e)
        return jsonify({"error": "Failed to fetch jobs"}), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/jobs/<int:jobId>", methods=["GET"])
def get_jobs_fromID(jobId):
    try:

        connection = connect_to_db()
        cursor = connection.cursor()
        cursor.execute(
            """
            SELECT job.jobpostingid, job.jobpostingtitle, job.jobpostingposition, job.jobpostingdescription, 
                   job.companyID, job.salary, job.applicationclosingdate,
                   companies.companyname, companies.companylocation
            FROM companyJobPostings AS job
            INNER JOIN companies ON job.companyID = companies.companyid
            WHERE job.jobpostingid = %s
            """,
            (jobId,),
        )
        jobs = cursor.fetchall()

        print(jobs)
        # Format job data as JSON
        if jobs:
            job_data = [
                {
                    "id": job[0],
                    "title": job[1],
                    "position": job[2],
                    "description": job[3],
                    "companyID": job[4],
                    "salary": job[5],
                    "closingdate": job[6],
                    "companyname": job[7],
                    "location": job[8],
                }
                for job in jobs
            ]
            return jsonify(job_data)
        else:
            return jsonify({"error": "Job not found"}), 404

    except Exception as e:
        print("Error fetching jobs:", e)
        return jsonify({"error": "Failed to fetch jobs"}), 500

    finally:
        cursor.close()
        connection.close()


# Define function to load documents from a specific folder
def load_docs_from_folder(folder):
    loader = DirectoryLoader(folder)
    documents = loader.load()
    return documents


def load_pdf(folder):
    loader = PyPDFLoader(folder)
    documents = loader.load()
    # pages = loader.load_and_split()
    # docs = loader.load_and_split()
    return documents


# Define function to randomly select resumes
def select_random_resumes(documents, num_resumes):
    selected_resumes = random.sample(documents, min(num_resumes, len(documents)))
    return selected_resumes


def analyze_resumes_with_qa_chain(resumes, qa_chain, desired_job_position):
    # concatenated_resumes = "\n\n".join(resumes)
    analysis = qa_chain.invoke(
        input={
            "question": f"Analyze these resumes targetting {desired_job_position} job position",
            "input_documents": resumes,
        }
    )
    return analysis


def generate_feedback_for_input_resume(
    input_resume, qa_chain, comparative_analysis, desired_job_position
):
    feedback = qa_chain.invoke(
        input={
            "question": f"Compare with the analysed resume: {comparative_analysis}, what improvements can be made to my resume to better target {desired_job_position} job position?",
            "input_documents": input_resume,
        }
    )

    # feedback = qa_chain.invoke(
    #     question=f"Based on industry standards and trends identified: {comparative_analysis}\n\nHow does this resume compare and improvements can be made?",
    #     context=input_analysis['answers']
    # )

    return feedback


# Define function to compare input resume with selected resumes and provide feedback
@app.route("/provide_resume_feedback", methods=["POST"])
def provide_resume_feedback(selected_resumes, chain):
    # Get user input for the desired job position
    # desired_job_position = input("Enter the desired job position: ")
    try:
        data = request.get_json()
        base64_data = data['data']
        input_resume = data['filename']
        desired_job_position = data['desired_job_position']

        file_content = base64.b64decode(base64_data)
        file_type = 'pdf' if inpuy_resume.endswith('.pdf') else 'docx'
        
        

        feedback = []
        # base_dir = '/'

        # document_to_check = os.path.join(base_dir, input_resume)
        docs = load_pdf(input_resume)

        chain.add_documents(selected_resumes)
        chain.set_question("Provide feedback on how these resumes match the job position: {desired_job_position}," +
                           "and if there is'nt a desired job position"+
                           
        )
        
        # chain.

        # for resume in selected_resumes:
        #     # answer = chain.run(question=docs, input_documents=[resume])
        #     answer = chain.invoke(input=docs, question="Feedback on resume:", input_documents=[resume])
        #     answer = chain.invoke()
        #     feedback.append(answer)
        # return feedback


    # Define directory containing all job position folders
    base_folder = "datasets/data/data/"


    # Construct the folder path for the desired job position
    # job_position_folder = os.path.join(base_folder, desired_job_position)
    job_position_folder = os.path.join(base_folder, desired_job_position.upper())
    print("Job position folder:", job_position_folder)  # test


    print("Loading documents from folder...")
    # Load documents from the specified folder
    documents = load_docs_from_folder(job_position_folder)
    print("Documents loaded successfully.")

    # Split documents into chunks
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)
    print("Documents split successfully.")

    # Create Chroma vector store
    print("Creating Chroma vector store...")
    db = Chroma.from_documents(documents=docs, embedding=embeddings)
    print("Chroma vector store created successfully.")

    # Load QA chain using the ChatOpenAI model
    print("Loading QA chain...")
    chain = load_qa_chain(llm, chain_type="stuff")
    print("QA chain loaded successfully.")

    # Get input resume from user
    # input_resume = input("Enter your resume here: ")
    # input_resume = load_pdf(input_resume)
    # print(input_resume)

    # Randomly select and compare resumes
    selected_resumes = select_random_resumes(documents, num_resumes=5)

    comparative_analysis = analyze_resumes_with_qa_chain(
        selected_resumes, chain, desired_job_position
    )
    feedback = generate_feedback_for_input_resume(
        input_resume, chain, comparative_analysis, desired_job_position
    )
    # feedback = provide_resume_feedback(selected_resumes, chain, input_resume)

    # Print feedback
    print("Feedback on your resume:")
    # print(feedback['summary'])

    # for i in feedback:
    #     print(f'{i} :{feedback[i]}')


    # print("\nDetailed Feedback:")
    # for detail in feedback['details']

    for i, fb in enumerate(feedback, 1):
        # print(f"Resume {i}: {fb}")
        print(f"{fb}: \n{feedback[fb]}")
        return jsonify(feedback)
        
    


@app.route("/upload_resume_by_id", methods=["POST"])
def upload_resume_by_id():
    try:
        user_id = get_jwt_identity()
        if user_id is None:
            return jsonify({"message": "User is not logged in"}), 401

        data = request.get_json()
        resume_id = data.get("resume_id")
        # Fetch the resume file path from the database using the resume ID
        # Replace the next line with the appropriate database query
        resume_path = fetch_resume_path_by_id(resume_id)

        if resume_path is None:
            return jsonify({"error": "Resume not found"}), 404

        # Save the resume file to the storage bucket
        initialize_app(cred, {"storageBucket": "aija-fyp.appspot.com"})
        bucket = storage.bucket()
        blob = bucket.blob(resume_path)
        with open(resume_path, "rb") as f:
            blob.upload_from_file(f)
        blob.make_public()

        # Optionally, you can save the uploaded resume URL to the database for future reference

        return (
            jsonify(
                {
                    "message": "Resume uploaded successfully",
                    "resume_url": blob.public_url,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to upload resume"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
