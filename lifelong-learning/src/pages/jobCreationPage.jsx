import React, { useEffect, useState } from 'react';
import TopBar from '../Components/TopBar/TopBar';

const JobListingsPage = () => {
    const [jobListings, setJobListings] = useState([]);

    useEffect(() => {
        fetchJobListings();
    }, []);

    const fetchJobListings = async () => {
        try {
            const response = await fetch('/api/jobListings');
            const data = await response.json();
            setJobListings(data);
        } catch (error) {
            console.error('Error fetching job listings:', error);
        }
    };

    const handleEdit = (jobListingId) => {
        // Handle edit logic here
    };

    const handleDelete = (jobListingId) => {
        // Handle delete logic here
    };

    return (
        <>
            <TopBar />
            <div>
                <h1>Job Application Listings</h1>
                {jobListings.map((jobListing) => (
                    <div key={jobListing.id}>
                        <h2>{jobListing.title}</h2>
                        <p>{jobListing.description}</p>
                        <button onClick={() => handleEdit(jobListing.id)}>Edit</button>
                        <button onClick={() => handleDelete(jobListing.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </>

    );
};

export default JobListingsPage;