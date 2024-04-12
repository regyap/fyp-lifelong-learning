import React, { useState, useEffect } from "react";
import TopBar from "../Components/TopBar/TopBar";
import { useParams } from 'react-router-dom'
import axios from "axios";
import "./analyzer.css"

const Analyzer = () => {
    const { documentId } = useParams();
    const [textData, setTextData] = useState([]);
    const [text, setText] = useState("");
    const [inputText, setInputText] = useState("");
    const [selectedJobPosition, setSelectedJobPosition] = useState("Information-Technology");
    const [loading, setLoading] = useState(false); // Loading state for API request
    const [jobPositions] = useState([
        "Accountant",
        "Advocate",
        "Agriculture",
        "Apparel",
        "Arts",
        "Automobile",
        "Aviation",
        "Banking",
        "BPO",
        "Business-Development",
        "Chef",
        "Construction",
        "Consultant",
        "Designer",
        "Digital-Media",
        "Engineering",
        "Finance",
        "Fitness",
        "Healthcare",
        "HR",
        "Information-Technology",
        "Public-Relations",
        "Sales",
        "Teacher"
    ]);
    const [snapshotImages, setSnapshotImages] = useState([]);

    const baseURL = 'http://127.0.0.1:5000';
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        // Fetch the analysis for the document when the component mounts
        fetchAnalysis();
        fetchSnapshots();
    }, [documentId]); // Run when documentId or selectedJobPosition changes


    const fetchAnalysis = async () => {
        setLoading(true); // Set loading to true when starting API request
        try {
            const response = await axios.post(`${baseURL}/provide_resume_feedback`, {
                documentId,
                selectedJobPosition
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const parsedFeedback = parseFeedbackStringToJSON(response.data);
            setTextData(parsedFeedback);
            console.log(parsedFeedback);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            // Handle error, maybe set an error state and show it to the user
        } finally {
            setLoading(false); // Set loading to false after API request completes
        }
    };
    function parseFeedbackStringToJSON(feedbackString) {
        // Split the feedback into items using the title pattern as a separator
        // Titles are assumed to be in format: "**Title:**"
        const feedbackItems = feedbackString.split(/\d+\.\s\*\*/).slice(1); // Remove the first element which is usually empty
        const parsedItems = feedbackItems.map(item => {
            // Extract the title by finding the first occurrence of ":" and trimming the asterisks
            let titleEndIndex = item.indexOf(":");
            let title = item.substring(0, titleEndIndex).trim();

            // Extract the description by taking everything after the first colon
            let description = item.substring(titleEndIndex + 1).trim();

            // Return the structured feedback item
            return { title, description };
        });

        return parsedItems;
    }

    const fetchSnapshots = async () => {
        try {
            const snapshotsResponse = await axios.post(`${baseURL}/get_snapshots_by_user_id`, {
                documentId,
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(snapshotsResponse.data);
            const snapshotsData = snapshotsResponse.data;
            if (snapshotsData.snapshots && Array.isArray(snapshotsData.snapshots)) {
                // Set the snapshotImages state with the array of URLs from the first snapshot object
                setSnapshotImages(snapshotsData.snapshots[0].snapshot_urls.map(url => url.replace(/[\{\}]/g, ''))); // Removing curly braces if they are part of the string
            } else {
                // Handle the case where snapshots is not an array
                console.error('Expected snapshots to be an array, but received:', snapshotsData.snapshots);
            }
        } catch (error) {
            console.error('Error fetching snapshots:', error);
        }
    };


    const handleRegenerateFeedback = () => {
        setLoading(false)
        fetchAnalysis();
    };

    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
            <div className="analybody">
                <TopBar />

                <div className="analyzer-page flex">

                    <aside className="w-1/2 h-screen bg-gray-900 p-5 overflow-y-auto flex flex-col ">
                        <div className="mb-5 flex">
                            {/* Dropdown button */}
                            <select
                                className="dropdown-button h-10 text-black text-small" // Increase the height to 10 pixels
                                value={selectedJobPosition}
                                onChange={(e) => setSelectedJobPosition(e.target.value)}
                            >
                                <option value="">Select Job Position</option>
                                {jobPositions.map((position, index) => (
                                    <option className="text-black" key={index} value={position}>{position}</option>
                                ))}
                            </select>

                            {/* Regenerate Feedback button */}
                            {/* Regenerate Feedback button */}
                            <button
                                disabled={loading} // Disable the button when loading
                                className="regenerate-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleRegenerateFeedback} // Call handleRegenerateFeedback function when button is clicked
                            >
                                {loading ? ( // Show loading indicator if loading, otherwise show regular text
                                    <span>Loading...</span>
                                ) : (
                                    <span>Regenerate Feedback</span>
                                )}
                            </button>
                        </div>


                        {/* Space for generated text */}
                        <div className="generated-text">
                            <p className="text-black ">{text}</p>



                            <div className="feedback-container">
                                {textData.map((feedback) => (
                                    <div key={feedback.title} className="feedback-item">
                                        <h3>{feedback.title}</h3>
                                        <p>{feedback.description}</p>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </aside >

                    <main className="w-1/2 bg-gray-800 p-6">
                        <div className="snapshot-container-a">
                            {snapshotImages.map((snapshot_urls, index) => (
                                <div key={index} className="snapshot-item-a">
                                    <img src={snapshot_urls.replace(/[\{\}]/g, '')} alt={`Snapshot ${index + 1}`} className="snapshot-image-a" />
                                </div>
                            ))}
                        </div>
                    </main>



                </div >
            </div>
        </>
    );
};

export default Analyzer;
