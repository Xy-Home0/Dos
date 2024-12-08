import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Container, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProductForm = () => {
    const { id } = useParams();
    const mode = id ? 'edit' : 'create';
    const [formData, setFormData] = useState({
        barcode: '',
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    const loadProduct = useCallback(async () => {
        if (!id) return; // Only load if we have an ID
        
        try {
            const response = await fetch(`http://localhost:8000/api/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (response.ok) {
                setFormData({
                    barcode: data.barcode,
                    name: data.name,
                    description: data.description,
                    price: data.price.toString(),
                    quantity: data.quantity.toString(),
                    category: data.category
                });
            } else {
                setServerError(data.message || 'Failed to load product details');
            }
        } catch (error) {
            console.error('Error loading product:', error);
            setServerError('Failed to load product. Please try again later.');
        }
    }, [id, token]);

    useEffect(() => {
        if (mode === 'edit') {
            loadProduct();
        }
    }, [mode, loadProduct]);

    const validateForm = () => {
        const newErrors = {};
        
        // Barcode validation
        if (!formData.barcode.trim()) {
            newErrors.barcode = 'Barcode is required';
        } else if (!/^[A-Za-z0-9-]+$/.test(formData.barcode)) {
            newErrors.barcode = 'Barcode can only contain letters, numbers, and hyphens';
        }

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters long';
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        // Price validation
        const price = parseFloat(formData.price);
        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(price) || price <= 0) {
            newErrors.price = 'Price must be a positive number';
        }

        // Quantity validation
        const quantity = parseInt(formData.quantity);
        if (!formData.quantity) {
            newErrors.quantity = 'Quantity is required';
        } else if (isNaN(quantity) || quantity < 0) {
            newErrors.quantity = 'Quantity must be a non-negative number';
        }

        // Category validation
        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
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
        setServerError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const url = mode === 'create' 
                ? 'http://localhost:8000/api/products'
                : `http://localhost:8000/api/products/${id}`;
            
            const method = mode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    quantity: parseInt(formData.quantity)
                })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/admin/products', { 
                    state: { 
                        message: `Product ${mode === 'create' ? 'created' : 'updated'} successfully` 
                    }
                });
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setServerError(data.message || `Failed to ${mode} product`);
                }
            }
        } catch (err) {
            console.error('Error:', err);
            setServerError(`Failed to ${mode} product. Please try again later.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={8} className="mx-auto">
                    <h2>{mode === 'create' ? 'Add New Product' : 'Edit Product'}</h2>
                    {serverError && <Alert variant="danger">{serverError}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Barcode</Form.Label>
                            <Form.Control
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                isInvalid={!!errors.barcode}
                                disabled={mode === 'edit'}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.barcode}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.name}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                isInvalid={!!errors.description}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.description}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price (₱)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        isInvalid={!!errors.price}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.price}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        isInvalid={!!errors.quantity}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.quantity}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                isInvalid={!!errors.category}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.category}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/admin/products')}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                variant="primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                                    </>
                                ) : (
                                    mode === 'create' ? 'Add Product' : 'Update Product'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductForm;