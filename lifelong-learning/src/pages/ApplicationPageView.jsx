import React, { useState, useEffect } from "react";
import TopBar from "../Components/TopBar/TopBar";
import JobCardApply from "../Components/JobCardApply/JobCardApply";
import "./applicationpageview.css";
import { useParams } from 'react-router-dom';
import axios from "axios";



export default function ApplicationPageView() {

    const [jobs, setJobs] = useState([]);
    const { jobId } = useParams(); // Get the jobId parameter from the URL
    const [jobDetails, setJobDetails] = useState(null);

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
    const handleApplyClick = (event, jobId) => {
        event.stopPropagation(); // Prevents the card click event
        // Handle the job application logic
        console.log("Apply clicked for job:", jobId);
    };

    return (
        <>
            <div className="min-h-screen flex flex-col"> {/* Ensures full height and flex layout */}
                <TopBar />
                <div className="flex-grow w-auto flex-grow "> {/* Takes up all available space */}
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 flex-grow " > {/* Centers the content and adds padding */}
                        <div className="flex flex-col flex-grow"> {/* Centers content vertically and horizontally */}
                            {jobs.map((job) => (
                                <JobCardApply
                                    key={job.id}
                                    job={job}
                                    className="flex-grow"

                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
