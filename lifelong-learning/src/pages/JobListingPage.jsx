import React, { useEffect, useState } from 'react';
import TopBar from '../Components/TopBar/TopBar';
import NewJobModal from '../Components/NewJobModal/NewJobModal';

const JobListingsPage = () => {
    const [jobListings, setJobListings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchJobListings();
    }, []);

    // Rest of your component...

    return (
        <>
            <TopBar />
            <div className="p-4">
                <h1 className="text-2xl font-bold">Job Application Listings</h1>
                <button className="btn btn-primary my-4" onClick={() => setIsModalOpen(true)}>Create New Listing</button>
                {jobListings.map((jobListing) => (
                    // Your job listing display...
                ))}
            </div>
            <NewJobModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} fetchJobListings={fetchJobListings} />
        </>
    );
};

export default JobListingsPage;
// image, source and then base 64 encoding can be backend or frontend