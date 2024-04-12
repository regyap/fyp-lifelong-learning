import React from 'react';
import "./recruiterapplication.css";

const RecruiterApplication = ({ listings }) => {

    // Fetch and display applicant details for a job
    const viewApplicants = async (jobId) => {
        try {
            // Here you can implement the functionality to view applicants for a job
            console.log(`Viewing applicants for job ID: ${jobId}`);
            // This could open a modal or navigate to a new page with the applicant details
        } catch (error) {
            console.error('Error fetching applicant details:', error);
        }
    };

    return (
        <>
            <div className="dashboardpage">
                <div className="dashboardrecruiter">
                    <div className="submittedappbox bg-black">
                        <div className="title bg-black text-white">
                            Your Job Listings
                        </div>
                        <div className="content bg-black">
                            {listings.map((listing) => (
                                <div key={listing.jobId} className="content-item">
                                    <div className="content-item-titlearea">
                                        <p className="contenttitle">{listing.company} - {listing.title}</p>
                                    </div>
                                    <div className="content-item-position">
                                        <div className="contentposition">Applications: {listing.applicationsCount}</div>
                                        <button className="view-applicants-btn" onClick={() => viewApplicants(listing.jobId)}>
                                            View Applicants
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecruiterApplication;
