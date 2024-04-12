import React from 'react';
import Card from 'react-bootstrap/Card';
import ProgressBar from '@ramonak/react-progress-bar';


const JobCard = ({ job, handleJobClick, onApply }) => {
    console.log("JobCard job:", job);
    return (
        <Card
            className="mb-4 shadow-lg bg-gray-700 text-white cursor-pointer pl-2 pr-2 pt-2 pb-2"
            onClick={() => handleJobClick(job.id)}
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

                <div className="pt-2 pb-2">
                    Skill Compatibality
                    <ProgressBar completed={job.match_percentage} bgColor="#4caf50" labelColor="#fff" />
                </div>
            </Card.Body>
        </Card>
    );
};

export default JobCard;
