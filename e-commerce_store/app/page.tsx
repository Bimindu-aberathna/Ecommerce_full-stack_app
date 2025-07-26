'use client';

import { FeaturedProductCard } from '@/src/components/buyer/product/FeaturedProductCard';
import 'react-toastify/dist/ReactToastify.css';
/**
 * Home Page - Main landing page for buyers
 * Features: Hero section, featured products, categories, deals
 * This is the default route (/) for the e-commerce store
 */

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to E-Store
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, free shipping.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Shop Now
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="overflow-x-auto gap-6 flex flex-center">
            <div className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold">Electronics</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold">Fashion</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold">Home & Garden</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-600 rounded-lg mx-auto mb-4"></div>
              <h3 className="font-semibold">Sports</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Featured product cards */}
            {[
              {
                id: '1',
                name: 'Wireless Bluetooth Headphones',
                description: 'Premium quality wireless headphones with noise cancellation',
                price: 79.99,
                originalPrice: 99.99,
                images: ['/images/products/demo_product.jpg'],
                categoryId: 'electronics',
                category: { id: 'electronics', name: 'Electronics', slug: 'electronics', isActive: true },
                brand: 'AudioTech',
                sku: 'AT-WH-001',
                stock: 25,
                tags: ['wireless', 'bluetooth', 'headphones'],
                features: ['Noise Cancellation', '30h Battery', 'Quick Charge'],
                isActive: true,
                sellerId: 'seller1',
                seller: { id: 'seller1', email: 'seller@example.com', firstName: 'John', lastName: 'Seller', role: 'seller' as const, createdAt: new Date(), updatedAt: new Date() },
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: '2',
                name: 'Smart Fitness Watch',
                description: 'Track your fitness goals with this advanced smartwatch',
                price: 149.99,
                originalPrice: 199.99,
                images: ['/images/products/demo_product.jpg'],
                categoryId: 'electronics',
                category: { id: 'electronics', name: 'Electronics', slug: 'electronics', isActive: true },
                brand: 'FitTech',
                sku: 'FT-SW-002',
                stock: 15,
                tags: ['smartwatch', 'fitness', 'health'],
                features: ['Heart Rate Monitor', 'GPS', 'Water Resistant'],
                isActive: true,
                sellerId: 'seller1',
                seller: { id: 'seller1', email: 'seller@example.com', firstName: 'John', lastName: 'Seller', role: 'seller' as const, createdAt: new Date(), updatedAt: new Date() },
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: '3',
                name: 'Organic Cotton T-Shirt',
                description: 'Comfortable and sustainable organic cotton t-shirt',
                price: 24.99,
                images: ['/images/products/demo_product.jpg'],
                categoryId: 'fashion',
                category: { id: 'fashion', name: 'Fashion', slug: 'fashion', isActive: true },
                brand: 'EcoWear',
                sku: 'EW-TS-003',
                stock: 50,
                tags: ['organic', 'cotton', 'sustainable'],
                features: ['100% Organic Cotton', 'Machine Washable', 'Breathable'],
                isActive: true,
                sellerId: 'seller2',
                seller: { id: 'seller2', email: 'seller2@example.com', firstName: 'Jane', lastName: 'Seller', role: 'seller' as const, createdAt: new Date(), updatedAt: new Date() },
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: '4',
                name: 'Ceramic Plant Pot Set',
                description: 'Beautiful handcrafted ceramic pots for your plants',
                price: 34.99,
                originalPrice: 44.99,
                images: ['/images/products/demo_product.jpg'],
                categoryId: 'home',
                category: { id: 'home', name: 'Home & Garden', slug: 'home-garden', isActive: true },
                brand: 'GreenThumb',
                sku: 'GT-PP-004',
                stock: 8,
                tags: ['ceramic', 'plants', 'home decor'],
                features: ['Drainage Holes', 'Saucer Included', 'Handcrafted'],
                isActive: true,
                sellerId: 'seller3',
                seller: { id: 'seller3', email: 'seller3@example.com', firstName: 'Mike', lastName: 'Seller', role: 'seller' as const, createdAt: new Date(), updatedAt: new Date() },
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ].map((product) => (
              <FeaturedProductCard
                key={product.id} 
                product={product}
                onAddToCart={(productId) => {
                  console.log('Add to cart:', productId);
                  // TODO: Implement cart functionality
                }}
                onAddToWishlist={(productId) => {
                  console.log('Add to wishlist:', productId);
                  // TODO: Implement wishlist functionality
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special offers.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}