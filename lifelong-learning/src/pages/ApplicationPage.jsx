import React, { useState, useEffect } from 'react';

import { useNavigate, Link, useParams } from 'react-router-dom';
import TopBar from '../Components/TopBar/TopBar.jsx';
import './application.css';
import Card from 'react-bootstrap/Card';
import JobCard from '../Components/JobCard/JobCard.jsx';
import Select from '../Components/SelectPrice/selectPrice.jsx';
import axios from 'axios';
import ProgressBar from '@ramonak/react-progress-bar';


const jobDetails = {
    logo: '/path/to/logo.png',
    title: 'Software Developer',
    company: 'City Hall Pty Ltd',
    type: 'Full Time',
    location: 'New York, NY',
    salary: '$70,000 - $90,000',
    tags: ['Entry Level', 'Tech', 'Urgent'],
};

const FilterItem = ({ label, count, checked, onChange }) => (
    <div className="flex items-center mb-2">
        <input
            type="checkbox"
            className="text-blue-600 form-checkbox"
            checked={checked}
            onChange={onChange}
        />
        <span className="ml-2 text-gray-300">{label}</span>
        <span className="ml-auto text-gray-500">({count})</span>
    </div>
);

const PriceFilter = ({ onPriceChange }) => {
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const priceOptions = [
        { label: 'From', value: '' },
        { label: '$0', value: '0' },
        { label: '$50', value: '50' },

    ];

    const handleMinPriceChange = (e) => {
        const value = e.target.value;
        setMinPrice(value);
        onPriceChange(value, maxPrice);
    };

    const handleMaxPriceChange = (e) => {
        const value = e.target.value;
        setMaxPrice(value);
        onPriceChange(minPrice, value);
    };

    return (
        <div className="mb-5 space-y-2">
            <Select
                label="Min Price"
                options={priceOptions}
                value={minPrice}
                onChange={handleMinPriceChange}
            />
            <Select
                label="Max Price"
                options={priceOptions}
                value={maxPrice}
                onChange={handleMaxPriceChange}
            />
        </div>
    );
};


