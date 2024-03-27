import React, { useState, useEffect } from 'react';
import "./topbar.css";
import 'flowbite';
import { Link } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import { useAuth } from "../../auth/AuthContext.jsx";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// retrieve role from session
export default function TopBar() {

    const { logout } = useAuth();



    const handleLogout = async (e) => {
        try {
            let accessToken = localStorage.getItem('accessToken');
            console.log(accessToken);
            response = await axios.post('/logout', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            if (response.ok || response.status === 200 || response.message === "Logout successful") {
                console.log('Logout successful');
                e.preventDefault();
                logout();
                // navigate('/login');
            } else {
                console.log('Logout failed');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };


    // const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || "");
    // const [userDomain, setUserDomain] = useState(localStorage.getItem('userDomain') || "Student");
    // const [userRole, setUserRole] = useState(null);


    // const checkSession = async () => {
    //     try {
    //         // Make a request to your Flask server to check the session status
    //         const response = await axios.get('http://');
    //         return response.data.session; // Assuming the response has a 'session' property
    //     } catch (error) {
    //         console.error('Error checking session:', error);
    //         return false; // Assume session is not active in case of an error
    //     }
    // };

    // const PrivateRoute = ({ component: Component, ...rest }) => (
    //     <Route
    //         {...rest}
    //         render={(props) =>
    //             // Check the session status before rendering the component
    //             session ? <Component {...props} /> : <Redirect to="/login" />
    //         }
    //     />
    // );

    // const [session, setSession] = useState(null);



    // useEffect(() => {
    //     // Check session status when the application loads
    //     checkSession().then((result) => setSession(result));
    // }, []);

    return (
        <>

            <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.css" rel="stylesheet" />
            <div className="bodyatnav">
                <nav className="bg-black">
                    <div class="flex flex-wrap items-center justify-between mx-auto p-4 w-full h-full">
                        <a href="https://flowbite.com/" class="flex items-center">
                            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 mr-3" alt="Flowbite Logo" />
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AIJA</span>
                        </a>
                        <div className="flex items-center md:order-2">
                            <button type="button" class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
                                <span className="sr-only">Open user menu</span>
                                <img className="w-8 h-8 rounded-full" src="/docs/images/people/profile-picture-3.jpg" alt="user photo" />
                            </button>

                            <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown">
                                <div className="px-4 py-3">
                                    <span className="block text-sm text-gray-900 dark:text-white">Bonnie Green</span>
                                    <span className="block text-sm  text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
                                </div>
                                <ul className="py-2" aria-labelledby="user-menu-button">

                                    <li>
                                        <Link to="/edit-profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                                            Edit Profile
                                        </Link>
                                    </li>
                                    <li >
                                        <a href="/login" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</a>
                                    </li>
                                </ul>
                            </div>
                            <button data-collapse-toggle="navbar-user" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-user" aria-expanded="false">
                                <span className="sr-only">Open main menu</span>
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                                </svg>
                            </button>
                        </div>
                        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
                            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-gray dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                                <li>
                                    <Link to="/welcome" className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-20 md:dark:text-blue-500 " aria-current="page">DASHBOARD</Link>
                                </li>
                                <li>
                                    <Link to="/analyser" className="block py-2 pl-3 pr-4 text-white rounded hover-gold-yellow md:hover:bg-transparent md:hover:text-blue-700 md:p-20 dark:text-white md:dark:hover:text-blue-500 dark:hover-gold-yellow dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">ANALYSER</Link>
                                </li>
                                <li>
                                    <Link to="/application" className="block py-2 pl-3 pr-4 text-white rounded hover-gold-yellow md:hover:bg-transparent md:hover:text-blue-700 md:p-20 dark:text-white md:dark:hover:text-blue-500 dark:hover-gold-yellow dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">APPLICATION</Link>
                                </li>
                                {/* <li>
                                    <Link to="/contact" className="block py-2 pl-3 pr-4 text-white rounded hover-gold-yellow md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover-gold-yellow dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Contact</Link>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </nav>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.js"></script>
            </div>

        </>
    )
}
