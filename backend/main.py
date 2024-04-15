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
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
)
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
CORS(app, supports_credentials=True)
app.secret_key = "68ea6a6ea2bb49c2b9d078604479ef4d"


# postgres connection
db_config = load_config()
conn = psycopg2.connect(**db_config)

# DATABASE_URI = "postgres://postgresql:46QFpRNpMtbi3hcuILnugH9RPGXle26o@dpg-coejlo8l5elc738a70n0-a.singapore-postgres.render.com/aija"
# DATABASE_URI = os.environ.get("DATABASE_URI")
# def connect_to_db():
#     try:
#         connection = psycopg2.connect(DATABASE_URI)
#         return connection
#     except (Exception, Error) as error:
#         print("Error while connecting to PostgreSQL", error)
#         return None


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


@app.route("/register", methods=["POST"])
def register():
    # Get user data from request
    user_data = request.json
    print("register flag")

    try:
        # Connect to the database
        conn = connect_to_db()
        cursor = conn.cursor()

        # Check if the user already exists
        cursor.execute(
            "SELECT email FROM users WHERE email = %s", (user_data["email"],)
        )
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({"error": "Email already exists"}), 400

        # Insert new user into the database
        cursor.execute(
            "INSERT INTO users (email, password, domain) VALUES (%s, %s, %s)",
            (user_data["email"], user_data["password"], user_data["domain"]),
        )
        conn.commit()

        return jsonify({"message": "User registered successfully"}), 201

    except Error as e:
        print(f"Error: {e}")
        return jsonify({"error": "Failed to register user"}), 500

    finally:
        # Close database connection
        if conn:
            cursor.close()
            conn.close()


@app.route("/loginfirst", methods=["POST"])
def loginfirst():
    try:
        data = request.get_json(force=True)
        email = data.get("emailinput")
        domain = data.get("domaininput").lower()
        domain_input = string_to_enum(domain, DomainType)
        print(domain_input)

        if not email or not domain_input.value:
            return jsonify({"message": "Email and domain are required"}), 400

        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        print("user:", user)

        if not user:
            message = "User does not exist"
            return jsonify(
                {"message": message, "email": email, "domain": domain_input.value}
            )

        # Check if the domain provided by the user matches the domain stored in the database
        print("user3", user[3])
        print("domain_input", domain_input.value)
        if user[3] != domain_input.value:
            message = "Incorrect domain for the email"
            return jsonify(
                {"message": message, "email": email, "domain": domain_input.value}
            )

        if user and user[3] == domain_input.value:
            message = "Success email check"
            return jsonify({"message": message})

        if not user and user[3] != domain_input.value:
            message = "Email and domain are required"
            return jsonify(
                {"message": message, "email": email, "domain": domain_input.value}
            )

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


# parse me the documentID, then output the PDF url, display and able to click  :document_id
@app.route("/get_document_url_by_document_and_user_id/", methods=["GET"])
@jwt_required()
def getDocumentFromFirestore():
    try:
        user_id = get_jwt_identity()
        print(user_id)

        conn = connect_to_db()
        cursor = conn.cursor()

        # query = "SELECT resumeid, resumename, file_location FROM resumes WHERE user_id = %s and resumeid = %s;"
        query = """
        SELECT resumeid, resumename, snapshot_location
        FROM resume
        WHERE userid = %s
        ORDER BY uploaddate DESC
        LIMIT 6;
        """
        cursor.execute(query, (user_id,))
        resume_ids = cursor.fetchall()
        print(resume_ids)

        cursor.close()
        conn.close()

        # TODOS - Add the file location and resume name to the response
        # Extract the first page URLs from the snapshot locations
        latest_snapshots = []

        for resume in resume_ids:
            # Assuming 'snapshot_location' is the third element in the tuple
            snapshot_urls = resume[2]
            if snapshot_urls:
                snapshot_urls = snapshot_urls.strip("{}").split(",")
                latest_snapshots.append(
                    {
                        "resume_id": resume[
                            0
                        ],  # Assuming 'resumeid' is the first element
                        "resume_name": resume[
                            1
                        ],  # Assuming 'resumename' is the second element
                        "first_page_snapshot": snapshot_urls[0]
                        .strip()
                        .replace('"', ""),
                    }
                )

        return jsonify(latest_snapshots=latest_snapshots), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "Failed to retrieve document from Firestore"}), 500


import re  # Import regular expression module


def extract_text_from_pdfv(file_location):
    """
    Extract text from a PDF file at the given location.
    """
    text_content = []
    with pdfplumber.open(file_location) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:  # Only add if text extraction was successful
                # Normalize text to prevent concatenation of words
                text = normalize_text(text)
                print(text)
                # Preprocess text to handle other issues
                text = preprocess_text(text)
                text_content.append(text)
    combined_text = "\n".join(text_content)
    return combined_text


