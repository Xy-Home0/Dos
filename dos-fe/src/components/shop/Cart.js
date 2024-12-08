import React from 'react';
import { Container, Table, Button, InputGroup } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const formatPrice = (price) => {
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleQuantityChange = (item, change) => {
        const newQuantity = item.quantity + change;
        if (newQuantity >= 1 && newQuantity <= item.max_quantity) {
            updateQuantity(item.id, newQuantity);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Shopping Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>₱{formatPrice(item.price)}</td>
                                    <td>
                                        <InputGroup style={{ width: '150px' }}>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => handleQuantityChange(item, -1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <InputGroup.Text className="bg-white" style={{ width: '50px', justifyContent: 'center' }}>
                                                {item.quantity}
                                            </InputGroup.Text>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => handleQuantityChange(item, 1)}
                                                disabled={item.quantity >= item.max_quantity}
                                            >
                                                +
                                            </Button>
                                        </InputGroup>
                                    </td>
                                    <td>₱{formatPrice(item.price * item.quantity)}</td>
                                    <td>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                <td>₱{formatPrice(getCartTotal())}</td>
                                <td>
                                    <Button 
                                        variant="primary"
                                        onClick={handleCheckout}
                                    >
                                        Checkout
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </>
            )}
        </Container>
    );
};

export default Cart;