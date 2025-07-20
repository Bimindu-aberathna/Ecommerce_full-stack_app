import { apiClient } from '../lib/api-client';
import { 
  Product, 
  ProductFilters, 
  SortOptions, 
  PaginatedResponse, 
  ApiResponse 
} from '../types';

/**
 * Product Service - Handles all product-related API calls
 * Used by both buyer and seller components
 */
export class ProductService {
  
  // Get all products with filtering and pagination
  static async getProducts(
    filters?: ProductFilters,
    sort?: SortOptions,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters && Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )),
      ...(sort && { sortBy: sort.field, sortOrder: sort.order })
    });

    return apiClient.get<PaginatedResponse<Product>>(`/products?${params}`);
  }

  // Get single product by ID
  static async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  // Search products by query
  static async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    });

    return apiClient.get<PaginatedResponse<Product>>(`/products/search?${params}`);
  }

  // Get products by category
  static async getProductsByCategory(
    categorySlug: string,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return apiClient.get<PaginatedResponse<Product>>(`/products/category/${categorySlug}?${params}`);
  }

  // SELLER METHODS
  
  // Create new product (seller only)
  static async createProduct(productData: Partial<Product>): Promise<Product> {
    return apiClient.post<Product>('/products', productData);
  }

  // Update product (seller only)
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, productData);
  }

  // Delete product (seller only)
  static async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  }

  // Get seller's products
  static async getSellerProducts(
    sellerId: string,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    return apiClient.get<PaginatedResponse<Product>>(`/products/seller/${sellerId}?${params}`);
  }
}
