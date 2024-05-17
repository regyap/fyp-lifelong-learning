import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';
import axios from 'axios';
// import TopBar from '../Components/TopBar/TopBar';

export default function ProcessProfile() {
    const email = localStorage.getItem('userEmail');
    const userdomain = localStorage.getItem('userDomain');
    const navigate = useNavigate();

    console.log(email);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        title: '',
        phoneNumber: '',
        emailAddress: '',
        birthDate: '',
        nationality: '',
        streetNumber: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => {
            const updatedState = { ...prevState, [name]: value };
            console.log('Updated State:', updatedState);
            return updatedState;
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Construct the payload
        const payload = {
            first_name: String(formData.firstName),
            last_name: String(formData.lastName),
            title: String(formData.title),
            phone_number: String(formData.phoneNumber),
            email_address: String(formData.emailAddress),
            birth_date: String(formData.birthDate),
            nationality: String(formData.nationality),
            street_number: String(formData.streetNumber),
            city: String(formData.city),
            postal_code: String(formData.postalCode),
            country: String(formData.country)
        };
        console.log(payload);

        // Fetching the accessToken from localStorage
        const accessToken = localStorage.getItem('accessToken');
        console.log('Sending with accessToken:', accessToken);

        try {
            const response = await axios.post('http://127.0.0.1:5000/addprofile',
                {
                    first_name: String(formData.firstName),
                    last_name: String(formData.lastName),
                    title: String(formData.title),
                    phone_number: String(formData.phoneNumber),
                    email_address: String(formData.emailAddress),
                    birth_date: String(formData.birthDate),
                    nationality: String(formData.nationality),
                    street_number: String(formData.streetNumber),
                    city: String(formData.city),
                    postal_code: String(formData.postalCode),
                    country: String(formData.country)
                }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            console.log('Response data:', response.data); // Log the response data

            if (response.status === 200) {
                alert('Your profile has been updated successfully!');
                navigateBasedOnDomain(userdomain); // Navigate based on the user's domain
            } else {
                throw new Error(`HTTP error! status: ${response.status}, message: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            alert(`Error updating profile: ${error.message}`);
        }
    };


    // Helper function to navigate based on user domain
    const navigateBasedOnDomain = (userdomain) => {
        if (userdomain == 'student') {
            navigate("/processprofession");
        } else if (userdomain == 'recruiter') {
            navigate("/processcompany");
        }
    }



    // async function getUserProfile() {
    //     try {
    //         const accessToken = localStorage.getItem('accessToken');
    //         const response = await fetch('http://127.0.0.1:5000/get-user-profile', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${accessToken}`
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const profileData = await response.json();
    //         console.log('Profile Data:', profileData);

    //         const [, , , , firstName, lastName, title, phoneNumber, birthDate, nationality, streetNumber, city, postalCode, country] = profileData;

    //         // Use the extracted data to set the form state
    //         setFormData({
    //             ...formData,
    //             firstName: profileData.firstName || '',
    //             lastName: profileData.lastName || '',
    //             email: profileData.email || '',
    //             title: profileData.title || '',
    //             phoneNumber: profileData.phoneNumber || '',
    //             emailAddress: email,
    //             birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '',
    //             nationality: profileData.nationality || '',
    //             streetNumber: profileData.streetNumber || '',
    //             city: profileData.city || '',
    //             postalCode: profileData.postalCode || '',
    //             country: profileData.country || ''
    //         });
    //     } catch (error) {
    //         console.error('Error fetching user profile:', error);
    //     }
    // }


    return (
        <>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* <TopBar></TopBar> */}
            <div className="body">

                <div className="resume-profile">
                    <p>Your Profile</p>
                </div>
                <div className="container">
                    <form onSubmit={handleSubmit}>
                        <div className="user-details">
                            <div className="input-container">
                                <div className="input-box2">
                                    <span className="details">First Name</span>
                                    <input
                                        type="text"
                                        placeholder="Enter your first name"
                                        name="firstName"
                                        required
                                        onChange={handleChange}
                                        value={formData.firstName}
                                    />
                                </div>
                                <div className="input-box2">
                                    <span className="details">Last Name</span>
                                    <input
                                        type="text"
                                        placeholder="Enter your last name"
                                        name="lastName"
                                        required
                                        onChange={handleChange}
                                        value={formData.lastName}
                                    />
                                </div>
                            </div>
                            <div className="input-box">
                                <span className="details">Title</span>

                                <input
                                    type="text"
                                    placeholder="Enter your title"
                                    name="title"
                                    required
                                    onChange={handleChange}
                                    value={formData.title}
                                />
                            </div>
                            <div className="input-box">
                                <span className="details">Phone Number</span>

                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    name="phoneNumber"
                                    required
                                    onChange={handleChange}
                                    value={formData.phoneNumber}
                                />

                            </div>
                            <div className="input-box">
                                <span className="details">Email Address</span>


                                <input
                                    type="text"
                                    placeholder="Enter your email address"
                                    className="email bg-gray-200" // Tailwind class for gray background
                                    name="email"
                                    required
                                    onChange={handleChange}
                                    value={email}
                                    disabled
                                />

                            </div>
                            <div className="input-container">
                                <div className="input-box2">
                                    <span className="details">Birth Date</span>


                                    <input
                                        type="date"
                                        placeholder="Enter your birth date"
                                        name="birthDate"
                                        required
                                        onChange={handleChange}
                                        value={formData.birthDate}
                                    />

                                </div>
                                <div className="input-box2">
                                    <span className="details">Nationality</span>


                                    <input
                                        type="text"
                                        placeholder="Enter your nationality"
                                        name="nationality"
                                        required
                                        onChange={handleChange}
                                        value={formData.nationality}
                                    />
                                </div>
                            </div>
                            <div className="input-container">

                                <div className="input-box2">
                                    <span className="details">Street Number</span>
                                    <input
                                        type="text"
                                        placeholder="Enter your street number"
                                        name="streetNumber"
                                        required
                                        onChange={handleChange}
                                        value={formData.streetNumber}
                                    />
                                </div>

                                <div className="input-box2">
                                    <span className="details">City</span>
                                    <input
                                        type="text"
                                        placeholder="Enter your city"
                                        name="city"
                                        required
                                        onChange={handleChange}
                                        value={formData.city}
                                    />
                                </div>
                            </div>
                            <div className="input-container">
                                <div className="input-box2">
                                    <span className="details">Postal Code</span>

                                    <input
                                        type="text"
                                        placeholder="Enter your postal code"
                                        name="postalCode"
                                        required
                                        onChange={handleChange}
                                        value={formData.postalCode}
                                    />

                                </div>
                                <div className="input-box2">
                                    <span className="details">Country</span>
                                    <input
                                        type="text"
                                        placeholder="Enter your Country"
                                        name="country"
                                        required
                                        onChange={handleChange}
                                        value={formData.country}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="profilebutton">
                            <input type="submit" value="Save" />
                        </div>
                    </form>
                </div>

            </div>

        </>
    )

}