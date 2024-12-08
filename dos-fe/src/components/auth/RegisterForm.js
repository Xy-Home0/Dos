import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        const isLongEnough = password.length >= 8;

        const errors = [];
        if (!isLongEnough) errors.push('Password must be at least 8 characters long');
        if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
        if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
        if (!hasNumbers) errors.push('Password must contain at least one number');
        if (!hasSpecialChar) errors.push('Password must contain at least one special character (@$!%*?&)');

        return errors;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateContactNumber = (number) => {
        const phoneRegex = /^([0-9\s\-\+\(\)]*)$/;
        return phoneRegex.test(number) && number.length >= 10;
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 255) {
            newErrors.name = 'Name cannot exceed 255 characters';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        } else if (formData.email.length > 255) {
            newErrors.email = 'Email cannot exceed 255 characters';
        }

        // Contact number validation
        if (!formData.contact_number) {
            newErrors.contact_number = 'Contact number is required';
        } else if (!validateContactNumber(formData.contact_number)) {
            newErrors.contact_number = 'Please enter a valid contact number (minimum 10 digits)';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const passwordErrors = validatePassword(formData.password);
            if (passwordErrors.length > 0) {
                newErrors.password = passwordErrors.join(', ');
            }
        }

        // Password confirmation validation
        if (!formData.password_confirmation) {
            newErrors.password_confirmation = 'Password confirmation is required';
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setApiError('');

        try {
            const response = await register(formData);
            if (response.user) {
                navigate('/login'); // Redirect to login page after successful registration
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setApiError(error.message || 'Failed to register. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: '500px' }}>
            <Card className="p-4 shadow">
                <h2 className="text-center mb-4">Create an Account</h2>
                {apiError && <Alert variant="danger">{apiError}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                            placeholder="Enter your full name"
                            maxLength={255}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            placeholder="Enter your email"
                            maxLength={255}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Contact Number</Form.Label>
                        <Form.Control
                            type="tel"
                            name="contact_number"
                            value={formData.contact_number}
                            onChange={handleChange}
                            isInvalid={!!errors.contact_number}
                            placeholder="Enter your contact number"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.contact_number}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Enter a valid contact number (minimum 10 digits)
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            placeholder="Enter your password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters (@$!%*?&).
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            isInvalid={!!errors.password_confirmation}
                            placeholder="Confirm your password"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password_confirmation}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                        className="w-100 mb-3"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <div className="text-center">
                        <Button 
                            variant="link" 
                            onClick={() => navigate('/login')}
                        >
                            Already have an account? Login here
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default RegisterForm;
