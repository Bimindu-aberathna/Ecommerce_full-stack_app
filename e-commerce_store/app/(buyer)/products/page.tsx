import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/buyer/product/ProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
import axios from "axios";

export const metadata: Metadata = {
  title: "Products - E-Store",
  description: "Browse our wide selection of products",
};

// ✅ Fix: Await searchParams in Next.js 15+
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  // ✅ Await the searchParams Promise
  const params = await searchParams;

  const products = await fetchProducts({
    category: params.category,
    subcategory: params.subcategory,
    sort: params.sort || "featured",
    page: parseInt(params.page || "1"),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {params.category
            ? "Category Products"
            : params.subcategory
            ? "Subcategory Products"
            : "All Products"}
        </h1>
        <p className="text-gray-600">Discover amazing products at great prices</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <SidebarFilters />

        <main className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {products.from || 1}-{products.to || 0} of {products.total || 0} products
              {params.category && ` in category ${params.category}`}
              {params.subcategory && ` in subcategory ${params.subcategory}`}
            </p>

            <SortDropdown currentSort={params.sort || "featured"} />
          </div>

          <ProductsGrid
            initialProducts={products.data?.products || []}
            totalPages={products.totalPages || 1}
            currentPage={parseInt(params.page || "1")}
          />
        </main>
      </div>
    </div>
  );
}


async function fetchProducts(params: {
  category?: string;
  subcategory?: string;
  sort?: string;
  page: number;
}) {
  try {
    const searchParams = new URLSearchParams();

    if (params.category) searchParams.set("category", params.category);
    if (params.subcategory) searchParams.set("subcategory", params.subcategory);
    if (params.sort) searchParams.set("sort", params.sort);
    searchParams.set("page", params.page.toString());
    searchParams.set("limit", "12");

    console.log("Fetching products with params:", searchParams.toString()); // ✅ Debug log

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${searchParams}`
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to fetch products");
    }

    console.log("Products fetched successfully:", response.data); // ✅ Debug log
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    // ✅ Return empty data structure on error
    return {
      data: { products: [] },
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    };
  }
}
