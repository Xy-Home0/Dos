import React from 'react';
import { Container, Card, Button, ListGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, orderDetails } = location.state || {};

    if (!orderId) {
        navigate('/');
        return null;
    }

    const formatPrice = (price) => {
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <Container className="py-5">
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="text-center mb-4">
                        <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                        <Card.Title className="display-6 mt-3">Order Placed Successfully!</Card.Title>
                        <Card.Text className="text-muted">
                            Thank you for your order. Your order number is: <strong>#{orderId}</strong>
                        </Card.Text>
                    </div>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Order Details</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <strong>Shipping Address:</strong><br />
                                {orderDetails.shipping_address}
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <strong>Payment Method:</strong><br />
                                {orderDetails.payment_method === 'cash on delivery' ? 'Cash on Delivery' : 'Online Payment'}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Order Items</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {orderDetails.order_items?.map((item) => (
                                <ListGroup.Item key={item.id}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0">{item.product.name}</h6>
                                            <small className="text-muted">
                                                Quantity: {item.quantity} × ₱{formatPrice(item.price)}
                                            </small>
                                        </div>
                                        <div>
                                            <strong>₱{formatPrice(item.quantity * item.price)}</strong>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card>

                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <span>Subtotal</span>
                                    <span>₱{formatPrice(orderDetails.subtotal)}</span>
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <span>Shipping Fee</span>
                                    <span>₱{formatPrice(orderDetails.shipping_fee)}</span>
                                </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-flex justify-content-between">
                                    <h5 className="mb-0">Total</h5>
                                    <h5 className="mb-0">₱{formatPrice(orderDetails.total)}</h5>
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                    <div className="text-center mt-4">
                        <Button 
                            variant="primary" 
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default OrderConfirmation;
