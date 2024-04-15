import React, { useEffect, useState } from "react";
import TopBar from "../Components/TopBar/TopBar.jsx";
import UploaderSection from "../Components/UploaderSection/UploaderSection.jsx";
import EditProfile from "../Components/EditProfile/EditProfile.jsx";
import Calendar from "../Components/Calendar/Calendar.jsx";
import History from "../Components/History/History.jsx"
import "./WelcomePage.css";
import { RequireAuth } from "../../requireAuth.jsx";
import { useAuth } from "../auth/AuthContext.jsx"
// import useCheckAccessToken from '../Components/useCheckAccessToken/useCheckAccessToken';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';


export default function WelcomePage() {

    const { isAuthenticated, callProtectedRoute } = useAuth();
    const navigate = useNavigate();

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const accessToken = localStorage.getItem('accessToken');
    const [snapshots, setSnapshots] = useState([]);

    const [selectedSnapshot, setSelectedSnapshot] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMM-yyyy'));

    const [aalert, setAlert] = useState([]);


    const handleSnapshotSelect = (resumeId) => {
        setSelectedSnapshot(resumeId);
    };
    const baseURL = 'http://127.0.0.1:5000';

    const handleFileUpload = async (base64EncodedString, filename) => {
        const accessToken = localStorage.getItem('accessToken'); // Retrieving the access token from local storage

        try {
            const base64Content = base64EncodedString.split(',')[1];
            const response = await axios.post(`${baseURL}/upload_resume_and_link_to_user_id`, {
                filename,
                data: base64Content
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data) {
                console.log('File uploaded successfully:', response.data);

                setAlert("File uploaded successfully")
                alert('File uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading the file:', error);
            alert('Error uploading the file. Please try again.');
        }
    };
    const getDocumentSnapshot = async () => {
        try {
            const response = await axios.get(`${baseURL}/get_document_url_by_document_and_user_id/`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.data) {
                console.log(response.data);
                setSnapshots(response.data.latest_snapshots); // Update the snapshots state
            }
        } catch (error) {
            console.error('Error retrieving document snapshots:', error);
        }
    };

    const handleAnalyzeClick = () => {
        if (selectedSnapshot) {
            navigate(`/analyze/${selectedSnapshot}`); // Use the navigate function to change the route
        } else {
            alert('Please select a document to analyze.');
        }
    };


    useEffect(() => {
        console.log(`isAuthenticated: ${isAuthenticated}`);

        if (isAuthenticated) {
            callProtectedRoute();

        }

    }, [isAuthenticated, callProtectedRoute, navigate]);

    // useEffect(() => {
    //     fetchMeetings();
    // }, []); // An empty dependency array means this effect runs once after the initial render

    const handleApplicationClick = () => {
        if (selectedSnapshot) {
            navigate(`/application/${selectedSnapshot}`); // Navigate to the application page with the resume ID
        } else {
            alert('Please select a document to apply with.');
        }
    };
    useEffect(() => {
        // Call fetchSnapshots when the component mounts
        getDocumentSnapshot();
    }, [aalert]); // Empty dependency array ensures this effect only runs once



    // const fetchMeetings = async () => {
    //     try {
    //         const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token from localStorage
    //         const response = await axios.get('http://127.0.0.1:5000/get-events', {
    //             headers: { Authorization: `Bearer ${accessToken}` } // Include the Authorization header
    //         });
    //         setMeetings(response.data); // Assuming the response data is the array of meetings
    //     } catch (error) {
    //         console.error('Error fetching meetings:', error);
    //     }
    // };


    return (
        <>
            <RequireAuth>
                <TopBar />

                <div className="welcomepage">
                    <div className="dashboardbox">
                        <UploaderSection
                            accessToken={accessToken}
                            onFileUpload={handleFileUpload}
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                        />


                    </div>

                    <div className="dashboardbox">
                        <div className="snapshot-gallery">
                            {snapshots.length > 0 ? (
                                snapshots.map(snapshot => (
                                    <div
                                        key={snapshot.resume_id}
                                        className={`snapshot-item ${selectedSnapshot === snapshot.resume_id ? 'selected' : ''}`}
                                        onClick={() => handleSnapshotSelect(snapshot.resume_id)}
                                    >
                                        <img
                                            src={snapshot.first_page_snapshot}
                                            alt={snapshot.resume_name}
                                        />
                                        <div className="snapshot-label">{snapshot.resume_name}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-snapshot-gallery">
                                    <p>No documents found. Please upload a file.</p>

                                </div>
                            )}
                            <div className="action-buttons">
                                <button onClick={handleAnalyzeClick} className="button analyze-button">Analyse</button>
                                <button onClick={handleApplicationClick} className="button apply-button">Apply</button>
                            </div>

                        </div>
                    </div>
                    <div className="dashboardbox">
                        <History />
                        <Calendar />
                    </div>


                </div>
            </RequireAuth>

            {/* <EditProfile /> */}
        </>
    )

}

