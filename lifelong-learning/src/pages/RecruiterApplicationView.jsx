// ApplicantViewPage.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TopBar from '../Components/TopBar/TopBar';
import './recruiterapplicationview.css'; // Import CSS file for styling

const RecruiterApplicantView = () => {
    const [applicants, setApplicants] = useState([]);
    const { jobId } = useParams(); // Extract jobId from URL params

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/recruiter-applicants-view/${jobId}`);
                setApplicants(response.data); // Set fetched applicants data
            } catch (error) {
                console.error('Error fetching applicants:', error);
            }
        };

        fetchApplicants();
    }, [jobId]);

    // Function to handle downloading resume
    const downloadResume = (resumeLocation) => {
        // Assuming resumeLocation is a valid URL to the resume file
        window.open(resumeLocation, '_blank');
    };

    return (
        <>

            <TopBar />
            <div className="applicant-view-page">
                <header>
                    <h1>Applicants for Job ID {jobId}</h1>
                </header>
                <main>
                    <div className="applicant-list">
                        {applicants.map((applicant, index) => (
                            <div key={index} className="applicant-item">
                                <p>Name: {applicant.name}</p>
                                <p>Email: {applicant.email}</p>
                                <p>Resume Name: {applicant.resume_name}</p>
                                <p>Upload Date: {applicant.upload_date}</p>
                                {/* <p>Resume Location: {applicant.resume_location}</p> */}
                                {/* Add a button to download the resume */}
                                <button onClick={() => downloadResume(applicant.resume_location)}>View Resume</button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>

    );
};

export default RecruiterApplicantView;
