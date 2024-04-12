import React, { useEffect, useState } from 'react';
import { Uploader } from "uploader"; // Installed by "react-uploader".
import 'react-dropzone-uploader/dist/styles.css';
import Dropzone from 'react-dropzone-uploader';
import axios from "axios";
import "./UploaderSection.css";
import useCheckAccessToken from '../useCheckAccessToken/useCheckAccessToken';

const UploaderSection = ({ accessToken, onFileUpload, uploadedFiles, setUploadedFiles }) => {


    const baseURL = 'http://127.0.0.1:5000'
    // const [uploadedFiles, setUploadedFiles] = useState([]);

    // const getUploadParams = ({ meta }) => {
    //     return { url: baseURL }
    //     // return { baseURL, meta: { fileUrl: `${baseURL}/${encodeURIComponent(meta.name)}` } }
    // }

    // called every time a file's `status` changes
    const handleChangeStatus = ({ file }, status) => {
        if (status === 'done') {
            setUploadedFiles(prev => [...prev, file]);
        } else if (status === 'removed') {
            setUploadedFiles(prev => prev.filter(eachFile => eachFile.name !== file.name));
        }
    };


    // const uploadFile = async (file, user_id) => {
    //     const base64EncodedString = await fileToBase64(file); // Assuming fileToBase64 function exists as shown earlier
    //     const filename = file.name;

    //     try {
    //         const response = await axios.post(baseURL + '/upload_resume_and_link_to_user_id', {
    //             filename: filename,
    //             data: base64EncodedString.split(',')[1], // Removes the data URL scheme part
    //         });

    //         console.log(response.data.message);
    //         alert('File uploaded successfully');
    //     } catch (error) {
    //         console.error('Error uploading the file:', error);
    //         alert('Error uploading the file');
    //     }
    // };



    // Helper function to convert file to base64
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Adjusted handleSubmit function
    const handleSubmit = async (files) => {
        const uploadPromises = files.map(file => {
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.readAsDataURL(file.file);
                reader.onload = () => {
                    const base64EncodedString = reader.result;
                    onFileUpload(base64EncodedString, file.file.name).then(resolve).catch(reject);
                };
                reader.onerror = error => reject(error);
            });
        });

        await Promise.all(uploadPromises);
        console.log("All uploads completed.");
    };





    //-----------------------------------------------------------------------------------------
    // for the select document function
    //-----------------------------------------------------------------------------------------

    // const [imageUrls, setImageUrls] = useState([]);
    // // Simulated fetch call to get image URLs (add this inside the try block after file uploads are successful)
    // const fetchImageUrls = async () => {
    //     const response = await axios.get(`http://127.0.0.1:5000/images/3`); // Use the actual endpoint
    //     setImageUrls(response.data); // Assuming the endpoint returns a list of image URLs
    // };
    // fetchImageUrls();


    return (
        <>
            <div className="container w-auto">
                <Dropzone
                    // getUploadParams={getUploadParams}
                    onChangeStatus={handleChangeStatus}
                    onSubmit={handleSubmit}
                    accept="application/pdf,application/docx,application/doc"
                    maxFiles={1} // Set maxFiles to 1 to limit the number of files
                    inputContent={(files, extra) => (files === undefined && files[0].file.type !== 'application/pdf' ? 'PDF files only' : 'Drag Files')}
                    styles={{
                        dropzoneReject: (files, extra) => (files === undefined && files[0].file.type !== 'application/pdf' ? { borderColor: 'red', backgroundColor: '#DAA' } : {}),
                        inputLabel: (files, extra) => (files === undefined && files[0].file.type !== 'application/pdf' ? { color: 'red' } : {}),
                    }}
                    className="dropzone"
                />
                {uploadedFiles.length > 0 && (
                    <div>
                        <h2>Uploaded Files:</h2>
                        <ul>
                            {uploadedFiles.map((file, index) => (
                                <li key={index}>
                                    <strong>File Name:</strong> {file.name}, <strong>File Type:</strong> {file.type}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* <div>
                <div className="image-gallery">
                    {imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Uploaded Image ${index}`} className="uploaded-image" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`Uploaded Image ${index}`} className="w-full object-cover" />
                    ))}
                </div>


            </div> */}
        </>

    )


}
export default UploaderSection;

