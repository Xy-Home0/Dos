import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        // Initialize cart from localStorage if available
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // If item exists, update quantity if it doesn't exceed stock
                const newQuantity = existingItem.quantity + product.quantity;
                if (newQuantity <= product.max_quantity) {
                    return prevCart.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                }
                return prevCart; // Return unchanged if would exceed stock
            }
            
            // If item doesn't exist, add it with specified quantity and max_quantity
            return [...prevCart, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                max_quantity: product.quantity // Store original product quantity as max
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCart(prevCart => {
            const item = prevCart.find(item => item.id === productId);
            if (!item) return prevCart;

            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }

            if (quantity > item.max_quantity) {
                return prevCart;
            }

            return prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            );
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
