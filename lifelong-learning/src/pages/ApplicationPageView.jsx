import React, { useState, useEffect } from "react";
import TopBar from "../Components/TopBar/TopBar";
import JobCardApply from "../Components/JobCardApply/JobCardApply";
import "./applicationpageview.css";
import { useParams, Link } from 'react-router-dom';
import axios from "axios";



export default function ApplicationPageView() {

    const [jobs, setJobs] = useState([]);
    const { jobId, documentId } = useParams();
    const [jobDetails, setJobDetails] = useState(null);

    console.log(documentId)
    useEffect(() => {
        try {
            axios.get(`http://127.0.0.1:5000/jobs/${jobId}`) // Use backticks for string interpolation
                .then((response) => {
                    setJobs(response.data);
                    console.log(response);
                })
                .catch(error => {
                    console.error('Error fetching job data:', error);
                });
        } catch (error) {
            console.error('Error in useEffect:', error);
        }




    }, [jobId]); // Make sure to include jobId in the dependency array



    // Function to handle when a job card is clicked
    const handleJobClick = (jobId) => {
        // Navigate to job details page or expand the job card for more details
        console.log("Job clicked:", jobId);
    };

    // Function to handle when the apply button is clicked
    // const handleApplyClick = (event, jobId) => {
    //     event.stopPropagation(); // Prevents the card click event
    //     // Handle the job application logic
    //     console.log("Apply clicked for job:", jobId);
    // };

    const handleApplyClick = async (event, jobId) => {
        event.stopPropagation(); // Prevents the card click event

        // Assuming you have the resumeId from useParams() or state
        const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token from localStorage

        try {
            const applicationData = {
                jobId, // the job ID for the application
                documentId, // the resume ID for the application

            };
            const response = await axios.post('http://127.0.0.1:5000/submitapplications', applicationData, {
                headers: { Authorization: `Bearer ${accessToken}` } // Include the Authorization header
            });

            // Handle success
            console.log("Application submitted successfully:", response.data);
            alert('Application submitted successfully.');

            // Optionally navigate to a confirmation page or update the UI
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting the application. Please try again.');
        }
    };

    return (
        <>
            <div className="apppageview flex flex-col"> {/* Ensures full height and flex layout */}
                <TopBar />
                <Link to={`/application/${documentId}`} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4">
                    Back to Application
                </Link>
                <div className="flex-grow w-auto flex-grow"> {/* Takes up all available space */}
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 flex-grow " > {/* Centers the content and adds padding */}
                        <div className="flex flex-col flex-grow"> {/* Centers content vertically and horizontally */}
                            {jobs.map((job) => (
                                <JobCardApply
                                    key={job.id}
                                    job={job}
                                    className="flex-grow"

                                />
                            ))}

                            <button
                                onClick={(event) => handleApplyClick(event, jobId)}
                                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Apply
                            </button>
                            {/* <Button
                                variant="primary"
                                className="text-xs font-bold py-2 px-4 rounded bg-black text-white bg-blue-700 border-gray-100 hover:bg-gray-900 focus:outline-none hover:border-white-100 duration-175"
                                onClick={onApply} // Hand   le the apply click (prevents the card click event if within the button)
                            >
                                Apply Now
                            </Button> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
