const API_URL = 'http://localhost:8000/api';

const defaultHeaders = {
    'Content-Type': 'application/json'
};

// Authentication API calls
export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response.json();
};

// Product API calls
export const getProducts = async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/products?${queryString}`);
    return response.json();
};

export const getProduct = async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
};

// Cart API calls
export const getCart = async (token) => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.json();
};

export const addToCart = async (productId, quantity, token) => {
    const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
    });
    return response.json();
};

// Order API calls
export const checkout = async (orderData, token) => {
    const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });
    return response.json();
};