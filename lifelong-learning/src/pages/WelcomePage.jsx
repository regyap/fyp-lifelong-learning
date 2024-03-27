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

export default function WelcomePage() {

    const { isAuthenticated, callProtectedRoute } = useAuth();
    const navigate = useNavigate();

    const [uploadedFiles, setUploadedFiles] = useState([]);
    const accessToken = localStorage.getItem('accessToken');


    const handleFileUpload = async (base64EncodedString, filename) => {
        const baseURL = 'http://127.0.0.1:5000'; // Adjust according to your server's URL
        const accessToken = localStorage.getItem('accessToken'); // Retrieving the access token from local storage

        try {
            // Split the base64 string to remove the data URL part
            const base64Content = base64EncodedString.split(',')[1];

            // Make a POST request to your backend endpoint for file uploading
            const response = await axios.post(`${baseURL}/upload_resume_and_link_to_user_id`, {
                filename,
                data: base64Content
            }, {
                headers: {
                    // Include the access token in the Authorization header
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                console.log('File uploaded successfully:', response.data);
                // Optionally, update any related state or inform the user of the successful upload
                alert('File uploaded successfully');
            }
        } catch (error) {
            console.error('Error uploading the file:', error);
            alert('Error uploading the file. Please try again.');
        }
    };


    useEffect(() => {
        console.log(`isAuthenticated: ${isAuthenticated}`);

        if (isAuthenticated) {
            callProtectedRoute();

        }

    }, [isAuthenticated, callProtectedRoute, navigate]);
    return (
        <>
            <RequireAuth>
                <TopBar />

                <div className="welcomepage">

                    <div className="dashboardbox">
                        <Calendar />
                    </div>
                    <div className="dashboardbox">
                        <UploaderSection
                            accessToken={accessToken}
                            onFileUpload={handleFileUpload}
                            uploadedFiles={uploadedFiles}
                            setUploadedFiles={setUploadedFiles}
                        />
                    </div>
                    <div className="dashboardbox">
                        <History />
                    </div>

                </div>
            </RequireAuth>

            {/* <EditProfile /> */}
        </>
    )

}

