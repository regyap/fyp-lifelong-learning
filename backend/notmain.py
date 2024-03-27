from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from flask import Flask
import firebase_admin
from firebase_admin import db, credentials, auth, initialize_app, storage
import pyrebase
import PyPDF2
import json
import psycopg2
from config import load_config


app = Flask(__name__)

CORS(app)

# need to generate a secret key
app.secret_key = "68ea6a6ea2bb49c2b9d078604479ef4d"

# Connection to database
db_config = load_config()
conn = psycopg2.connect(**db_config)

# Insturctions for GPT-3.5
personality_instruction = (
    "You are a professional resume editor "
    + ", please copy the sentence you are rewriting and write your own version underneath for me, a student"
)


############################################################################################################
# Authentication of email existence and domain
############################################################################################################
# 1. User enters email and domain
# 2. Check if user exists in database
# 3. If user exists, return message to frontend

cred = credentials.Certificate("admin_creds.json")
default_app = firebase_admin.initialize_app(cred)


@app.route("/loginfirst", methods=["GET", "POST"])
def loginfirst():  # enteremail
    config = {
        "apiKey": "AIzaSyAxpHIeCD8TuJq3sXl0tZ5BRU4vLz0aE_A",
        "authDomain": "aija-fyp.firebaseapp.com",
        "projectId": "aija-fyp",
        "storageBucket": "aija-fyp.appspot.com",
        "messagingSenderId": "352366658959",
        "appId": "1:352366658959:web:58632730c5182ca745b7fa",
        "databaseURL": "https://user.firebaseio.com/",
    }
    # firebase = pyrebase.initialize_app(config)
    # auth = firebase.auth()

    try:
        # Initialize Firebase app if not initialized
        # if not firebase.initialized:
        #     firebase = pyrebase.initialize_app(config)
        #     auth = firebase.auth()

        email = request.get_json(force=True)["emailinput"]
        domain = request.get_json(force=True)["domaininput"]
        try:
            print("email:", email)
            # if user exists in db before keying in password
            # login = auth.sign_in_with_email_and_password(email, "test123")
            # print("login:", login)
            user = auth.get_user_by_email(email)
            print("user:", user.uid)

            if user:
                message = "Suceess email check"

                returner = jsonify(
                    {"message": message, "email": email, "domain": domain}
                )
                return returner

            print("USERRRR:", user)

            message = "User exists"
            returner = jsonify({"message": message, "email": email, "domain": domain})
            return returner
        except Exception as e:
            # User does not exist, proceed with sign-up
            print("Exception from Loginfirst:", e)
            pass

    except Exception as e:
        # Handleother exceptions
        print(e)
        message = "Failed to create account"
        return jsonify({"message": message})

    message = "User does not exist"
    returner = jsonify({"message": message, "email": email, "domain": domain})
    return returner


############################################################################################################
# Authentication of email existence and doman and password using JWT
############################################################################################################
# 1. User enters email and domain and password
# 2. Sign in with email and password
# 3. Return JWT token to frontend and domain type to frontend
# 4. Frontend enters JWT token into local storage


@app.route("/login", methods=["GET", "POST"])
def login():
    config = {
        "apiKey": "AIzaSyAxpHIeCD8TuJq3sXl0tZ5BRU4vLz0aE_A",
        "authDomain": "aija-fyp.firebaseapp.com",
        "projectId": "aija-fyp",
        "storageBucket": "aija-fyp.appspot.com",
        "messagingSenderId": "352366658959",
        "appId": "1:352366658959:web:58632730c5182ca745b7fa",
        "databaseURL": "https://user.firebaseio.com/",
    }
    firebase = pyrebase.initialize_app(config)
    auth = firebase.auth()

    print("Enter login")
    try:
        returner = {
            "message": "",
            "email": "Null",
            "password": "Null",
            "domain": "Null",
        }
        email = request.get_json(force=True)["emailinput"]
        password = request.get_json(force=True)["password"]
        domain = request.get_json(force=True)["domaininput"]
        print("Email password domain from login:", email, password, domain)
        try:
            login = auth.sign_in_with_email_and_password(email, password)
            session["user"] = email
            session["domain"] = domain
            session["login"] = login

            if login:
                message = "Login Successful"
                returner = {
                    "message": message,
                    "email": email,
                    "domain": domain,
                }
                return jsonify(returner)

            # except request.exceptions.HTTPError as e:
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
    except Exception as e:
        # Handleother exceptions
        print("Other Exceptions: ", e)
        message = "Failed to login, please try again."
        returner = {
            "message": message,
            "email": "Null",
            "domain": "Null",
        }
        return jsonify(returner)

    return jsonify(returner)


