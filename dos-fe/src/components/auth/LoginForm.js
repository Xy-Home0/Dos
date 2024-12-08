import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card, Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const isAdminLogin = location.pathname === '/admin/login';

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleRedirect = (user) => {
        // Get the intended URL from location state or use default based on role
        const intendedPath = location.state?.from || (user.role === 'admin' ? '/admin/products' : '/products');
        navigate(intendedPath, { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setApiError('');

        try {
            const response = await login(formData, isAdminLogin);
            if (response.user) {
                if (response.user.role === 'admin') {
                    if (!isAdminLogin) {
                        // Redirect admin to admin login if they try to use regular login
                        navigate('/admin/login', { 
                            state: { message: 'Please use admin login for administrator access.' }
                        });
                        return;
                    }
                    handleRedirect(response.user);
                } else {
                    if (isAdminLogin) {
                        setApiError('Access denied. Admin credentials required.');
                        return;
                    }
                    handleRedirect(response.user);
                }
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setApiError(error.message || 'Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: '500px' }}>
            <Card className="p-4 shadow">
                <h2 className="text-center mb-4">{isAdminLogin ? 'Admin Login' : 'Login'}</h2>
                {apiError && <Alert variant="danger">{apiError}</Alert>}
                {location.state?.message && (
                    <Alert variant="info">{location.state.message}</Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                        className="w-100 mb-3"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    {!isAdminLogin && (
                        <div className="text-center">
                            <Button 
                                variant="link" 
                                onClick={() => navigate('/register')}
                            >
                                Don't have an account? Register here
                            </Button>
                        </div>
                    )}

                    <Nav className="justify-content-center mt-3">
                        <Nav.Item>
                            {isAdminLogin ? (
                                <Nav.Link onClick={() => navigate('/login')}>Go to User Login</Nav.Link>
                            ) : (
                                <Nav.Link onClick={() => navigate('/admin/login')}>Admin Login</Nav.Link>
                            )}
                        </Nav.Item>
                    </Nav>
                </Form>
            </Card>
        </Container>
    );
};

export default LoginForm;
