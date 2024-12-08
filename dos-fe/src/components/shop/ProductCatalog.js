import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, InputGroup } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCatalog = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        maxPrice: '',
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quantities, setQuantities] = useState({});
    
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:8000/api/products?';
            const params = new URLSearchParams();
            
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.maxPrice) params.append('max_price', filters.maxPrice);
            
            const response = await fetch(url + params.toString(), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            const data = await response.json();
            const products = data.products || [];
            
            const uniqueCategories = [...new Set(products.map(product => product.category))].sort();
            setCategories(uniqueCategories);
            
            let filteredProducts = products;
            if (filters.category) {
                filteredProducts = filteredProducts.filter(product => 
                    product.category.toLowerCase() === filters.category.toLowerCase()
                );
            }
            
            // Initialize quantities state for all products
            const initialQuantities = {};
            filteredProducts.forEach(product => {
                initialQuantities[product.id] = 1;
            });
            setQuantities(initialQuantities);
            
            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error loading products:', error);
            setProducts([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    const getStockStatus = (quantity) => {
        if (quantity <= 0) return <Badge bg="danger">Out of Stock</Badge>;
        return <Badge bg="success">Available</Badge>;
    };

    const handleQuantityChange = (productId, change) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1;
            const product = products.find(p => p.id === productId);
            const newQty = currentQty + change;
            
            if (newQty >= 1 && newQty <= product.quantity) {
                return { ...prev, [productId]: newQty };
            }
            return prev;
        });
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation(); // Prevent card click
        if (!user) {
            navigate('/login');
            return;
        }
        const quantity = quantities[product.id] || 1;
        const cartProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            max_quantity: product.quantity
        };
        addToCart(cartProduct);
        
        // Reset quantity after adding to cart
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    };

    return (
        <Container className="py-4">
            {/* Filters Section */}
            <Row className="mb-4">
                <Col>
                    <Form>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Search</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search products..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={filters.category}
                                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Price"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>

            {/* Products Grid */}
            <Row>
                {loading ? (
                    <Col className="text-center py-4">
                        <div>Loading products...</div>
                    </Col>
                ) : products.length === 0 ? (
                    <Col className="text-center py-4">
                        <div>No products found</div>
                    </Col>
                ) : (
                    products.map(product => (
                        <Col md={4} key={product.id} className="mb-4">
                            <Card 
                                className="h-100" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleViewDetails(product)}
                            >
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-start">
                                        <span>{product.name}</span>
                                        {getStockStatus(product.quantity)}
                                    </Card.Title>
                                    <Card.Text>
                                        <strong>₱{formatPrice(product.price)}</strong><br/>
                                        Category: {product.category}<br/>
                                        {product.description && (
                                            <span className="text-muted">{product.description.substring(0, 100)}...</span>
                                        )}
                                    </Card.Text>
                                    <div onClick={e => e.stopPropagation()}>
                                        <InputGroup className="mb-2" style={{ width: '150px' }}>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => handleQuantityChange(product.id, -1)}
                                                disabled={quantities[product.id] <= 1}
                                            >
                                                -
                                            </Button>
                                            <InputGroup.Text className="bg-white" style={{ width: '50px', justifyContent: 'center' }}>
                                                {quantities[product.id] || 1}
                                            </InputGroup.Text>
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={() => handleQuantityChange(product.id, 1)}
                                                disabled={quantities[product.id] >= product.quantity}
                                            >
                                                +
                                            </Button>
                                        </InputGroup>
                                        <div className="d-grid">
                                            <Button 
                                                variant="primary"
                                                disabled={product.quantity <= 0}
                                                onClick={(e) => handleAddToCart(product, e)}
                                            >
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Product Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                {selectedProduct && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedProduct.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={8}>
                                    <h5>Description</h5>
                                    <p>{selectedProduct.description}</p>
                                    <h5>Details</h5>
                                    <ul>
                                        <li><strong>Category:</strong> {selectedProduct.category}</li>
                                        <li><strong>Price:</strong> ₱{formatPrice(selectedProduct.price)}</li>
                                        <li><strong>Availability:</strong> {getStockStatus(selectedProduct.quantity)}</li>
                                        <li><strong>Available Stocks:</strong> {selectedProduct.quantity}</li>
                                    </ul>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <InputGroup className="mb-2" style={{ width: '150px' }}>
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => handleQuantityChange(selectedProduct.id, -1)}
                                            disabled={quantities[selectedProduct.id] <= 1}
                                        >
                                            -
                                        </Button>
                                        <InputGroup.Text className="bg-white" style={{ width: '50px', justifyContent: 'center' }}>
                                            {quantities[selectedProduct.id] || 1}
                                        </InputGroup.Text>
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => handleQuantityChange(selectedProduct.id, 1)}
                                            disabled={quantities[selectedProduct.id] >= selectedProduct.quantity}
                                        >
                                            +
                                        </Button>
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Close
                            </Button>
                            <Button 
                                variant="primary" 
                                disabled={selectedProduct.quantity <= 0}
                                onClick={(e) => handleAddToCart(selectedProduct, e)}
                            >
                                Add to Cart
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Container>
    );
};

export default ProductCatalog;