############################################################################################################
# Making a new account
############################################################################################################


@app.route("/signup", methods=["GET", "POST"])
def register():

    if "user" in session:
        return jsonify({"message": "User is already logged in", "status": 200})

    config = {
        "apiKey": "AIzaSyAxpHIeCD8TuJq3sXl0tZ5BRU4vLz0aE_A",
        "authDomain": "aija-fyp.firebaseapp.com",
        "projectId": "aija-fyp",
        "storageBucket": "aija-fyp.appspot.com",
        "messagingSenderId": "352366658959",
        "appId": "1:352366658959:web:58632730c5182ca745b7fa",
        "databaseURL": "https://user.firebaseio.com/",
    }
    firebase = pyrebase.initialize_app(config)
    auth = firebase.auth()

    try:
        email = request.get_json(force=True)["email"]
        password = request.get_json(force=True)["password"]
        domain = request.get_json(force=True)["domain"]
        try:
            # if user already exists
            user = auth.get_account_info(email)
            message = "User already exists"
            return jsonify({"message": message})

        # if user has already signed up
        # email verification

        except:
            pass

        auth.send_email_verification(user["idToken"])
        user = auth.create_user_with_email_and_password(email, password)

    except:
        message = "Failed to create account"
        return jsonify({"message": message})


@app.route("/logout")
def logout():
    # Check if the user is logged in by checking if a session variable is set
    if "user" in session:
        # Clear the session
        session.clear()
        return "Logged out successfully"
    else:
        return "User is not logged in"


@app.route("/api/loginvalidation", methods=["POST"])
def login_validation():
    emailinput = request.get_json(force=True)["emailinput"]
    domaininput = request.get_json(force=True)["domaininput"]

    return jsonify({"emailinput": emailinput, domaininput: "domain"})


@app.route("/storeresume", methods=["POST"])
def storeresume():
    f = open("credentials.json", "r")

    data = json.loads(f.read())

    # firebase = pyrebase.initialize_app(config)
    cred = credentials.Certificate(data)
    initialize_app(cred, {"storageBucket": "aija-fyp.appspot.com"})
    # storage = firebase.storage()
    my_image = "./documents/resumes/logoblack.png"

    filename = my_image.split("/")[-1]

    # Upload Image
    # storage.child(my_image).put(my_image)
    bucket = storage.bucket()
    blob = bucket.blob("resumes/" + filename)
    blob.upload_from_filename(my_image)

    blob.make_public()

    print(blob.public_url)

    # store resume in userdb
    # Check if the user is logged in by checking if a session variable is set
    if "login" in session:
        login = session["login"]

        # Now you have access to the user's email and domain
        info = auth.get_account_info(login["idToken"])  # shows last password update
        # Your code to store the resume
        # ...

        return jsonify({"message": "Resume stored successfully"})
    else:
        return jsonify({"message": "User is not logged in"})

    return jsonify


@app.route("/images/<user_id>")
def get_user_images(user_id):
    docs = db.collection("yourCollectionName").where("userId", "==", user_id).stream()

    images_list = []
    for doc in docs:
        doc_data = doc.to_dict()
        images_list.append(doc_data.get("imageUrl", "No image URL"))

    return jsonify(images_list)


############################################################################################################
##          Student            ###################################################################################
############################################################################################################


############################################################################################################
# Resume Analysis
############################################################################################################
# 1. Upload resume
# 2. Extract text from resume using Chatgpt
# 3. Extract keywords from resume
# 4. Return keywords to frontend
# 5. User selects keywords to rewrite
# 6. User rewrites keywords
# 7. User submits rewritten keywords
# 8. User receives rewritten resume


############################################################################################################
# Match to Job Description (Students)
############################################################################################################


############################################################################################################
##          Recruiter           ######################################################################################
############################################################################################################


############################################################################################################
# Match to Job Description (Recruiters)
############################################################################################################


if __name__ == "__main__":
    app.run(debug=True, port=5000)
