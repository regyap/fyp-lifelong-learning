import React, { useEffect, require, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./login.css";
import axios from "axios";
import logo from "../images/logoblack.png";
import { useAuth } from "../auth/AuthContext.jsx"

function Login2() {

    // const { isAuthenticated, callProtectedRoute } = useAuth();

    const { callProtectedRoute } = useAuth();


    useEffect(() => {
        // Retrieve information from local storage
        const storedEmail = localStorage.getItem('userEmail');
        const storedDomain = localStorage.getItem('userDomain');
        console.log(storedEmail)
        console.log(storedDomain)

        setEmail(storedEmail || "");
        setDomain(storedDomain || "Student");
    }, []);

    const setdomainentry = (event) => {
        setDomain(event.target.value);
    };

    const handleKeypress = e => {
        //it triggers by pressing the enter key
        if (e.keyCode === 13) {
            login2();
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevents the default form submit action
        login2();
    };

    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false); // Added loading state
    const [password, setPassword] = useState("");
    const history = useNavigate();

    const login2 = async () => {
        console.log(email)
        console.log(domain)
        console.log(password)

        setError(null); //clear error message if there are no errors
        try {
            axios.post("http://127.0.0.1:5000/login",
                {
                    emailinput: email,
                    domaininput: domain,
                    password: password
                },
                {
                    headers: { 'content-type': 'application/json' }

                }
            ).then(
                (response) => {
                    console.log(response);
                    if (response.data.message === "Login Successful") {
                        callProtectedRoute();
                        console.log("HERE")
                        console.log(response);
                        console.log(response.data);
                        localStorage.setItem('userEmail', email);
                        console.log(email);
                        localStorage.setItem('userDomain', domain);
                        localStorage.setItem('accessToken', response.data.access_token);
                        localStorage.setItem('refreshToken', response.data.refresh_token);

                        if (domain === "Student") {
                            history("/welcome");
                        } else {
                            history("/dashboard");
                        }
                    }

                    else {
                        setError(<p>Password does not exist, please try again</p>);
                    }
                    // else if (response.data.status === 403) {
                    //     setError(<p>Email does not exist, please try again</p>);
                    // }
                    // else if (response.data.status === 401) {
                    //     setError(<p>Invalid password, please try again</p>);
                    // }
                    // else if (response.data.status === 400) {
                    //     setError(<p>Invalid email, please try again</p>);
                    // }
                    // else if (response.data.status === 500) {
                    //     setError(<p>Internal server error, please try again</p>);
                    // }
                    // else {
                    //     setError(<p>Unknown error, please try again</p>);
                    // }


                }
            ).catch((error) => {

                if (error.response) {
                    console.error("Error data:", error.response.data);
                    console.error("Error status:", error.response.status);

                    setError(`Error: ${error.response.status}`);
                } else if (error.request) {
                    console.error("Error request:", error.request);
                    setError("Error: No response received");
                } else {
                    console.error('Error', error.message);
                    setError(`Error: ${error.message}`);
                }
            })
        } catch (error) {
            console.log(error.response.status)


            setError(error.response.data.message)

        } finally {
            setLoading(false);
        }
    }

    // }

    // const isLoginDisabled = email === "" || error != null;



    return (
        <div className="box">
            <form method='post' onSubmit={handleSubmit}>
                <div className="profilebox">
                    <img src={logo} alt="profile" className="profile" />
                </div><br /><br />

                {/* <p><b className="headbold">Sign In two</b><br /></p> */}

                <br></br>

                <div>

                    <input type="password" name="passwordforsignin" pattern=".{3,}" required autoFocus id="passwordInput" onChange={e => setPassword(e.target.value)} onKeyPress={handleKeypress} />
                    <label>Enter Password: </label>
                </div>
                <div className="error-container">
                    {error && <span style={{ color: 'red', display: 'block' }}>{error}</span>}
                    {loading && <div>Loading...</div>} {/* Render loading component while loading */}
                </div>

                <br /><br /><br />

                <div className="domainflex">
                    <div className="domain">
                        <input type="button" name="submit" value="next"
                            onClick={(event) => {

                                // event.preventDefault();
                                console.log("Before login2()"); // Print before login2() is called
                                login2();
                                console.log("After login2()"); // Print after login2() is called
                            }} />
                    </div>
                </div>
            </form >


        </div >
    );
}

export default Login2;
