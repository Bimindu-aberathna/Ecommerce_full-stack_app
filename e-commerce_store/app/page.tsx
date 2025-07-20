import { Metadata } from 'next';
import 'react-toastify/dist/ReactToastify.css';
/**
 * Home Page - Main landing page for buyers
 * Features: Hero section, featured products, categories, deals
 * This is the default route (/) for the e-commerce store
 */

export const metadata: Metadata = {
  title: 'E-Store - Your One-Stop Shopping Destination',
  description: 'Discover amazing products at great prices. Shop electronics, fashion, home goods and more.',
};

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Category cards will be populated from API */}
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
            {/* Product cards will be populated from API */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Product Name {i}</h3>
                  <p className="text-gray-600 text-sm mb-2">Brand Name</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">$99.99</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
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