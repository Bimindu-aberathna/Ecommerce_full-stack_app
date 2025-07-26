import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductCard from "@/src/components/buyer/product/ProductCard";

export const metadata: Metadata = {
  title: "Products - E-Store",
  description: "Browse our wide selection of products",
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-gray-600">
            Discover amazing products at great prices
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <SidebarFilters />

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
                <ProductCard
                  key={i}
                  product={{
                    name: `Product ${i + 1}`,
                    brand: `Brand ${i + 1}`,
                    image: `/images/products/default-product.jpg`,
                    price: (i + 1) * 10,
                    rating: 4.5,
                    inStock: i % 2 === 0 ? true : false, // Simulating stock availability
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  3
                </button>
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