def preprocess_text(text):
    """
    Preprocess extracted text to improve readability and prevent concatenation.
    """
    # Add space after non-alphanumeric characters and before uppercase letters
    text = re.sub(r"(?<=[^\w\s])", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    # Remove leading and trailing whitespace
    text = text.strip()
    return text


def normalize_text(text):
    """
    Normalize text by adding spaces between concatenated words based on certain rules.
    """
    # Add space between words if one word ends with a lowercase letter and the next word starts with an uppercase letter
    text = re.sub(r"(\w)([A-Z])", r"\1 \2", text)
    # Add space between words if one word ends with a lowercase letter or a digit and the next word starts with a digit
    text = re.sub(r"(\w|\d)(\d)", r"\1 \2", text)
    return text


from keybert import KeyBERT


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
        # print("data: ", data)

        if not data or not user_id or not filename:
            return jsonify({"error": "Missing data"}), 400

        # Decode and convert PDF content to image
        pdf_content = base64.b64decode(data)
        # print(pdf_content)
        snapshot_url = save_snapshot_of_resume_to_firestore(
            pdf_content, user_id, filename
        )

        pdf_filename = f"{user_id}/resumedoc/{filename}"
        blob = bucket.blob(pdf_filename)
        blob.upload_from_string(pdf_content, content_type="application/pdf")
        blob.make_public()
        pdf_url = blob.public_url

        # Connect to PostgreSQL database
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        # Insert resume id and resume data into the database
        query = """
        INSERT INTO resume (resumename, uploaddate, userid, file_location, snapshot_location)
        VALUES (%s, NOW(), %s, %s, %s)
        RETURNING resumeid, file_location
        """
        cursor.execute(query, (filename, user_id, pdf_url, snapshot_url))

        # Fetch the file location
        resume_id, file_location = cursor.fetchone()

        conn.commit()

        # Perform PDF text extraction
        # Save the PDF file into the /temp folder
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(pdf_content)
            temp_file_path = temp_file.name  # Get the path to the temporary file

        extracted_text = extract_text_from_pdfv(temp_file_path)
        os.remove(temp_file_path)

        # Extract keywords from the extracted text
        kw_model = KeyBERT(model="all-mpnet-base-v2")
        keywords = kw_model.extract_keywords(
            extracted_text,
            keyphrase_ngram_range=(1, 3),
            stop_words="english",
            highlight=False,
            top_n=20,
        )

        # Extracted skills from keywords
        extracted_skills = [keyword[0] for keyword in keywords]
        print(extracted_skills)

        # Separate words in the extracted skills
        # separated_skills = []
        # for skill in extracted_skills:
        #     # Split the skill on whitespace and punctuation
        #     words = re.findall(r"\w+", skill)
        #     # Tokenize each word to handle compound words
        #     tokenized_words = [word for word in words if word.isalpha()]
        #     separated_skills.extend(tokenized_words)

        # Insert extracted skills into the database
        for skill in extracted_skills:
            cursor.execute(
                "INSERT INTO skills (userid, resumeid, skillname, skilltype) VALUES (%s, %s, %s, %s)",
                (
                    user_id,
                    resume_id,
                    skill,
                    "hard",
                ),  # Assuming all extracted skills are considered hard skills
            )

        conn.commit()
        cursor.close()
        conn.close()

        return (
            jsonify(
                {
                    "message": "Resume and snapshot stored successfully",
                    "file_location": pdf_url,  # Replace this with actual PDF URL if necessary
                    "snapshot_location": snapshot_url,
                    "extracted_skills": extracted_skills,
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
            users u ON r.userid = u.userid
        JOIN 
            companyJobPostings cj ON afj.jobPostingID = cj.jobPostingID
        JOIN 
            companies c ON cj.companyid = c.companyID
        WHERE 
            r.userid = %s;
        """,
                (user_id,),
            )
            applications = cursor.fetchall()
            print("submitted applications: ", applications)
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


import psycopg2


def calculate_match_percentage(resume_id, job_id):
    db_config = load_config()
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    # Fetch the userID for the given resumeID
    cur.execute("SELECT userid FROM resume WHERE resumeid = %s", (resume_id,))
    user_id_result = cur.fetchone()
    if not user_id_result:
        print(f"No user found for resumeID {resume_id}")
        return 0
    user_id = user_id_result[0]

    # Fetch resume skills based on userID
    resume_skills_query = """
    SELECT skillname FROM skills WHERE userid = %s
    """
    cur.execute(resume_skills_query, (user_id,))
    resume_skills = cur.fetchall()
    resume_skill_set = {
        skill[0].lower() for skill in resume_skills
    }  # Normalize to lowercase

    # Fetch job required skills
    job_skills_query = """
    SELECT skillname FROM jobApplicationSkills WHERE jobPostingID = %s
    """
    cur.execute(job_skills_query, (job_id,))
    job_skills = cur.fetchall()
    job_skill_set = {skill[0].lower() for skill in job_skills}  # Normalize to lowercase

    # Match skills using %LIKE and calculate match percentage
    matched_skills_count = sum(
        1
        for skill in job_skill_set
        if any(skill in resume_skill for resume_skill in resume_skill_set)
    )
    match_percentage = (
        (matched_skills_count / len(job_skill_set)) * 100 if job_skill_set else 0
    )

    cur.close()
    conn.close()

    return match_percentage


@app.route("/jobsfetch", methods=["GET"])
def get_jobs():
    resume_id = request.args.get(
        "resume_id", type=int
    )  # Get resume_id from query parameters

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

        job_data = []
        for job in jobs:
            job_id = job[0]
            match_percentage = 0  # Default value if resume_id is not provided
            if resume_id:
                match_percentage = calculate_match_percentage(resume_id, job_id)

            job_data.append(
                {
                    "id": job_id,
                    "title": job[1],
                    "position": job[2],
                    "description": job[3],
                    "companyID": job[4],
                    "salary": job[5],
                    "closingdate": job[6],
                    "companyname": job[7],
                    "location": job[8],
                    "match_percentage": match_percentage,
                }
            )

        # Sort the jobs by match percentage in descending order, if resume_id was provided
        if resume_id:
            job_data.sort(key=lambda x: x["match_percentage"], reverse=True)

        return jsonify(job_data)
    except Exception as e:
        print(f"Error fetching jobs: {e}")
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


import datetime


@app.route("/submitapplications", methods=["POST"])
@jwt_required()
def submit_application():
    data = request.get_json()
    job_id = int(data.get("jobId"))  # Convert to integer
    resume_id = int(data.get("documentId"))  # Convert to integer

    # Connect to your PostgreSQL database
    connection = connect_to_db()
    cursor = connection.cursor()
    try:
        # Insert new application into the applicationForJob table
        cursor.execute(
            "INSERT INTO applicationForJob (applicationTime, status, resumeid, jobpostingid) VALUES (NOW(), %s, %s, %s) RETURNING applicationid;",
            ("Pending", resume_id, job_id),
        )
        application_id = cursor.fetchone()[0]  # Access first element of the tuple

        connection.commit()

        # Close the cursor and connection
        cursor.close()
        connection.close()

        return (
            jsonify(
                {
                    "message": "Application submitted successfully",
                    "applicationId": application_id,
                }
            ),
            201,
        )

    except Exception as e:
        # If an error occurs, rollback any changes and print the error
        connection.rollback()
        cursor.close()
        connection.close()
        print(e)
        return jsonify({"error": "Failed to submit application"}), 500


@app.route("/editprofile", methods=["POST"])
@jwt_required()
def editprofile():
    current_user = get_jwt_identity()
    profile_data = request.get_json()
    conn = connect_to_db()
    cursor = conn.cursor()

    print("Profile Data:", profile_data)

    try:

        # Check if the profile already exists
        cursor.execute("SELECT * FROM users WHERE userid = %s", (current_user,))
        profile_exists = cursor.fetchone()

        if profile_exists:
            # Update the existing profile
            update_query = """
                UPDATE users
                SET 
                    first_name = %s, 
                    last_name = %s, 
                    email = %s,
                    phone_number = %s,  
                    birth_date = %s, 
                    nationality = %s, 
                    street_number = %s, 
                    city = %s, 
                    postal_code = %s, 
                    country = %s
                WHERE userid = %s;
                """
            cursor.execute(
                update_query,
                (
                    profile_data["first_name"],
                    profile_data["last_name"],
                    profile_data["email_address"],
                    profile_data["phone_number"],
                    profile_data["birth_date"],
                    profile_data["nationality"],
                    profile_data["street_number"],
                    profile_data["city"],
                    profile_data["postal_code"],
                    profile_data["country"],
                    current_user,  # Assuming 'current_user' contains the user's ID to match against 'userid'
                ),
            )

        else:
            # Insert a new profile
            insert_query = """
            INSERT INTO user_profiles (first_name, last_name,email, phone_number, birth_date, nationality, street_number, city, postal_code, country)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
            cursor.execute(
                insert_query,
                (
                    current_user,
                    profile_data["first_name"],
                    profile_data["last_name"],
                    profile_data["email_address"],
                    profile_data["phone_number"],
                    profile_data["birth_date"],
                    profile_data["nationality"],
                    profile_data["street_number"],
                    profile_data["city"],
                    profile_data["postal_code"],
                    profile_data["country"],
                ),
            )

        conn.commit()

    except (Exception, psycopg2.Error) as error:
        conn.rollback()  # Roll back the transaction on error
        print("Error while connecting to PostgreSQL", error)
        return jsonify({"error": "An error occurred"}), 500

    finally:
        if conn:
            cursor.close()
            conn.close()

    return jsonify({"message": "Profile updated successfully"}), 200


@app.route("/get-user-profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    # Fetch the user ID from the JWT claim
    user_id = get_jwt_identity()

    connection = connect_to_db()
    cursor = connection.cursor()
    try:

        # Query to select user profile data
        query = "SELECT * FROM users WHERE userid = %s;"

        # Execute the query
        cursor.execute(query, (user_id,))

        # Fetch one record
        user_profile = cursor.fetchone()

        if user_profile:
            # Return the user profile as JSON
            return jsonify(user_profile), 200
        else:
            return jsonify({"error": "User profile not found"}), 404

    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
        return jsonify({"error": "Service unavailable"}), 503

    finally:
        # Closing the cursor and connection
        if connection:
            cursor.close()
            connection.close()
            print("PostgreSQL connection is closed")


import pdfplumber


def load_pdf(file_location):
    text_content = []
    with pdfplumber.open(file_location) as pdf:
        for page in pdf.pages:
            text_content.append(page.extract_text())
    # Combine text from all pages into a single string
    combined_text = "\n".join([text for text in text_content if text])
    print("load_pdf combined text", combined_text)
    return combined_text


import requests
import tempfile


def download_pdf(url):
    response = requests.get(url)
    if response.status_code == 200:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(response.content)
            print(f"Downloaded PDF path: {temp_file.name}")  # Debug print
            print(f"Type of local_file_path: {type(temp_file.name)}")  # Debug print
            return temp_file.name  # Confirming this is a string
    else:
        return None


# def load_docs_from_folder(folder):
#     # List all PDF files in the directory
#     pdf_files = [f for f in os.listdir(folder) if f.endswith(".pdf")]

#     textual_documents = []
#     for pdf_file in pdf_files:
#         pdf_path = os.path.join(folder, pdf_file)
#         try:
#             with pdfplumber.open(pdf_path) as pdf:
#                 text_content = []
#                 for page in pdf.pages:
#                     text_content.append(page.extract_text())
#                 # Combine text from all pages into a single string
#                 combined_text = "\n".join([text for text in text_content if text])
#                 textual_documents.append(combined_text)

#         except Exception as e:
#             print(f"Error processing {pdf_path}: {e}")

#     return textual_documents
import os


def load_docs_from_folder(folder):
    """
    List all PDF files in the directory and return their paths.
    """
    pdf_files = [
        os.path.join(folder, f) for f in os.listdir(folder) if f.endswith(".pdf")
    ]
    return pdf_files


def analyze_resumes_with_gpt(resumes, desired_job_position):
    """
    Analyze the given textual resumes with GPT-3.5, targeting a specific job position, Title: Resume Feedback Prompt


    """
    # Ensure 'resumes' is a list of strings (textual data)
    if not all(isinstance(resume, str) for resume in resumes):
        raise ValueError("All resumes must be provided as textual data (strings).")

    # Combine resumes into a single text for analysis
    combined_text = "\n\n".join(resumes)

    # Prepare the prompt for GPT-3.5
    prompt = f"Analyze these resumes targeting the {desired_job_position} job position, summarize your analysis of it into 500 words or less and return: {combined_text}"

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a highly intelligent AI capable of understanding and analyzing resumes.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )

    # Extract and return the GPT-3.5 response
    analysis = response.choices[0].message.content.strip()
    return analysis


# def generate_feedback_for_input_resume(
#     input_resume, qa_chain, comparative_analysis, desired_job_position
# ):
#     print("generate_feedback_for_input_resume")
#     print(
#         "generate_feedback_for_input_resume comparative analysis", comparative_analysis
#     )
#     print("generate_feedback_for_input_resume input res", input_resume)
#     feedback = qa_chain.invoke(
#         input={
#             "question": f"Compare with the analysed resume: {comparative_analysis}, what improvements can be made to my resume to better target {desired_job_position} job position?",
#             "input_documents": input_resume,
#         }
#     )
#     print("feedback", feedback)
#     return feedback

import re


def feedback_to_json(feedback):
    # Split the feedback into points using the digit-period pattern
    points = re.split(r"\n\d+\.\s\*\*", feedback)

    # Remove the first split since it will be empty
    points = points[1:]

    feedback_items = []

    for point in points:
        # Find the title and description within each point
        title_match = re.search(r"(.+?)\*\*", point)
        desc_match = re.search(r"\*\*(.+)", point)

        if title_match and desc_match:
            title = title_match.group(1).strip()
            description = desc_match.group(1).strip()

            feedback_items.append({"title": title, "description": description})

    return json.dumps(feedback_items, indent=4)


def generate_feedback_for_input_resume_gpt(
    input_resume, comparative_analysis, desired_job_position
):
    """
    Generate feedback for an input resume compared to a comparative analysis, targeting a specific job position.
    """
    # Prepare the prompt for GPT-3.5
    prompt = f"""
    Given the analysis: '{comparative_analysis}', compare with the input resume: '{input_resume}'. 
    What improvements can be made to the input resume to better target the {desired_job_position} job position?
    
     Please provide feedback on the following resume sections based on the given criteria feel free to add more. but it must be base off the current skill and experience of the resume. 
    Just compare what is good, like the wordings, not the achievements and skill levels:
    Important!!! Reccomendations on https://www.ntu.edu.sg/pace/programmes/fleximasters to get the IT role, GIVE A LINK TO THE JOB ROLE TO IMPROVE CANDIDATE
         1. **Summary**:
         - Evaluate the clarity and effectiveness of the summary in highlighting key strengths and career objectives.
         - Suggest alternative wordings or phrasing to enhance impact and engagement.
         - Ensure the summary provides a compelling introduction to the candidate's profile.

         2. **Name and Contact Information**:
            - Review the presentation of the candidate's name and contact details.
            - Is there a professional email address and phone number? Is there a linkedin profile? Are there github repositories for IT people?

         3. **Academic Background**:
         - Review the presentation of academic qualifications and educational institutions.
         - Recommend improvements in highlighting relevant coursework, projects, or academic achievements.
         - Ensure consistency in formatting and clarity in presenting academic credentials.

         4. **Work Experience**:
         - Assess the clarity and specificity of job descriptions and responsibilities.
         - Provide suggestions for enhancing the impact of accomplishments and results achieved.
         - Recommend alternative language or phrasing to better reflect the candidate's contributions and achievements.

         5. **Skills and Expertise**:
         - Review the technical skills section to ensure it accurately reflects your current expertise.
         - Evaluate the effectiveness of the skills section in showcasing relevant technical proficiencies and competencies.
         - Recommend additional skills or technologies to include based on the candidate's experience and industry standards.
         - Suggest alternative terminology or keywords to improve searchability and alignment with job requirements.

         6. **Projects and Achievements**:
         - Review the presentation of notable projects, initiatives, or achievements.
         - Assess the clarity and specificity of project descriptions and outcomes.
         - Provide suggestions for quantifying achievements and highlighting measurable results.

         7. **Certifications and Professional Development**:
         - Evaluate the inclusion of relevant certifications, training programs, or professional development activities.
         - Recommend additional certifications or training opportunities to enhance the candidate's qualifications.
         - Provide guidance on formatting and presentation for maximum impact.
         - Please do not ask a bachelor degree person to put a masters degree in IT, it is not relevant, everything must be within their current skill and experience

         8. **Internships/Work Experiences**:
         - Rephrase using powerful language, emphasizing accomplishments.
         - Ensure there are 2-3 impactful key points for each internship.
         - Quantify results where possible (e.g., "Increased sales by 20%"), give examples 
         - Check for any missing details or inconsistencies.
         - Highlight achievements and responsibilities clearly.
          - if you going to ask to rephrase. which part from the current resume and why? give examples

         9. **Work Experience**:
         - Rephrase using strong, action-oriented language.
         - Highlight achievements and quantify results where possible.
         - Ensure the resume aligns with the desired job position.
         - Check for any missing or irrelevant information.
         - Suggest including relevant skills and experiences.
         - if you going to ask to rephrase. which part from the current resume and why? give examples

         10. **Additional Sections (if applicable)**:
         - Assess the relevance and effectiveness of any additional sections, such as volunteer experience, publications, or languages spoken.
         - Provide suggestions for improving the organization and presentation of additional information.

         Feedback Criteria:
         - Formatting: Check for proper formatting and layout.
         - Word Choice: Ensure appropriate word choice and technical terminology.
         - Summary Length: Confirm the summary is within the specified word count.
         - Completeness: Ensure all relevant information is included.
         - Clear Contact Information: Verify contact details are clear and easily accessible.
         - Measurable Results: Highlight achievements with measurable results.
         - Typos: Check for any spelling or grammatical errors.
         - Consistency: Ensure consistent formatting and language throughout the resume.
         - Give Examples: Provide specific examples or suggestions for improvement like
         " Your resume has this ".." It will be good if you can change to this "..", while referencing what we have in the current resume, 
           reference the section to change too by the way. This is not needed always.. only when you see something that needs change .
         - Please. everything should be what is in the input resume. do
        - dont give me - **Feedback**: 
        - return in this format for headers          1. **Summary**:
        - find out which https://www.ntu.edu.sg/pace/programmes/fleximasters program this candidate can take to improve their chances of getting the IT role 
        
         Example:
         Summary:
         Original: [Provide the original summary here]
         Feedback: [Provide feedback on grammar, word choice, and length]
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a highly intelligent AI capable of providing constructive feedback and specific feedback on resumes.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )

    # Extract and return the GPT-3.5 response
    # print("gpt response", response)
    feedback = response.choices[0].message.content.strip()
    # feedback = feedback_to_json(feedback)
    return feedback


# Define function to randomly select resumes
# def select_random_resumes_filever(documents, num_resumes=2):
#     selected_resumes = random.sample(documents, min(num_resumes, len(documents)))
#     return selected_resumes


import random

import pdfplumber


def extract_text_from_pdf(pdf_path):
    """
    Extract text from a single PDF file.
    """
    text_content = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:  # Only add if text extraction was successful
                text_content.append(text)
    combined_text = "\n".join(text_content)
    return combined_text


def select_random_resumes(pdf_paths, num_resumes):
    """
    Randomly select PDF files, convert them to text, and return the textual content.
    """
    selected_paths = random.sample(pdf_paths, min(num_resumes, len(pdf_paths)))
    selected_texts = [extract_text_from_pdf(path) for path in selected_paths]
    return selected_texts


from openai import OpenAI

client = OpenAI(
    # defaults to os.environ.get("OPENAI_API_KEY")
    api_key="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",
)


def summarize_text(prompt):

    system_msg = (
        "You are a helpful assistant who is great at summarizing large amounts of text."
    )
    user_msg = (
        "Summarize and analyse on the good points in the resumes, eg They are using good keywords. Use your own judgement on why it is good: "
        + prompt
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": system_msg},
            {"role": "assistant", "content": user_msg},
        ],
        temperature=0,
    )

    return response.choices[0].message.content.strip()


# def summarize_text(text):
#     # Set messages for GPT API call
#     system_msg = (
#         "You are a helpful assistant who is great at summarizing large amounts of text."
#     )
#     user_msg = "Summarize the following text: " + text

#     # Summarize the text
#     response = openai.ChatCompletion.create(
#         model="gpt-3.5-turbo",

#         messages=[
#             {"role": "system", "content": system_msg},
#             {"role": "user", "content": user_msg},
#         ],
#         temperature=0,
#     )

#     # Get the summary from the response
#     summary = response["choices"][0]["message"]["content"]
#     return summary


# Define function to compare input resume with selected resumes and provide feedback
@app.route("/provide_resume_feedback", methods=["POST"])
@jwt_required()
def provide_resume_feedback():
    try:
        data = request.get_json()
        documentId = data["documentId"]
        selectedJobPosition = data["selectedJobPosition"]
        print(selectedJobPosition)

        print("Document ID:", documentId)
        print("Selected Job Position:", selectedJobPosition)

        conn = connect_to_db()
        cursor = conn.cursor()

        query = "SELECT file_location FROM resume WHERE resumeid = %s"
        cursor.execute(query, (documentId,))
        selected_resume = cursor.fetchone()  # Fetch a single tuple

        print("Selected Resume:", selected_resume)

        if selected_resume is None:
            print("No resume found with the given resumeid")
            return jsonify({"error": "No resume found with the given resumeid"}), 404

        file_location = selected_resume[0]
        print("File Location:", file_location)

        local_file_path = download_pdf(file_location)
        if local_file_path:
            print("File downloaded to:", local_file_path)
            # Load the PDF from the path
            pdf_content = load_pdf(local_file_path)
            # Continue with your logic
        else:
            print("Failed to download the PDF file")

        docs = load_pdf(local_file_path)
        # print("docs", docs)

        # Load QA chain using the ChatOpenAI model
        print("Loading QA chain...")
        chain = load_qa_chain(llm, chain_type="stuff")
        print("chain", chain)

        # Define directory containing all job position folders
        base_folder = "datasets/data/data/"
        job_position_folder = os.path.join(base_folder, selectedJobPosition.upper())
        print("Job Position Folder:", job_position_folder)

        documents = load_docs_from_folder(job_position_folder)
        # print("documents", documents) #printed a lot of random text from resume

        # Randomly select and compare resumes
        selected_resumes = select_random_resumes(documents, 2)
        # select_resumes_filever = select_random_resumes_filever(documents, num_resumes=2)
        # print("selected_resumes", selected_resumes)

        # Now, let's iterate through each resume's text and summarize
        for idx, resume_text in enumerate(selected_resumes, 1):
            summary = summarize_text(resume_text)
            print(f"Summary of Resume {idx}:\n{summary}\n\n")

        # combined_resumes_text = "\n\n".join(documents)

        # Now you can split the combined docs into chunks for processing
        # text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        # text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        # pages = text_splitter.split_text(select_resumes_filever)

        # text_splitter = RecursiveCharacterTextSplitter(
        #     chunk_size=1000, chunk_overlap=100
        # )
        # texts = text_splitter.split_documents(pages)

        # docs_chunks = text_splitter.split_documents([combined_resumes_text])
        # print("docs_chunks", docs_chunks)
        # docs_combined = "\n\n".join(docs_chunks)
        # print("docs_combined", docs_combined)

        # Now 'docs_combined' is ready for summarization or any other text-based analysis
        summarized_docs = summarize_text(summary)
        print(summarized_docs)

        print(
            "Content of document (if applicable):", selected_resumes[:100]
        )  # Print first 100 characters for a sanity check
        selected_resumes = [pdf_content]  # Convert to a list of strings if needed
        # print("Selected Resumes:", selected_resumes)

        print("Type of document being analyzed:", type(selected_resumes))
        print(
            "Content of document (if applicable):", selected_resumes[:100]
        )  # Print first 100 characters for a sanity check

        print("chain", chain)
        print("selectedJobPosition", selectedJobPosition)
        comparative_analysis = analyze_resumes_with_gpt(
            summarized_docs, selectedJobPosition
        )

        print("Comparative Analysis:", comparative_analysis)
        print("Type of document being generated:", type(summarized_docs))
        print("Content of document (if applicable):", summarized_docs[:100])
        print("docs", docs)
        feedback = generate_feedback_for_input_resume_gpt(
            docs, comparative_analysis, selectedJobPosition
        )
        print("Feedback:", feedback)
        cursor.close()
        conn.close()

        return jsonify(feedback)

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An error occurred processing your request"}), 500


@app.route("/get_snapshots_by_user_id", methods=["POST"])
@jwt_required()
def get_snapshots_by_user_id():
    # The user's identity can be retrieved from the JWT token
    current_user_id = get_jwt_identity()
    data = request.get_json()
    documentId = data["documentId"]
    print(current_user_id)

    try:
        # Connect to the database
        connection = connect_to_db()
        cursor = connection.cursor()

        # Query to retrieve the snapshot URLs from the database
        cursor.execute(
            "SELECT resumeid, resumename, snapshot_location FROM resume WHERE userid = %s AND resumeid = %s;",
            (current_user_id, documentId),
        )

        # Fetch all resume records for the user
        resumes = cursor.fetchall()
        print(resumes)

        # Create a list to hold the snapshots information
        snapshots = []
        for resume in resumes:
            # Assuming the snapshot URLs are stored as a string in snapshot_location
            # Splitting the string into a list of URLs
            snapshot_urls = resume[2].split(",")  # Or use the correct delimiter

            # Append the snapshot info to the list
            snapshots.append(
                {
                    "resume_id": resume[0],
                    "resume_name": resume[1],
                    "snapshot_urls": snapshot_urls,
                }
            )
        print(snapshots)

        # Close the cursor and connection
        cursor.close()
        connection.close()

        # Return the snapshots information as JSON
        return jsonify({"snapshots": snapshots}), 200

    except Exception as e:
        print(f"An error occurred while fetching snapshots: {e}")
        return jsonify({"error": "An error occurred while fetching snapshots"}), 500


@app.route("/get-events", methods=["GET"])
@jwt_required()
def get_events():
    try:
        # Retrieve the current user's ID from the JWT token
        current_user_id = get_jwt_identity()

        # Connect to the database
        connection = connect_to_db()
        cursor = connection.cursor()

        # Query to retrieve events created by the user
        cursor.execute("SELECT * FROM events WHERE userid = %s;", (current_user_id,))

        # Fetch all event records for the user
        events = cursor.fetchall()

        # Construct a list of dictionaries with event details
        events_data = []
        for event in events:
            event_dict = {
                "event_id": event[0],
                "company_id": event[1],
                "event_name": event[2],
                "event_description": event[3],
                "event_date": event[4],
                "event_location": event[5],
                "created_at": event[7],
                "updated_at": event[8],
                "is_active": event[9],
            }
            events_data.append(event_dict)

        print(events_data)

        cursor.close()
        connection.close()

        # Return the event data as JSON
        return jsonify(events_data), 200

    except Exception as e:
        print(f"An error occurred while fetching events: {e}")
        return jsonify({"error": "An error occurred while fetching events"}), 500


import psycopg2
from config import load_config


def find_matching_jobs(resume_id):
    db_config = load_config()
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    # Query to find skills for the given resume
    resume_skills_query = """
    SELECT skillname
    FROM skills
    WHERE userID = (
        SELECT userID FROM resume WHERE resumeID = %s
    )
    """
    cur.execute(resume_skills_query, (resume_id,))
    resume_skills = cur.fetchall()
    resume_skill_set = {
        skill[0].lower() for skill in resume_skills
    }  # Convert skills to lowercase

    # Query to get job postings and their required skills
    job_skills_query = "SELECT jobPostingID, skillname FROM jobApplicationSkills"
    cur.execute(job_skills_query)
    job_skills = cur.fetchall()

    job_requirements = {}
    for job_id, skill in job_skills:
        skill_lower = skill.lower()  # Convert skills to lowercase
        if job_id not in job_requirements:
            job_requirements[job_id] = set()
        job_requirements[job_id].add(skill_lower)

    job_match_percentage = {}
    for job_id, required_skills in job_requirements.items():
        matched_skills = resume_skill_set.intersection(required_skills)
        match_percentage = (
            (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0
        )
        job_match_percentage[job_id] = match_percentage

    sorted_job_matches = sorted(
        job_match_percentage.items(), key=lambda x: x[1], reverse=True
    )

    # Fetch job posting titles and company names
    job_ids = [job_id for job_id, _ in sorted_job_matches]
    job_info_dict = {}
    if job_ids:
        placeholders = ", ".join(["%s"] * len(job_ids))
        job_titles_query = f"""
        SELECT cjp.jobPostingID, cjp.jobPostingTitle, cmp.companyname
        FROM companyJobPostings cjp
        JOIN companies cmp ON cjp.companyid = cmp.companyID
        WHERE cjp.jobPostingID IN ({placeholders})
        """
        cur.execute(job_titles_query, tuple(job_ids))
        job_titles_companies = cur.fetchall()
        job_info_dict = {
            job_id: {"title": title, "company": company}
            for job_id, title, company in job_titles_companies
        }

    cur.close()
    conn.close()

    return sorted_job_matches, job_info_dict


def get_matching_jobs(resume_id):
    try:
        sorted_job_matches, job_info_dict = find_matching_jobs(resume_id)
        result = []
        for job_id, match_percentage in sorted_job_matches:
            job_title, company_name = job_info_dict.get(job_id, ("Unknown", "Unknown"))
            result.append(
                {
                    "job_title": job_title,
                    "company_name": company_name,
                    "match_percentage": match_percentage,
                }
            )
        return result
    except Exception as e:
        return []


# @app.route("/matchjobs", methods=["GET"])
# def match_jobs(resume_id):
#     sorted_job_matches, job_info_dict = find_matching_jobs(resume_id)
#     # Format and return the data as JSON
#     matches = [
#         {
#             "jobId": job_id,
#             "matchPercentage": match_percentage,
#             "title": job_info_dict[job_id]["title"],
#             "company": job_info_dict[job_id]["company"],
#         }
#         for job_id, match_percentage in sorted_job_matches
#     ]

#     return jsonify(matches)


@app.route("/recruiter-applications", methods=["GET"])
@jwt_required()
def get_recruiter_applications():
    # Connect to the database
    current_user_id = get_jwt_identity()

    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute(
        """
    SELECT 
        cjp.jobpostingid, 
        cjp.jobpostingtitle, 
        cjp.jobpostingposition, 
        cjp.jobpostingdescription, 
        cjp.companyid, 
        cjp.salary, 
        cjp.applicationclosingdate, 
        comp.companyname, 
        comp.companylocation,
        COUNT(afj.applicationid) AS application_count
    FROM 
        companyJobPostings AS cjp
    INNER JOIN 
        companies AS comp ON cjp.companyid = comp.companyid
    LEFT JOIN 
        applicationForJob AS afj ON cjp.jobpostingid = afj.jobpostingid
    INNER JOIN
        users AS u ON u.companyid = cjp.companyid
    WHERE
        u.userid = %s
    GROUP BY
        cjp.jobpostingid, 
        cjp.jobpostingtitle, 
        cjp.jobpostingposition, 
        cjp.jobpostingdescription, 
        cjp.companyid, 
        cjp.salary, 
        cjp.applicationclosingdate, 
        comp.companyname, 
        comp.companylocation;

    """,
        (current_user_id,),
    )
    applications = cursor.fetchall()
    print(applications)
    cursor.close()
    conn.close()

    # Format the data for JSON response
    applications_list = []
    for app in applications:
        application_count = (
            app[9] if len(app) > 9 else 0
        )  # Corrected index for application_count
        applications_list.append(
            {
                "jobPostingId": app[0],
                "jobPostingTitle": app[1],
                "jobPostingPosition": app[2],
                "jobpostingdescription": app[3],
                "companyid": app[4],
                "salary": app[5],  # Corrected index for salary
                "applicationclosingdate": app[
                    6
                ],  # Corrected index for applicationclosingdate
                "companyname": app[7],  # Corrected index for companyName
                "companylocation": app[8],  # Corrected index for companyLocation
                "applicationCount": application_count,
            }
        )

    print(applications_list)
    return jsonify(applications_list)


import datetime


@app.route("/recruiter/jobsfetch", methods=["GET"])
def get_jobs_recruiter():
    try:
        connection = connect_to_db()
        cursor = connection.cursor()

        # Query to fetch jobs with application closing date greater than today, sorted by upload date
        query = """
        SELECT job.jobpostingid, job.jobpostingtitle, job.jobpostingposition, job.jobpostingdescription,
               job.companyID, job.salary, job.applicationclosingdate,
               companies.companyname, companies.companylocation, job.uploaddate
        FROM companyJobPostings AS job
        INNER JOIN companies ON job.companyID = companies.companyid
        WHERE job.applicationclosingdate > CURRENT_DATE
        ORDER BY job.uploaddate ASC  
        """
        cursor.execute(query)
        jobs = cursor.fetchall()

        job_data = [
            {
                "id": job[0],
                "title": job[1],
                "position": job[2],
                "description": job[3],
                "companyID": job[4],
                "salary": job[5],
                "closingdate": job[6].isoformat() if job[6] else None,
                "companyname": job[7],
                "location": job[8],
                "uploaddate": job[9].isoformat() if job[9] else None,
            }
            for job in jobs
        ]

        return jsonify(job_data)
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return jsonify({"error": "Failed to fetch jobs"}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route("/recruiter/jobscreate", methods=["POST"])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    data = request.json
    try:
        connection = connect_to_db()
        cursor = connection.cursor()

        # Fetch the company ID associated with the current user
        cursor.execute(
            "SELECT companyid FROM users WHERE userid = %s", (current_user_id,)
        )
        company_id = cursor.fetchone()
        if not company_id:
            return jsonify({"error": "Company not found for the user"}), 404

        # Insert new job posting
        query = """
            INSERT INTO companyJobPostings (
            jobpostingtitle, jobpostingposition, jobpostingdescription,
            companyID, salary, applicationclosingdate, uploaddate)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(
            query,
            (
                data["title"],
                data["position"],
                data["description"],
                company_id[0],
                data["salary"],
                data["closingDate"],
            ),
        )
        connection.commit()

        jobpostingid = cursor.lastrowid  # Get the ID of the last inserted row
        print(jobpostingid)
        return (
            jsonify(
                {"message": "Job created successfully", "jobpostingid": jobpostingid}
            ),
            200,
        )

    except Exception as e:
        connection.rollback()  # Rollback the transaction on error
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()

    # Flask API endpoint


@app.route("/recruiter-applicants-view/<int:job_id>")
def get_applicants(job_id):
    try:
        # Establish connection to the database
        connection = connect_to_db()

        # Create a cursor object
        cursor = connection.cursor()

        # Fetch applicants for the specified job ID from the database
        cursor.execute(
            f"SELECT u.first_name, u.last_name, u.email, r.resumename, r.uploaddate, r.file_location FROM applicationforjob a "
            f"JOIN resume r ON a.resumeid = r.resumeid "
            f"JOIN users u ON r.userid = u.userid "
            f"WHERE a.jobpostingid = {job_id}"
        )

        # Fetch all rows
        applicants_data = cursor.fetchall()
        print(applicants_data)

        # Close the cursor and connection
        cursor.close()
        connection.close()

        # Convert fetched data into a list of dictionaries
        applicants = []
        for row in applicants_data:
            applicant = {
                "name": f"{row[0]} {row[1]}",
                "email": row[2],
                "resume_name": row[3],
                "upload_date": row[4].isoformat(),
                "resume_location": row[5],
            }
            applicants.append(applicant)

        # Return the applicants data as JSON
        return jsonify(applicants)

    except psycopg2.Error as e:
        print(f"Error fetching applicants: {e}")
        return jsonify({"error": "Failed to fetch applicants"}), 500


from google.cloud import storage


def generate_signed_url(bucket_name, blob_name, expiration=3600):
    """
    Generate a signed URL for the specified blob with the given expiration time (in seconds).
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    # Generate the signed URL
    signed_url = blob.generate_signed_url(
        version="v4", expiration=expiration, method="GET"
    )

    return signed_url


if __name__ == "__main__":
    app.run(debug=True, port=5000)
