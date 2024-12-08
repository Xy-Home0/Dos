import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Form, Button, Container, Alert, Row, Col, Card, ListGroup, Spinner } from 'react-bootstrap';

const Checkout = () => {
    const navigate = useNavigate();
    const cartContext = useCart();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Debug logging
    useEffect(() => {
        console.log('Cart context:', cartContext);
        console.log('Cart items:', cartContext.cart);
    }, [cartContext]);

    const [shippingDetails, setShippingDetails] = useState({
        shipping_address: '',
        payment_method: 'cash on delivery'
    });

    const handleChange = (e) => {
        setShippingDetails(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!cartContext.cart || cartContext.cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                shipping_address: shippingDetails.shipping_address,
                payment_method: shippingDetails.payment_method,
                shipping_fee: 100, // Fixed shipping fee
                cart_items: cartContext.cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            console.log('Submitting order with data:', orderData);

            const response = await fetch('http://localhost:8000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                if (response.status === 422) {
                    // Validation errors
                    if (data.errors) {
                        const errorMessages = Object.values(data.errors).flat().join(', ');
                        throw new Error(`Validation failed: ${errorMessages}`);
                    }
                }
                throw new Error(data.message || data.error || 'Failed to place order');
            }
            
            cartContext.clearCart(); // Clear the cart after successful order
            navigate('/order-confirmation', { 
                state: { 
                    orderId: data.order.id,
                    orderDetails: data.order
                }
            });
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cartContext.getCartTotal();
    const shippingFee = 100; // Fixed shipping fee
    const total = subtotal + shippingFee;

    // Don't render the form if cart is empty
    if (!cartContext.cart || cartContext.cart.length === 0) {
        return (
            <Container className="py-4">
                <Alert variant="warning">
                    Your cart is empty. Please add some items before checking out.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Checkout</h2>
            
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Row>
                <Col md={7}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h4>Shipping Details</h4>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Shipping Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="shipping_address"
                                        value={shippingDetails.shipping_address}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        name="payment_method"
                                        value={shippingDetails.payment_method}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="cash on delivery">Cash on Delivery</option>
                                        <option value="online payment">Online Payment</option>
                                    </Form.Select>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={5}>
                    <Card>
                        <Card.Header>
                            <h4>Order Summary</h4>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {cartContext.cart.map((item) => (
                                <ListGroup.Item key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0">{item.name}</h6>
                                            <small className="text-muted">
                                                Quantity: {item.quantity}
                                            </small>
                                        </div>
                                        <div>
                                            ₱{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <span>Subtotal</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <span>Shipping Fee</span>
                                    <span>₱{shippingFee.toFixed(2)}</span>
                                </div>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <h5 className="mb-0">Total</h5>
                                    <h5 className="mb-0">₱{total.toFixed(2)}</h5>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Checkout;