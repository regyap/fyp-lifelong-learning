import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import './register.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate('/login', { state: { successMessage: 'Account created successfully!' } });
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setError(''); // Reset error message

        // Frontend validation
        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character.');
            return false;
        }

        try {
            const response = await axios.post('http://127.0.0.1:5000/register', {
                email: email,
                password: password,
                domain: domain,
            });
            console.log(response.data);
            toast.success('Account created successfully!');
            navigateToLogin(); // Navigate to login page with success message


        } catch (error) {
            setError(error.response ? error.response.data.error : error.message);
        }
    };

    return (
        <div className="outer h-screen w-full flex justify-center items-center">
            <div className="box transform -translate-y-1/2 bg-faf9f6 filter drop-shadow-lg font-montserrat text-gray-700 p-10 rounded">
                <h2 className="text-black text-2xl font-bold mb-10 text-center">Create your Account</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-10">
                        <input
                            className="appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-whitesmoke text-black leading-tight focus:outline-none focus:shadow-outline"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className="mb-10">
                        <input
                            className="appearance-none border border-gray-300 rounded w-full py-2 px-3 bg-whitesmoke text-black leading-tight focus:outline-none focus:shadow-outline"
                            type="password"
                            value={password}
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-10 flex">
                        <select
                            className="appearance-none border border-gray-300 rounded py-2 px-3 bg-whitesmoke text-black leading-tight focus:outline-none focus:shadow-outline flex-end"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            required
                        >
                            <option value="">Select Domain</option>
                            <option value="student">Student</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    <div className="flex justify-between items-center">
                        <input
                            className="bg-black text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline hover:bg-f8f0e3 hover:text-black transition duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
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
