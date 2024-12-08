import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, user } = useAuth();

    useEffect(() => {
        if (!user?.is_admin) {
            fetchOrders();
        }
    }, [token, user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders);
        } catch (err) {
            setError('Failed to load orders. Please try again later.');
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    if (user?.is_admin) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>Admin Access</Card.Title>
                        <Card.Text>This page is only available to regular users.</Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body>
                        <Card.Text className="text-danger">{error}</Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (orders.length === 0) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>No Orders Yet</Card.Title>
                        <Card.Text>You haven't placed any orders yet.</Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4">My Orders</h2>
            {orders.map((order) => (
                <Card key={order.id} className="mb-4 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-0">Order #{order.id}</h5>
                            <small className="text-muted">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </small>
                        </div>
                        <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status.toUpperCase()}
                        </Badge>
                    </Card.Header>
                    <ListGroup variant="flush">
                        {order.order_items.map((item) => (
                            <ListGroup.Item key={item.id}>
                                <Row className="align-items-center">
                                    <Col>
                                        <h6 className="mb-0">{item.product.name}</h6>
                                        <small className="text-muted">
                                            Quantity: {item.quantity} × ₱{formatPrice(item.price)}
                                        </small>
                                    </Col>
                                    <Col xs="auto">
                                        <strong>₱{formatPrice(item.quantity * item.price)}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                        <ListGroup.Item>
                            <Row>
                                <Col>
                                    <strong>Shipping Address:</strong><br />
                                    {order.shipping_address}
                                </Col>
                                <Col xs={12} md={4}>
                                    <div className="text-md-end mt-3 mt-md-0">
                                        <div className="text-muted">Subtotal: ₱{formatPrice(order.subtotal)}</div>
                                        <div className="text-muted">Shipping Fee: ₱{formatPrice(order.shipping_fee)}</div>
                                        <div className="h5 mb-0">Total: ₱{formatPrice(order.total)}</div>
                                    </div>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            ))}
        </Container>
    );
};

export default Orders;
