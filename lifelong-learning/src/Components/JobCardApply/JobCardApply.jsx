import React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'; // Import the Button component
import "./jobcardapply.css";


const JobCardApply = ({ job, onApply }) => {
    return (
        <Card
            className="mb-4 shadow-lg bg-gray-700 text-white cursor-pointer "

        >
            <Card.Body>
                <div className="flex items-center mb-3">
                    <img
                        src={job.logo} // Assuming job.logo is the path to the logo image
                        alt={`${job.company} logo`}
                        className="h-12 w-12 rounded-full mr-4"
                    />
                    <div>
                        <h5 className="font-bold">{job.title}</h5>
                        <h6>{job.company}</h6>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <div className="text-sm">
                        <span className="font-semibold">Position:</span> {job.position}
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Salary:</span> {job.salary ? job.salary : 'Negotiable'}
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-semibold">Company:</span> {job.companyname}
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Location:</span> {job.location}
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="text-sm">
                        <span className="font-semibold">Closing Date:</span> {job.closingdate}
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="text-xs font-bold py-2 px-4 rounded bg-black text-white bg-blue-700 border-gray-100 hover:bg-gray-900 focus:outline-none hover:border-white-100 duration-175"
                    onClick={onApply} // Hand   le the apply click (prevents the card click event if within the button)
                >
                    Apply Now
                </Button>
            </Card.Body>
        </Card>
    );
};

export default JobCardApply;

