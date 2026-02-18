import axios from "axios";
import { apiClient } from "../lib/api-client";
import {
  Product,
  ProductFilters,
  SortOptions,
  PaginatedResponse,
  ApiResponse,
  NewProduct,
  NewProductVariety,
  featuredProduct,
  subCategory,
} from "../types";

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
    limit: number = 12,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters &&
        Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined),
        )),
      ...(sort && { sortBy: sort.sortBy, sortOrder: sort.sortOrder }),
    });

    return apiClient.get<PaginatedResponse<Product>>(`/products?${params}`);
  }

  //get featured products for homepage
  static async getFeaturedProducts(): Promise<ApiResponse<featuredProduct[]>> {
    return apiClient.get<ApiResponse<featuredProduct[]>>(`/products/top-featured`);
  }

    //get subCategories for homepage
  static async getSubCategories(): Promise<ApiResponse<subCategory[]>> {
    return apiClient.get<ApiResponse<subCategory[]>>(`/subcategories`);
  }

  // Get single product by ID
  static async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  // Search products by query
  static async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiClient.get<PaginatedResponse<Product>>(
      `/products/search?${params}`,
    );
  }

  // Get products by category
  static async getProductsByCategory(
    categorySlug: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiClient.get<PaginatedResponse<Product>>(
      `/products/category/${categorySlug}?${params}`,
    );
  }

  // SELLER METHODS

  // Create new product (seller only)
  static async createProduct(productData: Partial<Product>): Promise<Product> {
    return apiClient.post<Product>("/products", productData);
  }

  // Update product (seller only)
  static async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    return apiClient.put<Product>(`/products/${id}`, productData);
  }

  static async updateProductWithAuth({
    isAuthenticated,
    token,
    productId,
    productData,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    productId: string;
    productData: Partial<Product>;
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login again",
      };
    }

    try {
      const response = await axios.put(
        `/api/products/${productId}`,
        productData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status >= 200 && response.status < 300) {
        return { success: true as const, data: response.data };
      }
      return { success: false as const, message: "Update failed" };
    } catch (error) {
      console.error("Update product error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Update failed",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  static async updateProductMultipartWithAuth({
    isAuthenticated,
    token,
    productId,
    formData,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    productId: string;
    formData: FormData;
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login again",
      };
    }

    try {
      const response = await axios.put(`/api/products/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return { success: true as const, data: response.data };
      }
      return { success: false as const, message: "Update failed" };
    } catch (error) {
      console.error("Update product error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Update failed",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  // Delete product (seller only)
  static async deleteProduct(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  }

  static async updateProductVariety({
    isAuthenticated,
    token,
    productId,
    varietyId,
    varietyData,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    productId: string;
    varietyId: string;
    varietyData: {
      name?: string;
      stock?: number;
      preorderLevel?: number;
      ignoreWarnings?: boolean;
    };
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login again",
      };
    }

    try {
      const response = await axios.patch(
        `/api/products/varieties/${varietyId}`,
        {
          productId,
          varietyId,
          varietyData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status >= 200 && response.status < 300) {
        return { success: true as const, data: response.data };
      } else {
        return { success: false as const, message: "Update failed" };
      }
    } catch (error) {
      console.error("Update variety error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Update failed",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  static async addNewProduct(productData: NewProduct, token: string) {
    // {
    // "name": "Appli Iphone 16",
    // "description": "Latest Apple flagship smartphone with advanced features and high-quality camera system. Perfect for professional photography and everyday use.",
    // "price": 999.99,
    // "originalPrice": 1199.99,
    // "subCategoryId": {{subCategoryId}},
    // "brand": "Apple",
    // "sku": "APL-S24-001",
    // "images": [files],
    // "tags": ["smartphone", "android", "5G", "camera"],
    // "weight": 168.5,
    // "warranty": "2 years manufacturer warranty",
    // "isFeatured": true,
    // "varieties": [
    //   {
    //     "name": "128GB - Black",
    //     "stock": 50,
    //     "preorderLevel": 10
    //   },
    //   {
    //     "name": "256GB - Silver",
    //     "stock": 30,
    //     "preorderLevel": 5
    //   }
    try {
      const response = await axios.post(`/api/products`, productData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return { success: true as const, data: response.data };
      } else {
        return { success: false as const, message: "Product creation failed" };
      }
    } catch (error) {
      console.error("Add new product error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Product creation failed",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  static async addNewProductMultipart({
    isAuthenticated,
    token,
    formData,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    formData: FormData;
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login again",
      };
    }

    try {
      const response = await axios.post(`/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return { success: true as const, data: response.data };
      }
      return { success: false as const, message: "Product creation failed" };
    } catch (error) {
      console.error("Add new product (multipart) error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Product creation failed",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  // get all category info
  static async getCategories() {
    const res = await axios.get(`/api/categories`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.status >= 200 && res.status < 300) {
      return { success: true as const, data: res.data };
    } else if (res.status >= 400 && res.status < 500) {
      return {
        success: false as const,
        message: res.data.message || "Failed to fetch categories",
      };
    } else {
      return { success: false as const, message: "Failed to fetch categories" };
    }
  }

  // get low stock products for seller dashboard
  static async getLowStockProducts(token: string) {
    const res = await axios.get(`/api/products/seller/lowStock`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.status >= 200 && res.status < 300) {
      return { success: true as const, data: res.data };
    } else if (res.status >= 400 && res.status < 500) {
      return {
        success: false as const,
        message: res.data.message || "Failed to fetch low stock products",
      };
    } else {
      return {
        success: false as const,
        message: "Failed to fetch low stock products",
      };
    }
  }

}

export const updateVariety = ProductService.updateProductVariety;
