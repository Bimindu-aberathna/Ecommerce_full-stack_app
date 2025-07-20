/**
 * Products Page - Product listing page for buyers
 * Features: Product grid, filters, sorting, pagination
 * Route: /products
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - E-Store',
  description: 'Browse our wide selection of products',
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <p className="text-gray-600">Discover amazing products at great prices</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Electronics
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Fashion
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Home & Garden
                </label>
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-2">
                <input type="range" min="0" max="1000" className="w-full" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
            </div>

            {/* Brand */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Brand</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Apple
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Samsung
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Nike
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4">
          {/* Sort and View Options */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Showing 1-12 of 48 products</p>
            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded px-3 py-2">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Best Rating</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Products will be populated from API */}
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Product Name {i + 1}</h3>
                  <p className="text-gray-600 text-sm mb-2">Brand Name</p>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                    <span className="text-gray-500 text-sm ml-1">(4.5)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">$99.99</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
