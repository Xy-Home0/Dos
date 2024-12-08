import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const register = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            const data = await response.json();
            const { user: userData, token: authToken } = data;
            
            // Store the token and user data
            setUser(userData);
            setToken(authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', authToken);
            
            return data;
        } catch (error) {
            throw error;
        }
    };

    const login = async (formData, isAdmin = false) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isAdmin && { 'X-Admin-Login': 'true' })
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw error;
            }

            const data = await response.json();
            const { user: userData, token: authToken } = data;
            
            // Store the token and user data
            setUser(userData);
            setToken(authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', authToken);
            
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (token) {
                const response = await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    console.error('Logout failed:', await response.text());
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear everything regardless of API call success
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;