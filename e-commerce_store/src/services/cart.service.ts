import axios from 'axios';
import { fetchCartObj, addToCartObj, updateCartObj, removeCartItemObj } from '../types';

export class CartService {
  // Fetch cart
  static async fetchCart({
    isAuthenticated,
    token
  }: fetchCartObj) {
    if(!isAuthenticated) {
      return null;
    }
    if(!token) {
      return null;
    }
    const cart = await axios.get(
      `/api/cart`,
      {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return cart.data;
  }

  //Add to cart
  static async addToCart({
    isAuthenticated,
    token,
    varietyId,
    quantity
  }: addToCartObj) {
    if(!isAuthenticated) {
      return { success: false, message: 'User not authenticated' };
    }
    if(!token) {
      return { success: false, message: 'No token provided' };
    }
    try {
      const response = await axios.post(
        `/api/cart/add`,
        {
          productVarietyId: varietyId,
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          message: error.response.data.message || 'Add to cart failed' 
        };
      }
      return { success: false, message: 'Network error' };
    }
  }

  //update cart
  static async updateCart({
    isAuthenticated,
    token,
    itemId,
    quantity
  }: updateCartObj) {
    if(!isAuthenticated) {
      return { success: false, message: 'User not authenticated' };
    }
    if(!token) {
      return { success: false, message: 'No token provided' };
    }
    try {
      const response = await axios.put(
        `/api/cart/update/${itemId}`,
        {
          quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Update cart error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { 
          success: false, 
          message: error.response.data.message || 'Update cart failed' 
        };
      }
      return { success: false, message: 'Network error' };
    }
  }

  static async removeItem({
    isAuthenticated,
    token,
    itemId
  }: removeCartItemObj) {
    if (!isAuthenticated) {
      return { success: false, message: 'User not authenticated' };
    }
    if (!token) {
      return { success: false, message: 'No token provided' };
    }
    try {
      const response = await axios.delete(
        `/api/cart/delete/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Remove item error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Remove item failed'
        };
      }
      return { success: false, message: 'Network error' };
    }
  }

  static async deleteCart({
    isAuthenticated,
    token,
    cartId
  }: {
    isAuthenticated: boolean;
    token: string;
    cartId: string;
  }) {
    if (!isAuthenticated) {
      return { success: false, message: 'User not authenticated' };
    }
    if (!token) {
      return { success: false, message: 'No token provided' };
    }
    try {
      const response = await axios.delete(
        `/api/cart/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Remove item failed'
        };
      }
      return { success: false, message: 'Network error' };
    }
  }

  static async checkAvailability({
    isAuthenticated,
    token,
    cartId
  }: {
    isAuthenticated: boolean;
    token: string;
    cartId: string;
  }) {
    if (!isAuthenticated) {
      return { success: false, message: 'User not authenticated' };
    }
    if (!token) {
      return { success: false, message: 'No token provided' };
    }
    try {
      const response = await axios.get(
        `/api/cart/availability/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Check availability failed',
          lowStockItems: error.response.data.lowStockItems || []
        };
      }
      return { success: false, message: 'Network error' };
    }
  }

}

export const addToCart = CartService.addToCart;
export const fetchCart = CartService.fetchCart;
export const updateCart = CartService.updateCart;
export const removeCartItem = CartService.removeItem;
export const deleteCart = CartService.deleteCart;
export const checkCartAvailability = CartService.checkAvailability;
