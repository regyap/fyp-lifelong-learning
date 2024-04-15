import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import TopBar from '../Components/TopBar/TopBar';
import { FaPlusCircle } from 'react-icons/fa'; // Import the plus icon
import './createapplication.css';
import JobCard from '../Components/JobCardNoSkill/JobCardNoSkill'; // Import JobCard
import axios from 'axios'; // Assuming axios is used for API calls



function createApplication() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [jobPosition, setJobPosition] = useState('');
    const [jobs, setJobs] = useState([]); // State to store jobs data

    const accessToken = localStorage.getItem('accessToken');
    const [jobDetails, setJobDetails] = useState({
        logo: '',
        title: '',
        position: '',
        location: '',
        salary: '',
        closingDate: '',

    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            // Fetch jobs without authorization
            const response = await axios.get('http://127.0.0.1:5000/recruiter/jobsfetch');
            setJobs(response.data);
            console.log('Jobs fetched:', response.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        const accessToken = localStorage.getItem('accessToken'); // Ensure the token is stored in localStorage

        const jobData = {
            title: jobDetails.title,
            position: jobDetails.jobType,
            description: jobDetails.description,

            salary: jobDetails.salary,
            closingDate: jobDetails.closingDate,

        };

        console.log(jobData)
        try {
            const response = await axios.post('http://127.0.0.1:5000/recruiter/jobscreate', jobData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Job created:', response.data);
            setModalIsOpen(false); // Close the modal on success
        } catch (error) {
            console.error('Failed to create job:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setJobDetails(prev => ({ ...prev, logo: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <>

            <div className="createapplicationpage">
                <TopBar />
                <h1>Create Application</h1>
                <FaPlusCircle
                    size={44}
                    className="add-button"
                    onClick={() => setModalIsOpen(true)}
                />
                {modalIsOpen && (
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={() => setModalIsOpen(false)}
                        contentLabel="Application Details"
                        className="modal"
                        overlayClassName="overlay"
                    >
                        <form onSubmit={handleSubmit}>
                            {/* <div>
                                <label>Logo:</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" />
                                {jobDetails.logo && <img src={jobDetails.logo} alt="Logo Preview" style={{ width: 100, height: 100 }} />}
                            </div> */}
                            <input type="text" name="title" placeholder="Job Title" value={jobDetails.title} onChange={handleInputChange} />
                            <div className="cappselect">
                                <label className="block text-sm font-medium text-gray-700 bg-black">Job Type:</label>
                                <select
                                    name="jobType"
                                    required
                                    onChange={handleInputChange}
                                    value={jobDetails.jobType}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">Select job type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Temporary">Temporary</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Seasonal">Seasonal</option>
                                </select>
                            </div>

                            <input type="text" name="company" placeholder="Company" value={jobDetails.company} onChange={handleInputChange} />
                            <input type="text" name="description" placeholder="description" value={jobDetails.description} onChange={handleInputChange} />
                            {/* <input type="text" name="location" placeholder="Location" value={jobDetails.location} onChange={handleInputChange} /> */}
                            <input type="text" name="salary" placeholder="Salary" value={jobDetails.salary} onChange={handleInputChange} />
                            <div className="mb-4">
                                <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 bg-black">Closing Date:</label>
                                <input type="date" name="closingDate" className="bg-black" id="closingDate" placeholder="Closing Date" value={jobDetails.closingDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>


                            <div className="flex justify-end">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    Submit
                                </button>
                            </div>

                        </form>
                    </Modal>
                )}
                <div className="job-listings">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} /> // Display each job using the JobCard component
                    ))}
                </div>
            </div>
        </>
    );
}

export default createApplication;
