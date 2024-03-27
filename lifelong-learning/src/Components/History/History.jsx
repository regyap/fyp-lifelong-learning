import React, { useState, useEffect } from 'react'
import "./history.css";
import axios from 'axios';



export default function History() {

    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('accessToken'); // Retrieve the token from local storage
                const response = await axios.post(
                    'http://127.0.0.1:5000/applications',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the headers
                        },
                    }
                );
                setApplications(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };

        fetchApplications(); // Call fetchApplications when the component mounts
    }, []); // Empty dependency array ensures that the effect runs only once


    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />


            <div className="submittedappbox bg-black">
                <div className="title bg-black text-white">
                    Submitted Applications
                </div>
                <div className="content bg-black">
                    {applications.map((app) => (
                        <div key={app.applicationID} className="content-item"> {/* Ensure applicationid is unique */}
                            <div className="content-item-titlearea">
                                <p className="contenttitle">{app.companyname}</p>
                                <div className="statusmessage">{app.status}</div>
                            </div>

                            <div className="content-item-position">
                                <div className="contentposition">{app.jobPostingTitle}, ${app.salary}</div>
                                <div className="time">
                                    <div className="contentdate">{app.applicationTime}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}