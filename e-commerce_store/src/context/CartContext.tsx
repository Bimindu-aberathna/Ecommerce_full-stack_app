'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartService } from '../services/cart.service';
import { Cart, CartItem } from '../types';
import { useAuth } from './AuthContext';

/**
 * Cart Context - Manages shopping cart state globally
 * Handles cart items, quantities, and cart operations
 * Used throughout the buyer experience
 */
interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: { cart: Cart | null; isLoading: boolean }, action: CartAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false };
    case 'CLEAR_CART':
      return { ...state, cart: null, isLoading: false };
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: false,
  });

  // Load cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated, user]);

  const loadCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cart = await CartService.getCart();
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const updatedCart = await CartService.addToCart(productId, quantity);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await CartService.updateCartItem(itemId, quantity);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await CartService.removeFromCart(itemId);
      dispatch({ type: 'SET_CART', payload: updatedCart });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await CartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const getCartItemCount = (): number => {
    if (!state.cart) return 0;
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cart: state.cart,
    isLoading: state.isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
