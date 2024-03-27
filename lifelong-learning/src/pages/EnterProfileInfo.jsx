import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./enterprofileinfo.css";

const EditResumeProfile = () => {
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        // Add more fields as necessary...
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Post the profile data to the backend
        try {
            // replace this with your actual POST request to your backend
            // await axios.post('/api/profile', profile);

            console.log('Profile saved:', profile);
            // Navigate to the next page or display success message
            navigate('/dashboard'); // or wherever the user should go next
        } catch (error) {
            console.error('Error saving profile:', error);
            // Handle errors, possibly set an error state and display message
        }
    };

    return (
        <div className="flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-4">


                <div className="formboxclasswhole">
                    <div className="formboxclass">
                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={profile.firstName}
                                    onChange={handleChange}
                                    className="flex-1 p-6 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={profile.lastName}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>

                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="Title"
                                    placeholder="Title"
                                    value={profile.title}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>

                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="phonenum"
                                    placeholder="Phone Number"
                                    value={profile.phonenum}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Repeat for other fields... */}
                        </div>
                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="Email"
                                    placeholder="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>

                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="birthdate"
                                    placeholder="Birth Date"
                                    value={profile.birthdate}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="Nationality"
                                    placeholder="Nationality"
                                    value={profile.nationality}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>

                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="Street Number"
                                    placeholder="Street Number"
                                    value={profile.streetnumber}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={profile.city}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>

                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="Postal Code"
                                    placeholder="Postal"
                                    value={profile.postal}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    value={profile.country}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="formboxclass">
                        <div className="formbox">
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={profile.firstName}
                                    onChange={handleChange}
                                    className="flex-1 p-6 border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flexinputs">
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={profile.lastName}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border border-gray-300 rounded"
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 mt-4 font-bold text-back bg-black rounded hover:bg-gray-700"
                >
                    Save Profile
                </button>
            </form>
        </div>
    );
};

export default EditResumeProfile;