export default function ApplicationPage() {
    const [keywords, setKeywords] = useState('');
    const [entryLevel, setEntryLevel] = useState(false);
    const [seniorLevel, setSeniorLevel] = useState(false);
    const [seniorManager, setSeniorManager] = useState(false);
    const [middleManager, setMiddleManager] = useState(false);
    const [manager, setManager] = useState(false);
    const [professional, setProfessional] = useState(false);
    const [seniorExecutive, setSeniorExecutive] = useState(false);
    const [executive, setExecutive] = useState(false);
    const [juniorExecutive, setJuniorExecutive] = useState(false);
    const [nonExecutive, setNonExecutive] = useState(false);
    // Add more state variables for other filters as needed

    const navigate = useNavigate();
    let { resumeId } = useParams(); // Access the resumeId parameter from the URL
    const [jobs, setJobs] = useState([]);
    // const [matchData, setMatchData] = useState([]);

    // useEffect(() => {
    //     // Fetch job matches based on resume ID
    //     const fetchJobMatches = async () => {
    //         try {
    //             const response = await axios.get(`http://127.0.0.1:5000/api/match-jobs/${resumeId}`);
    //             setMatchData(response.data); // Store the match data
    //         } catch (error) {
    //             console.error('Error fetching job matches:', error);
    //         }
    //     };

    //     fetchJobMatches();
    // }, [resumeId]);

    useEffect(() => {
        // Update the URL to use a query string for resumeId
        axios.get(`http://127.0.0.1:5000/jobsfetch?resume_id=${resumeId}`)
            .then(response => {
                setJobs(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching job data:', error);
            });
    }, [resumeId]); // Keep resumeId as a dependency of useEffect



    const handleJobClick = (jobpostingid) => {
        console.log("Job clicked:", jobpostingid);
        navigate(`/applicationview/${jobpostingid}`);
        navigate(`/applicationview/${jobpostingid}/${resumeId}`);
    };

    const handleApplyClick = (event, jobId) => {
        event.stopPropagation(); // Prevents the card click event
        console.log("Apply clicked for job:", jobId);
        // Handle the job application logic
    };

    const handleSearch = (event) => {
        event.preventDefault();
        console.log('Search for:', keywords, { entryLevel, seniorLevel });
    };

    const handlePriceChange = (min, max) => {
        console.log('Price range:', { min, max });
        // You would handle the price change here
    };


    return (
        <>
            <div className="appbody bg-black">
                <TopBar />
                <div className="applicationpage flex">
                    <aside className="w-64 h-screen bg-gray-900 p-5 overflow-y-auto">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-xl text-gray-300">Filters</h3>
                            <div>
                                <button className="text-gray-500 hover:text-gray-300 mr-3">Save view</button>
                                <button className="text-gray-500 hover:text-gray-300">Clear all</button>
                            </div>
                        </div>
                        <form onSubmit={handleSearch}>
                            <div className="mb-5">
                                <input
                                    type="text"
                                    placeholder="Search keywords..."
                                    className="text-xs w-full p-1 bg-gray-800 text-gray-300 border-none"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="text-white absolute mt-1 mr-1 end-0 top-0 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Search
                                </button>
                            </div>
                            <div className="mb-5    ">
                                <h3 className="text-gray-400 mb-2 text-xm">Opportunity Type</h3>
                                {/* Senior Management

                                Middle Management

                                Manager

                                Professional

                                Senior Executive

                                Executive

                                Junior Executive

                                Non-executive

                                Fresh/entry level */}
                                <div className="space-y-2">
                                    <FilterItem
                                        label="Senior Management"
                                        count={85}
                                        checked={seniorManager}
                                        onChange={() => setSeniorManager(!seniorManager)}
                                    />
                                    <FilterItem
                                        label="Middle Management"
                                        count={85}
                                        checked={middleManager}
                                        onChange={() => setMiddleManager(!middleManager)}
                                    />
                                    <FilterItem
                                        label="Manager"
                                        count={85}
                                        checked={manager}
                                        onChange={() => setManager(!manager)}
                                    />
                                    <FilterItem
                                        label="Professional"
                                        count={85}
                                        checked={professional}
                                        onChange={() => setProfessional(!professional)}
                                    />
                                    <FilterItem
                                        label="Senior Executive"
                                        count={85}
                                        checked={seniorExecutive}
                                        onChange={() => setSeniorExecutive(!seniorExecutive)}
                                    />
                                    <FilterItem
                                        label="Executive"
                                        count={85}
                                        checked={executive}
                                        onChange={() => setExecutive(!executive)}
                                    />
                                    <FilterItem
                                        label="Junior executive"
                                        count={85}
                                        checked={juniorExecutive}
                                        onChange={() => setJuniorExecutive(!juniorExecutive)}
                                    />
                                    <FilterItem
                                        label="Non-executive"
                                        count={85}
                                        checked={nonExecutive}
                                        onChange={() => setNonExecutive(!nonExecutive)}
                                    />
                                    <FilterItem
                                        label="Entry Level"
                                        count={120}
                                        checked={entryLevel}
                                        onChange={() => setEntryLevel(!entryLevel)}
                                    />

                                </div>
                            </div>
                            {/* <PriceFilter onPriceChange={handlePriceChange} /> */}

                            <PriceFilter onPriceChange={(min, max) => console.log(min, max)} />
                        </form>
                    </aside>
                    <main className="flex-1 bg-gray-800 p-6">
                        {jobs.map(job => (
                            <Card>

                                <Card.Body key={job.id} onClick={() => handleJobClick(job.id)}>
                                    <JobCard
                                        key={job.id}
                                        job={job}

                                    />



                                </Card.Body>

                            </Card>
                        ))}

                    </main>
                </div>
            </div >
        </>
    );
}
