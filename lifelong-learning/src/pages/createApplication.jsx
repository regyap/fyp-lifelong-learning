import React, { useState } from 'react';

function CreateApplication() {
    const [description, setDescription] = useState('');
    const [salary, setSalary] = useState('');
    const [jobPosition, setJobPosition] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your logic here to handle form submission
        console.log('Form submitted:', { description, salary, jobPosition });
    };

    return (
        <div>
            <h1>Create Application</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Salary:</label>
                    <input
                        type="text"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                    />
                </div>
                <div>
                    <label>Job Position:</label>
                    <input
                        type="text"
                        value={jobPosition}
                        onChange={(e) => setJobPosition(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default CreateApplication;