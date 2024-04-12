import React, { useState, useEffect } from 'react';
import 'flowbite';
import axios from 'axios';

export default function EditPageForCompany() {
    const [companyData, setCompanyData] = useState({
        companyName: '',
        companyLocation: '',
        companyPhone: '',
        companyPhoto: null // Assuming multiple photos can be uploaded
    });

    // Function to fetch company data from server
    const fetchCompanyData = async () => {
        try {
            const response = await axios.get('/api/company'); // Replace '/api/company' with your backend endpoint to fetch company data
            setCompanyData(response.data); // Assuming the response data contains company information
        } catch (error) {
            console.error('Error fetching company data:', error);
        }
    };

    useEffect(() => {
        fetchCompanyData();
    }, []);

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send updated company data to server
            const response = await axios.post('/api/update-company', companyData); // Replace '/api/update-company' with your backend endpoint to update company data
            console.log('Company profile updated:', response.data);
        } catch (error) {
            console.error('Error updating company profile:', error);
        }
    };

    // Function to handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Function to handle file input changes for company photos
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCompanyData(prevData => ({
            ...prevData,
            companyPhoto: file
        }));
    };

    return (
        <div className="container mx-auto">
            <form onSubmit={handleSubmit}>
                <label>Company Name</label>
                <input type="text" name="companyName" value={companyData.companyName} onChange={handleChange} />

                <label>Company Location</label>
                <input type="text" name="companyLocation" value={companyData.companyLocation} onChange={handleChange} />

                <label>Company Phone</label>
                <input type="text" name="companyPhone" value={companyData.companyPhone} onChange={handleChange} />

                <label>Company Photos</label>
                <input type="file" name="companyPhotos" onChange={handleFileChange} multiple />

                <button type="submit">Save</button>
            </form>
        </div>
    );
}
