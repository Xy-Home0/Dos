import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderDropdownItems = () => {
        // Ensure we're checking both user existence and admin status
        if (!user) return null;
        
        // For admin users, only show logout
        if (user.role === 'admin') {
            return <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>;
        }
        
        // For regular users, show both options
        return (
            <>
                <NavDropdown.Item as={Link} to="/orders">My Orders</NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </>
        );
    };

    return (
        <BootstrapNavbar bg="light" expand="lg">
            <Container>
                <BootstrapNavbar.Brand as={Link} to={user?.role === 'admin' ? "/admin/products" : "/"}>
                    E-Commerce Store
                </BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {(user?.role !== 'admin' && !isAdminRoute) && (
                            <>
                                <Nav.Link as={Link} to="/">Products</Nav.Link>
                                {user && (
                                    <Nav.Link as={Link} to="/cart">
                                        Cart {getCartCount() > 0 && (
                                            <Badge bg="primary" pill>{getCartCount()}</Badge>
                                        )}
                                    </Nav.Link>
                                )}
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {user ? (
                            <NavDropdown title={user.name} id="basic-nav-dropdown">
                                {renderDropdownItems()}
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;