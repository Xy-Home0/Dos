import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProductCatalog from './components/shop/ProductCatalog';
import Cart from './components/shop/Cart';
import Checkout from './components/shop/Checkout';
import OrderConfirmation from './components/shop/OrderConfirmation';
import Orders from './components/shop/Orders'; // Added import statement
import ProductList from './components/admin/ProductList';
import ProductForm from './components/admin/ProductForm';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
    const location = useLocation();
    const { user } = useAuth();
    const isAuthPage = ['/login', '/register', '/admin/login'].includes(location.pathname);

    // Redirect admin users to admin dashboard if they try to access customer routes
    if (user?.is_admin && location.pathname === '/') {
        return <Navigate to="/admin/products" replace />;
    }

    return (
        <>
            {!isAuthPage && <Navbar />}
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<ProductCatalog />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/admin/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Protected Customer Routes */}
                <Route path="/cart" element={
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                } />
                <Route path="/order-confirmation" element={
                    <ProtectedRoute>
                        <OrderConfirmation />
                    </ProtectedRoute>
                } />
                <Route path="/orders" element={
                    <ProtectedRoute>
                        <Orders />
                    </ProtectedRoute>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin/products" element={
                    <ProtectedRoute adminOnly={true}>
                        <ProductList />
                    </ProtectedRoute>
                } />
                <Route path="/admin/products/create" element={
                    <ProtectedRoute adminOnly={true}>
                        <ProductForm />
                    </ProtectedRoute>
                } />
                <Route path="/admin/products/edit/:id" element={
                    <ProtectedRoute adminOnly={true}>
                        <ProductForm />
                    </ProtectedRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to={user?.is_admin ? "/admin/products" : "/"} replace />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;