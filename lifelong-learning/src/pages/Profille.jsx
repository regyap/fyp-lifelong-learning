import React, { useState, useEffect } from 'react';
import './profile.css';
import TopBar from '../Components/TopBar/TopBar';

export default function Profille() {
  const email = localStorage.getItem('userEmail');
  useEffect(() => {
    getUserProfile();
  }, []);
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
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the payload
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      title: formData.title,
      phone_number: formData.phoneNumber,
      email_address: formData.emailAddress,
      birth_date: formData.birthDate,
      nationality: formData.nationality,
      street_number: formData.streetNumber,
      city: formData.city,
      postal_code: formData.postalCode,
      country: formData.country
    };

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:5000/editprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle response data or confirmation
      const data = await response.json();
      console.log('Profile update response:', data);
      alert('Your profile has been updated successfully!');

      // Perhaps navigate the user to a different page or show a success message
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };


  async function getUserProfile() {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('http://127.0.0.1:5000/get-user-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const profileData = await response.json();
      console.log('Profile Data:', profileData);

      const [, , , , firstName, lastName, title, phoneNumber, birthDate, nationality, streetNumber, city, postalCode, country] = profileData;

      // Use the extracted data to set the form state
      setFormData({
        ...formData,
        firstName: firstName || '',
        lastName: lastName || '',
        title: title || '',
        phoneNumber: phoneNumber || '',
        emailAddress: email, // Assuming email comes from a different source since it's not in the array
        birthDate: birthDate ? new Date(birthDate).toISOString().split('T')[0] : '', // Converting to YYYY-MM-DD format
        nationality: nationality || '',
        streetNumber: streetNumber || '',
        city: city || '',
        postalCode: postalCode || '',
        country: country || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }


  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <TopBar></TopBar>
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
                    name="birth-date"
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