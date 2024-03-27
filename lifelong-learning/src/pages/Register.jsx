import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import './register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleRegister = async (event) => {
        console.log(email);
        console.log(password);
        // event.preventDefault();
        setError(''); // Reset error message

        // Frontend validation
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            console.log(email);
            console.log(error)
            return false;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character.');
            console.log(password);
            console.log(error);
            return false;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/register', {
                email: email,
                password: password,
            });
            console.log(response.data);
            // navigate('/some-route'); // Navigate on successful registration
        } catch (error) {
            setError(error.response ? error.response.data.error : error.message);
        }
    };

    return (
        <div className="outer h-screen w-full flex justify-center items-center">
            <div className="box transform -translate-y-1/2 bg-faf9f6 filter drop-shadow-lg font-montserrat text-gray-700 p-10 rounded">
                <h2 className="text-black text-2xl font-bold mb-10 text-center">Create your Account</h2>
                <form method="post" onSubmit={handleRegister}>
                    <div className="mb-10">
                        {/* <label className="block text-black font-bold mb-2" htmlFor="email">
                            Your email
                        </label> */}
                        <input className="appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-whitesmoke text-black leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="mb-10">
                        {/* <label className="block text-black font-bold mb-2" htmlFor="email">
                            Your Password
                        </label> */}
                        <input className="appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-whitesmoke text-black leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                    </div>

                    {error && <div className="text-red-500 mb-4">{error}</div>}



                    <div className="flex justify-between items-center">
                        <input className="bg-black text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline hover:bg-f8f0e3 hover:text-black transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                            type="submit"

                            value="Create an account"
                        />
                    </div>
                </form>
                <p className="text-black text-center text-xs mt-10">
                    Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-700">Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
