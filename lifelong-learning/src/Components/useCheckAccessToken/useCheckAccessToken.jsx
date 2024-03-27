import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useCheckAccessToken = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);



    useEffect(() => {
        const checkAccessToken = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.log("No access token found.");
                setError('No access token found.');
                navigate('/login');
            } else {
                try {
                    const response = await fetch('/protected', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Token verification failed');
                    }
                    const data = await response.json();
                    console.log("Access token is valid.", data);
                } catch (error) {
                    console.error("Access token verification error:", error);
                    setError("Access token verification error");
                    navigate('/login');
                }
            }
        };
        checkAccessToken();
    }, [navigate]);

    if (error) {
        return { error };
    }


};


// const useCheckAccessToken = () => {
//     const navigate = useNavigate();
//     const [error, setError] = useState(null);

//     // useEffect(() => {
//     // const checkAccessToken = async () => {
//     const accessToken = localStorage.getItem('accessToken');

//     if (!accessToken) {
//         console.log("No access token found.");
//         navigate('/login');
//     } else {
//         try {
//             const response = fetch('/protected', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${accessToken}`
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error('Token verification failed');
//             }

//             console.log("Access token is valid.");
//         } catch (error) {
//             console.error("Access token verification error:", error);
//             navigate('/login');
//         }
//     }
//     // };

//     // checkAccessToken();
// }, [navigate]);

//     const postData = async () => {
//         if (!accessToken) {
//             console.log("No access token found.");
//             setError('No access token found.');
//             // navigate('/login');
//         }
//         else {
//             try {
//                 const response = await fetch('/protected', {
//                     headers: {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'Authorization': `Bearer ${accessToken}`
//                         },
//                     },
//                 });

//                 if (!response.ok) {
//                     setError('Token verification failed');
//                 }
//             } catch (error) {
//                 setError("Access token verification error:", error);
//             }
//         }
//     };

//     postData();

//     // if (error) {
//     //     navigate('/login');
//     // }
//     // return;
// }

export default useCheckAccessToken;
