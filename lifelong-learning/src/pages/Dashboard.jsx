import React, { useEffect, require, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopBar from '../Components/TopBar/TopBar.jsx';
import './dashboard.css';
import axios from 'axios';
import RecruiterApplication from '../Components/RecruiterApplication/RecruiterApplication.jsx';

const Dashboard = () => {
    const [listings, setListings] = useState([]);
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('accessToken');

    const fetchListings = async () => {
        try {
            const response = await axios.get(
                'http://127.0.0.1:5000/recruiter-applications',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true, // Include credentials in CORS request
                    crossdomain: true, // Indicate cross-domain request
                }
            );
            setListings(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    useEffect(() => {


        fetchListings();
    }, []);

    return (
        <>
            <div className="dashboardpage">
                <TopBar />
                <RecruiterApplication listings={listings} />
            </div>
        </>
    );
};

export default Dashboard;
