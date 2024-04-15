import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useHistory hook
import "./recruiterapplication.css";
import { MdRemoveRedEye } from "react-icons/md";
import { FaTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

const RecruiterApplication = ({ listings }) => {
    const navigate = useNavigate(); // Initialize useHistory hook

    // Function to navigate to the applicant view page
    const viewApplicants = (jobId) => {
        try {
            // Navigate to the applicant view page
            navigate(`/recruiterapplicationview/${jobId}`);
        } catch (error) {
            console.error('Error navigating to applicant view page:', error);
        }
    };

    return (
        <>
            <div className="rappdashboardpage">
                <div className="rappdashboardrecruiter">
                    <div className="rappsubmittedappbox bg-black">
                        <div className="rapptitle text-white">
                            Your Job Listings
                        </div>
                        <div className="rappcontent bg-black">
                            {listings.map((listing, index) => (
                                <div key={index} className="rappcontent-item">
                                    <div className="rappcontent-item-titlearea">
                                        <p className="contenttitle">{listing.jobPostingTitle}</p>
                                    </div>
                                    <div className="rappcontent-item-position">
                                        <div className="rappcontentposition">Applications: {listing.applicationCount}</div>
                                        <div className="rappcontentposition">Salary: {listing.salary}</div>
                                        <div className="rappcontentposition">Closing Date: {listing.applicationclosingdate}</div>
                                        <div className="rappbutton-group">
                                            <button className="rappview-applicants-btn" onClick={() => viewApplicants(listing.jobPostingId)}>
                                                <MdRemoveRedEye />
                                            </button>
                                            <button className="rappview-applicants-btn">
                                                <FaTrashCan />
                                            </button>
                                            <button className="rappview-applicants-btn">
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rapptitlebottom bg-black text-white">
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecruiterApplication;
