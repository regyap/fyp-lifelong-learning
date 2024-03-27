# from langchain.chains.question_answering import load_qa_chain
# from langchain.chat_models import ChatOpenAI
# from langchain.document_loaders import DirectoryLoader
# from langchain.embeddings.openai import OpenAIEmbeddings
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.vectorstores import Chroma
# import os

# os.environ["OPENAI_API_KEY"] = "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"

# # initializing the embeddings
# embeddings = OpenAIEmbeddings()

# # default model = "gpt-3.5-turbo"
# llm = ChatOpenAI()

# directory = "YOUR DOCUMENTS PATH"

# def load_docs(directory):
#     loader = DirectoryLoader(directory)
#     documents = loader.load()
#     return documents

# documents = load_docs('..\datasets\data\data')

# def split_docs(documents, chunk_size=500, chunk_overlap=50):
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=chunk_size,
#         chunk_overlap=chunk_overlap,
#     )
#     docs = text_splitter.split_documents(documents)
#     return docs

# docs = split_docs(documents)

# db = Chroma.from_documents(
#     documents=docs, 
#     embedding=embeddings
# )

# chain = load_qa_chain(llm, chain_type="stuff")

# def get_answer(query):
#     similar_docs = db.similarity_search(query, k=2) # get two closest chunks
#     answer = chain.run(input_documents=similar_docs, question=query)
#     return answer
    
# print("Private Q&A chatbot")
# prompt = input("Enter your query here: ")

# if prompt:
#     answer = get_answer(prompt)
#     print(f"Answer: {answer}")   

import os
import random

# from langchain_community.chat_models.openai import ChatOpenAI
from langchain_openai import ChatOpenAI
# from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain.chains.question_answering import load_qa_chain

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings()

# Initialize ChatOpenAI model
llm = ChatOpenAI(temperature=0)

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
            "question":f"Analyze these resumes targetting {desired_job_position} job position",
            "input_documents":resumes
        }
    )
    return analysis

def generate_feedback_for_input_resume(input_resume, qa_chain, comparative_analysis, desired_job_position):
    feedback = qa_chain.invoke(
        input={
            "question":f"Compare with the analysed resume: {comparative_analysis}, what improvements can be made to my resume to better target {desired_job_position} job position?",
            "input_documents":input_resume
        }
    )

    # feedback = qa_chain.invoke(
    #     question=f"Based on industry standards and trends identified: {comparative_analysis}\n\nHow does this resume compare and improvements can be made?",
    #     context=input_analysis['answers']
    # )

    return feedback


# Define function to compare input resume with selected resumes and provide feedback
def provide_resume_feedback(selected_resumes, chain, input_resume =  'Regine Yap Resume 2024.pdf'):
    feedback = []
    # base_dir = '/'

    # document_to_check = os.path.join(base_dir, input_resume)
    docs = load_pdf(input_resume)

    chain.add_documents(selected_resumes)
    chain.set_question("Feedback on resume")
    # chain.

    
    # for resume in selected_resumes:
    #     # answer = chain.run(question=docs, input_documents=[resume])
    #     answer = chain.invoke(input=docs, question="Feedback on resume:", input_documents=[resume])
    #     answer = chain.invoke()
    #     feedback.append(answer)
    return feedback

# Define directory containing all job position folders
base_folder = "datasets/data/data/"

# Get user input for the desired job position
desired_job_position = input("Enter the desired job position: ")

# Construct the folder path for the desired job position
# job_position_folder = os.path.join(base_folder, desired_job_position)
job_position_folder = os.path.join(base_folder, desired_job_position.upper())
print("Job position folder:", job_position_folder) #test


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
input_resume = input("Enter your resume here: ")
input_resume = load_pdf(input_resume)
# print(input_resume)

# Randomly select and compare resumes
selected_resumes = select_random_resumes(documents, num_resumes=5)

comparative_analysis = analyze_resumes_with_qa_chain(selected_resumes, chain, desired_job_position)
feedback = generate_feedback_for_input_resume(input_resume, chain, comparative_analysis, desired_job_position)
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
    print(f'{fb}: \n{feedback[fb]}')
