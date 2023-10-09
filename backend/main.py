from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask import Flask

app = Flask(__name__)

CORS(app)

personality_instruction = (
    "You are a professional resume editor "+
    ", please copy the sentence you are rewriting and write your own version underneath for me, a student"
)
@app.route("/resumeanalyser", methods=["GET","POST"])
def resume_analyser():
