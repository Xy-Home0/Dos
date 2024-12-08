import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Container, Form, Row, Col, InputGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filters, setFilters] = useState({
        category: '',
        maxPrice: '',
        inStock: false
    });
    const { token } = useAuth();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`http://localhost:8000/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    fetchProducts();
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const formatPrice = (price) => {
        return Number(price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = 
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.category.toLowerCase().includes(search.toLowerCase()) ||
                product.barcode.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = !filters.category || product.category === filters.category;
            const matchesPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
            const matchesStock = !filters.inStock || product.quantity > 0;

            return matchesSearch && matchesCategory && matchesPrice && matchesStock;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'price':
                    comparison = a.price - b.price;
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                default:
                    comparison = a[sortField].localeCompare(b[sortField]);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const categories = [...new Set(products.map(p => p.category))];

    return (
        <Container className="mt-5">
            <Row className="mb-3">
                <Col>
                    <h2>Product Management</h2>
                </Col>
                <Col className="text-end">
                    <Link to="/admin/products/create">
                        <Button variant="primary">Add New Product</Button>
                    </Link>
                </Col>
            </Row>

            {/* Search and Filters */}
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Control
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <InputGroup>
                        <InputGroup.Text>₱</InputGroup.Text>
                        <Form.Control
                            type="number"
                            placeholder="Price"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={2}>
                    <Form.Check
                        type="checkbox"
                        label="In Stock Only"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    />
                </Col>
            </Row>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('barcode')} style={{ cursor: 'pointer' }}>
                                Barcode {getSortIcon('barcode')}
                            </th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                                Category {getSortIcon('category')}
                            </th>
                            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                                Price {getSortIcon('price')}
                            </th>
                            <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>
                                Quantity {getSortIcon('quantity')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedProducts.map(product => (
                            <tr key={product.id}>
                                <td>{product.barcode}</td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>₱{formatPrice(product.price)}</td>
                                <td>
                                    <span className={product.quantity === 0 ? 'text-danger' : ''}>
                                        {product.quantity}
                                    </span>
                                </td>
                                <td>
                                    <Link to={`/admin/products/edit/${product.id}`}>
                                        <Button variant="info" size="sm" className="me-2">Edit</Button>
                                    </Link>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default ProductList;