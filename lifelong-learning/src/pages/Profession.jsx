import React, { useState } from 'react';
import TopBar from '../Components/TopBar/TopBar';
import "./profile.css";
import "./profession.css";


export default function Profession() {

    const [formData, setFormData] = useState({
        industry: '',
        similarity: '',
        employmentType: [],
        skills: [],
        currentSkill: ''
    });

    const handleSkillChange = (e) => {
        setFormData({ ...formData, currentSkill: e.target.value });
    };

    const addSkill = (e) => {
        e.preventDefault();
        if (formData.currentSkill && !formData.skills.includes(formData.currentSkill)) {
            setFormData({ ...formData, skills: [...formData.skills, formData.currentSkill], currentSkill: '' });
        }
    };

    const deleteSkill = (skillToDelete) => {
        setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToDelete) });
    };


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            // Logic for checkboxes
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: checked
                    ? [...prevFormData[name], value]
                    : prevFormData[name].filter(item => item !== value),
            }));
        } else if (type === 'radio') {
            // Logic for radio buttons
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value,
            }));
        } else {
            // Logic for other inputs including 'select'
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Handle form submission, e.g., send data to an API
    };



    return (
        <>
            <TopBar />
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
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    {/* Add more options as needed */}
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
                                        value="Free Lance"
                                        checked={formData.similarity === 'FreeLance'}
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





                                {/* Add more options as needed */}
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

                        {/* Skills section */}
                        <div className="skills-container">
                            <span className="details">Skills</span>

                            <input
                                type="text"
                                placeholder="Enter a skill and press Add"
                                value={formData.currentSkill}
                                onChange={handleSkillChange}
                                className="mt-2 p-2 border border-gray-300 rounded text-sm"
                            />
                            <button
                                type="button"
                                onClick={addSkill}
                                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                                Add
                            </button>
                            <div className="skills-box">
                                {formData.skills.map((skill, index) => (
                                    <div key={index} className="inline-flex items-center bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-semibold mr-2 mb-2">
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => deleteSkill(skill)}
                                            className="ml-1 bg-blue-700 hover:bg-blue-800 rounded-full p-0.5 inline-flex items-center justify-center text-xs"
                                            style={{ width: '16px', height: '16px' }} // Adjust size directly if needed
                                        >
                                            &times; {/* Using HTML entity for multiplication sign as a close icon */}
                                        </button>
                                    </div>
                                ))}
                            </div>

                        </div>



                        <div className="button">
                            <input type="submit" value="Save" />
                        </div>
                    </form>
                </div>

            </div>


        </>

    )
}