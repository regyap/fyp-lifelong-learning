import pyrebase


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

email = "regine2048@gmail.com"
password = "test123"

# user = auth.create_user_with_email_and_password(email, password)
# print(user)

user = auth.sign_in_with_email_and_password(email, password)
info = auth.get_account_info(user["idToken"])  # shows last password update
print(info)


# email verification
# auth.send_email_verification(user["idToken"])

# send password reset
auth.send_password_reset_email(email)
