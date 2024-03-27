import React, { useState } from "react";
import TopBar from "../Components/TopBar/TopBar";

const Analyzer = () => {
    const [textArea, setTextArea] = useState("");
    const [inputText, setInputText] = useState("");

    const simulateTypingEffect = (newText) => {
        let index = 0;
        const interval = 50; // Interval in milliseconds between each character

        const typeNextChar = () => {
            if (index < newText.length) {
                setTextArea((prev) => prev + newText.charAt(index));
                index++;
                setTimeout(typeNextChar, interval);
            }
        };

        setTextArea(""); // Clear the existing text
        typeNextChar(); // Start typing effect
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form from submitting normally
        simulateTypingEffect(inputText); // Simulate typing effect with the input text
    };

    return (
        <>
            <TopBar />
            <div className="analyzer-container">


                {/* <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type something..."
                    />
                    <button type="submit">Submit</button>
                </form>
                <div className="typing-effect-container" style={{ whiteSpace: "pre-wrap" }}>
                    {textArea}
                </div> */}


            </div>
        </>
    );
};

export default Analyzer;
