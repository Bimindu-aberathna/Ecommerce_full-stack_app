import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/buyer/product/ProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
import axios from "axios";

export const metadata: Metadata = {
  title: "Products - E-Store",
  description: "Browse our wide selection of products",
};

// Server Component - Runs on server, great for SEO
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; page?: string };
}) {
  
  const products = await fetchProducts({
    category: searchParams.category,
    sort: searchParams.sort || "featured",
    page: parseInt(searchParams.page || "1"),
  });

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
        {/* Server Component - Static filters */}
        <SidebarFilters />

        {/* Main Content */}
        <main className="lg:w-3/4">
          {/* Server Component - Shows current results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {products.from}-{products.to} of {products.total} products
            </p>

            {/* Client Component for interactive sorting */}
            <SortDropdown currentSort={searchParams.sort || "featured"} />
          </div>

          {/* Client Component - Interactive product grid with state management */}
          <ProductsGrid
            initialProducts={products.data?.products || []}
            totalPages={products.totalPages}
            currentPage={parseInt(searchParams.page || "1")}
          />
        </main>
      </div>
    </div>
  );
}

// Server function - runs on server
async function fetchProducts(params: {
  category?: string;
  sort?: string;
  page: number | null;
}) {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page) searchParams.set("page", params.page.toString());
  searchParams.set("limit", "12");

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${searchParams}`
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error("Failed to fetch products");
  }
  // console.log(response.data);
  return response.data;
}
