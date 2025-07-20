import { apiClient } from '../lib/api-client';
import { Cart, CartItem, ApiResponse } from '../types';

/**
 * Cart Service - Handles shopping cart operations for buyers
 * Manages cart items, quantities, and cart state
 */
export class CartService {
  
  // Get current user's cart
  static async getCart(): Promise<Cart> {
    return apiClient.get<Cart>('/cart');
  }

  // Add item to cart
  static async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return apiClient.post<Cart>('/cart/items', { productId, quantity });
  }

  // Update cart item quantity
  static async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    return apiClient.put<Cart>(`/cart/items/${itemId}`, { quantity });
  }

  // Remove item from cart
  static async removeFromCart(itemId: string): Promise<Cart> {
    return apiClient.delete<Cart>(`/cart/items/${itemId}`);
  }

  // Clear entire cart
  static async clearCart(): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>('/cart');
  }

  // Get cart item count
  static async getCartItemCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/cart/count');
  }

  // Apply coupon code
  static async applyCoupon(couponCode: string): Promise<Cart> {
    return apiClient.post<Cart>('/cart/coupon', { code: couponCode });
  }

  // Remove coupon
  static async removeCoupon(): Promise<Cart> {
    return apiClient.delete<Cart>('/cart/coupon');
  }
}
