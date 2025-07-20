import { apiClient } from '../lib/api-client';
import { User, LoginFormData, RegisterFormData, ApiResponse } from '../types';

/**
 * Authentication Service - Handles user login, registration, and auth state
 * Used for both buyer and seller authentication
 */
export class AuthService {
  
  // User login
  static async login(credentials: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login', 
      credentials
    );
    
    // Store token in localStorage if login successful
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // User registration
  static async register(userData: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register', 
      userData
    );
    
    // Store token in localStorage if registration successful
    if (response.success && response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }

  // User logout
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Get current user from localStorage
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  // Refresh user profile
  static async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/profile');
  }

  // Update user profile
  static async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', userData);
    
    // Update localStorage with new user data
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email });
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiClient.post<ApiResponse<null>>('/auth/reset-password', { 
      token, 
      password: newPassword 
    });
  }
}
