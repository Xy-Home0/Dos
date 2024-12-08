import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, token } = useAuth();
    const location = useLocation();

    if (!token) {
        // Save the attempted URL for redirect after login
        return <Navigate to="/login" state={{ from: location.pathname }} />;
    }

    if (adminOnly && user?.role !== 'admin') {
        // Redirect non-admin users trying to access admin routes
        return <Navigate to="/products" state={{ message: 'Access denied. Admin privileges required.' }} />;
    }

    if (!adminOnly && user?.role === 'admin' && location.pathname !== '/admin/products') {
        // Redirect admin users to admin dashboard if they try to access user routes
        return <Navigate to="/admin/products" state={{ message: 'Redirected to admin dashboard.' }} />;
    }

    return children;
};

export default ProtectedRoute;