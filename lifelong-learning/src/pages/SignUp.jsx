import React, { useEffect, require, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./signup.css";
import axios from "axios";


function SignUp() {

    const validateEmail = (email) => {
        var re = /^[a-zA-Z0-9]+(?:[.][a-zA-Z0-9]+)?@[a-zA-Z]{1,}(?:.[a-zA-Z]+){0,2}.[a-zA-Z]{2,3}$/;
        return re.test(email);


    };
    const setdomainentry = (event) => {
        setDomain(event.target.value);
    };

    const [email, setEmail] = React.useState("");
    const [error, setError] = useState(null);
    const [domain, setDomain] = useState("Student");
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const login = async () => {
        console.log(email)
        console.log(domain)

        if (!validateEmail(email)) {
            setError("Invalid Email format");
            setEmail("");

        } else {
            if (domain === "") {
                setError("Please select a domain");
                setDomain("Student");

            }
            setError(null); //clear error message if there are no errors
            try {
                axios.post("http://127.0.0.1:5000/login",
                    {
                        emailinput: email,
                        domaininput: domain
                    },
                    {
                        headers: { 'content-type': 'application/json' }

                    }
                ).then(
                    (response) => {
                        console.log(response);
                        if (response.data.emailInput !== "" && response.data.domainInput !== "") {
                            console.log(response);
                            localStorage.setItem('userEmail', email);
                            localStorage.setItem('userDomain', domain);
                            navigate('/login2');
                        }
                        else if (response.data.status === 404 && validateEmail(email) == 200) {
                            setError(<p>Email does not exist. Please <a href="/signup">sign up</a>.</p>);
                        }
                        else if (response.data.status === 404) {
                            setError(response.data.message);
                        }

                    }
                )
            } catch (error) {
                console.error(error);
                setError("An error occured while logging in. Please try again later. ");
            } finally {
                setLoading(false);
            }
        }

    }

    // const isLoginDisabled = email === "" || error != null;



    return (
        <div className="box">
            <form>
                <div className="profilebox">
                    <img src={logo} alt="profile" className="profile" />
                </div><br /><br />

                <p><b className="headbold">Sign In</b><br />Use your NTU email account<br /> or create one <a href="signup"> here</a></p>



                <div>

                    <input type="text" name="emailforsignin" pattern=".{3,}" required autoFocus id="emailInput" onChange={e => setEmail(e.target.value)} />
                    <label>Enter Email: </label>
                </div>
                <div className="error-container">
                    {error && <span style={{ color: 'red', display: 'block' }}>{error}</span>}
                    {loading && <div>Loading...</div>} {/* Render loading component while loading */}
                </div>

                <br /><br /><br />

                <div className="domainflex">

                    <div className="domain">
                        {/* <label>Student</label> */}
                        <select id="domain" name="domain" value={domain} onChange={setdomainentry}>

                            <option value="Student">Student</option>
                            <option value="Recruit">Recruit</option>

                        </select>
                    </div>

                    <Link>

                        <div className="domain">

                            <button name="submit" value="next"
                                className="buttons"
                                onClick={(event) => {
                                    event.preventDefault();
                                    login();
                                }} >Next</button>
                        </div>
                    </Link>
                </div>
            </form >


        </div >
    );
}

export default SignUp;
