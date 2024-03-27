import React, { useState } from 'react';

const NewJobModal = ({ isOpen, setIsOpen, fetchJobListings }) => {
    const [formData, setFormData] = useState({
        title: '',
        salary: '',
        description: '',
        // Add more fields as necessary
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/jobListings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                fetchJobListings(); // Refresh listings
                setIsOpen(false); // Close modal
            } else {
                console.error('Failed to create job listing');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
                    <div className="bg-white p-4 rounded-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Create New Job Listing</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" htmlFor="title">Job Title</label>
                                <input className="form-input w-full" type="text" name="title" id="title" required value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" htmlFor="salary">Salary</label>
                                <input className="form-input w-full" type="text" name="salary" id="salary" required value={formData.salary} onChange={handleChange} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
                                <textarea className="form-textarea w-full" name="description" id="description" rows="3" required value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            {/* Add more fields as necessary */}
                            <div className="flex items-center justify-between">
                                <button type="button" className="btn border-gray-200" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewJobModal;
