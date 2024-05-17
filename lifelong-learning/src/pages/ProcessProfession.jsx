import React, { useState } from 'react';
import TopBar from '../Components/TopBar/TopBar';
import "./profile.css";
import "./profession.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function ProcessProfession() {
    const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token from local storage    

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        industry: '',
        similarity: '',
        employmentType: [],
    });



    const handleCheckboxChange = (event) => {
        const { name, value } = event.target;
        const isChecked = event.target.checked;
        if (isChecked) {
            setFormData({ ...formData, [name]: [...formData[name], value] });
        } else {
            setFormData({ ...formData, [name]: formData[name].filter(item => item !== value) });
        }
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'radio') {
            setFormData({ ...formData, [name]: value });
        } else if (type === 'checkbox') {
            if (checked) {
                setFormData({ ...formData, [name]: [...formData[name], value] });
            } else {
                setFormData({ ...formData, [name]: formData[name].filter(item => item !== value) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };



    const handleSubmit = async (event) => {
        event.preventDefault();  // Prevent the default form submission behavior
        console.log(formData); // Log the form data
        try {
            // Make a POST request to the backend
            const response = await axios.post('http://127.0.0.1:5000/addprofession', formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,

                }
            });

            console.log('Added Profession:', response.data); // Log server response
            alert('Profession added successfully!');

            if (response.status === 200) {
                navigate('/welcome'); // Redirect on success
            }
        } catch (error) {
            console.error('Error adding profession:', error.response ? error.response.data : error.message);
            alert('Failed to add profession: ' + (error.response ? error.response.data.message : error.message));
        }
    };



    return (
        <>
            {/* <TopBar /> */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <div className="body">
                <div className="resume-profile">
                    <p>Profession</p>
                </div>
                <div className="container">
                    <form onSubmit={handleSubmit}>
                        <div className="user-details">
                            <div className="input-box">
                                <span className="details">Industry</span>
                                <select
                                    name="industry"
                                    required
                                    onChange={handleInputChange}
                                    value={formData.industry}
                                    className="bg-gray-200 text-gray-700 text-sm p-1"
                                >
                                    <option value="">Select your industry</option>

                                    <option value="Accountant">Accountant</option>
                                    <option value="Advocate">Advocate</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Apparel">Apparel</option>
                                    <option value="Arts">Arts</option>
                                    <option value="Automobile">Automobile</option>
                                    <option value="Aviation">Aviation</option>
                                    <option value="Banking">Banking</option>
                                    <option value="BPO">BPO</option>
                                    <option value="Business-Development">Business-Development</option>
                                    <option value="Chef">Chef</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Consultant">Consultant</option>
                                    <option value="Designer">Designer</option>
                                    <option value="Digital-Media">Digital-Media</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="HR">HR</option>
                                    <option value="Information-Technology">Information-Technology</option>
                                    <option value="Public-Relations">Public-Relations</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Teacher">Teacher</option>


                                </select>
                            </div>
                        </div>       <div className="similarity-details">
                            <span className="similarity-title">Similarity</span>
                            <div className="category">
                                <label htmlFor="opt1" className="dot one">
                                    <input
                                        type="radio"
                                        id="opt1"
                                        name="similarity"
                                        value="Entry"
                                        checked={formData.similarity === 'Entry'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Entry</span>
                                </label>

                                <label htmlFor="opt2" className="dot two">
                                    <input
                                        type="radio"
                                        id="opt2"
                                        name="similarity"
                                        value="Junior"
                                        checked={formData.similarity === 'Junior'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Junior</span>
                                </label>

                                <label htmlFor="opt3" className="dot three">
                                    <input
                                        type="radio"
                                        id="opt3"
                                        name="similarity"
                                        value="Free Lance" // Make sure the value here is exactly the same as what you set in state
                                        checked={formData.similarity === 'Free Lance'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Free Lance</span>
                                </label>

                                <label htmlFor="opt4" className="dot four">
                                    <input
                                        type="radio"
                                        id="opt4"
                                        name="similarity"
                                        value="Seasonal"
                                        checked={formData.similarity === 'Seasonal'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Seasonal</span>
                                </label>

                                <label htmlFor="opt5" className="dot five">
                                    <input
                                        type="radio"
                                        id="opt5"
                                        name="similarity"
                                        value="Leased"
                                        checked={formData.similarity === 'Leased'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Leased</span>
                                </label>

                                <label htmlFor="opt6" className="dot six">
                                    <input
                                        type="radio"
                                        id="opt6"
                                        name="similarity"
                                        value="Temporary"
                                        checked={formData.similarity === 'Temporary'}
                                        onChange={handleInputChange}
                                    />
                                    <span className="similarity">Temporary</span>
                                </label>
                            </div>

                        </div>

                        <div className="employment-container">
                            <span className="details">Employment Type</span>
                            <div className="input-box3">
                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="f-t"
                                        name="employmentType"
                                        value="Full-Time"
                                        checked={formData.employmentType.includes('Full-Time')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="f-t">Full-Time</label>
                                </div>
                                {/* Repeat for each employment type */}
                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="p-t"
                                        name="employmentType"
                                        value="Part-Time"
                                        checked={formData.employmentType.includes('Part-Time')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="p-t">Part-Time</label>
                                </div>

                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="p-t"
                                        name="employmentType"
                                        value="Free-Lance"
                                        checked={formData.employmentType.includes('Free-Lance')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="p-t">Free-Lance</label>
                                </div>

                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="p-t"
                                        name="employmentType"
                                        value="Seasonal"
                                        checked={formData.employmentType.includes('Seasonal')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="p-t">Seasonal</label>
                                </div>


                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="p-t"
                                        name="employmentType"
                                        value="Leased"
                                        checked={formData.employmentType.includes('Leased')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="p-t">Leased</label>
                                </div>


                                <div className="employment-type">
                                    <input
                                        type="checkbox"
                                        id="p-t"
                                        name="employmentType"
                                        value="Temporary"
                                        checked={formData.employmentType.includes('Temporary')}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="p-t">Temporary</label>
                                </div>
                                {/* Add more options as needed */}
                            </div>
                        </div>



                        < div className="button" >
                            <input type="submit" value="Save" />
                        </div >
                    </form >
                </div >

            </div >


        </>

    )
}