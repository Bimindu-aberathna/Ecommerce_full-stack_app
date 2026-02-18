// Core entity types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'seller';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  category: Category;
  brand: string;
  sku: string;
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  features: string[];
  isActive: boolean;
  sellerId: string;
  seller: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe';
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: User;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and search types
export interface ProductFilters {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
}

export type subCategory = {
  id: string;
  name: string;
  image: string;
  isActive: boolean;

};

export interface SortOptions {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'buyer' | 'seller';
}

export interface CheckoutFormData {
  shippingAddress: Omit<Address, 'id'>;
  billingAddress: Omit<Address, 'id'>;
  paymentMethod: Omit<PaymentMethod, 'id'>;
  notes?: string;
}

// Component prop types
export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export type fetchCartObj = {
  isAuthenticated: boolean;
  token: string;
}
export type fetchOrdersObj = {
  isAuthenticated: boolean;
  token: string;
  unprocessed?: boolean | true;
}

export type addToCartObj = {
  isAuthenticated: boolean;
  token: string | null;
  varietyId: string | number | null;
  quantity: number;
}

export type updateCartObj = {
  isAuthenticated: boolean;
  token: string | null;
  itemId: string | number | null;
  quantity: number;
}
export type removeCartItemObj = {
  isAuthenticated: boolean;
  token: string | null;
  itemId: string | number | null;
}

export type updateUserProfileObj = {
  firstName: string,
   lastName: string,
  email: string,
        phone: string | null,
        avatar: string | null,
        address: string | null,
        postalCode: string | null,
        file: File | null
}

export type KPICardType = {
  title: string;
  values: any; 
  type: string;
  icon: React.ReactNode;
  period: string;
}

export interface Orders {
  orderId: number;
  orderNumber: string;
  totalAmount: string;
  status: string;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  postalCode: string;
  telephone: string;
  trackingNumber?: string | null;
  itemCount: number;
  customer: {
    id: number;
    email: string;
    name: string;
  };
  items: OrderItem[];
}

export interface OrderItemResponse {
  orderItemId: number;
  quantity: number;
  price: string;
  totalPrice: string;
  product: {
    id: number;
    name: string;
    brand: string;
    images: string;
    weight: string;
    variety: string;
  };
}

export type NewProduct = {
  name: string;
  description: string;
  price: string | number;
  originalPrice: string | number;
  brand: string;
  sku: string;
  tags: string[];
  weight: number;
  warranty: string;
  isActive: boolean;
  isFeatured: boolean;
  varieties: NewProductVariety[];
}

export type NewProductVariety = {
  name: string;
  stock: number;
  preorderLevel: number;
};

export type featuredProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  category: Category;
  brand: string;
  sku: string;
  stock: number;
  isActive: boolean;
}

const emptyVariety = (): NewProductVariety => ({
  name: "",
  stock: 0,
  preorderLevel: 0,
});

export type fetchUserMessagesObj = {
  isAuthenticated: boolean;
  token: string | null;
  customerId?: string | number | null;
}