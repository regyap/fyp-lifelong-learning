import { set } from 'date-fns';
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const refreshToken = async () => {
        const refresh_token = localStorage.getItem('refreshToken'); // Assume you store the refresh token in local storage
        const response = await fetch('/refresh', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refresh_token}`
            },
        });
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access_token);
            return data.access_token;
        } else {
            // Handle error - redirect to login or show message
            throw new Error('Failed to refresh token.');
        }
    };
    const callProtectedRoute = async () => {
        let accessToken = localStorage.getItem('accessToken');
        try {
            let response = await fetch('/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            // If the first attempt is not OK, try to refresh the token
            if (!response.ok) {
                accessToken = await refreshToken();
                // Retry the protected route call with the new access token
                response = await fetch('/protected', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
            }

            if (!response.ok) {
                setIsAuthenticated(false);
                navigate('/login')
                throw new Error('Access denied after refresh.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);

        }
    };


    function logout() {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userDomain');
        navigate('/login');

    }

    // Provide any additional auth functions as needed
    const value = {
        accessToken,
        isAuthenticated,
        logout,
        setAccessToken, // Define setAccessToken
        setIsAuthenticated, // Define setIsAuthenticated
        refreshToken,
        callProtectedRoute,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
