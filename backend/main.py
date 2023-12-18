from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask import Flask
import PyPDF2

import firebase_admin
from firebase_admin import db, credentials

cred = credentials.Certificate("credentials.json")
firebase_admin.initialize_app(
    cred,
    {
        "databaseURL": "https://console.firebase.google.com/project/aija-fyp/database/aija-fyp-default-rtdb/data/~2F"
    },
)


app = Flask(__name__)

CORS(app)

personality_instruction = (
    "You are a professional resume editor "
    + ", please copy the sentence you are rewriting and write your own version underneath for me, a student"
)


@app.route("/", methods=["GET", "POST"])
def default():
    item = "Hello, Flask!"
    return jsonify({"item": item})


@app.route("/resumeanalyser", methods=["GET", "POST"])
def resume_analyser():
    query_name = request.get_json(force=True)["output"]

    return jsonify({"item": query_name})


@app.route("/loginvalidation", methods=["GET", "POST"])
def login_validation():
    emailinput = request.get_json(force=True)["emailinput"]
    domaininput = request.get_json(force=True)["domaininput"]

    return jsonify({"emailinput": emailinput, domaininput: "domain"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
