import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'; // Import the Button component
import "./jobcardapply.css";


const JobCardApply = ({ job, onApply }) => {
    return (
        <Card
            className="mt-4 pb-4 rounded-lg p-4 mb-4 shadow-lg bg-gray-700 text-white cursor-pointer "

        >
            <Card.Body>
                <div className="flex items-center mb-3">
                    <img
                        src={job.logo} // Assuming job.logo is the path to the logo image
                        alt={`${job.company} logo`}
                        className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                        <h5 className="font-bold">{job.position} Level {job.title}</h5>
                        <h6>{job.company}</h6>
                        <div className="text-sm">
                            <span className="font-semibold"></span> {job.companyname}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <div className="text-sm">
                        {job.description}
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Salary:</span> {job.salary ? job.salary : 'Negotiable'} / year
                    </div>
                </div>
                <div className="flex justify-between items-center">

                    <div className="text-sm">
                        <span className="font-semibold">Location:</span><br></br> {job.location}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="text-sm">
                        <span className="font-semibold">Closing Date:</span><br></br> {job.closingdate}
                    </div>
                </div>


            </Card.Body>
        </Card>
    );
};

export default JobCardApply;

