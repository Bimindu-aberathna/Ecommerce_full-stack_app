import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/buyer/product/ProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
import axios from "axios";
import ChatButton from "@/src/components/buyer/chat/ChatButton";

export const metadata: Metadata = {
  title: "Products - E-Store",
  description: "Browse our wide selection of products",
};


export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    subCategory?: string;
    sort?: string;
    page?: string;
    tags?: string;
      minPrice?: number;
      maxPrice?: number;
      brands?: string[];
      rating?: number;
      inStock?: boolean;

  }>;
}) {
  
  const params = await searchParams;

  const products = await fetchProducts({
    category: params.category,
    subCategory: params.subCategory,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    brands: params.brands,
    rating: params.rating,
    inStock: params.inStock,
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
          {params.category
            ? "Category Products"
            : params.subCategory
            ? "Subcategory Products"
            : "All Products"}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--secondary)' }}>
          Discover amazing products at great prices
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="w-full lg:w-1/4">
          <SidebarFilters />
        </div>

        <main className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-xs sm:text-sm" style={{ color: 'var(--secondary)' }}>
              Showing {products.from || 1}-{products.to || 0} of {products.total || 0} products
              {params.category && ` in category ${params.category}`}
              {params.subCategory && ` in subcategory ${params.subCategory}`}
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
      
      <ChatButton />
    </div>
  );
}


async function fetchProducts(params: {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  rating?: number;
  inStock?: boolean;
  tags?: string[];
}) {
  try {
    const searchParams = new URLSearchParams();

    if (params.category) searchParams.set("category", params.category);
    if (params.subCategory) searchParams.set("subcategory", params.subCategory);
    if (params.minPrice) searchParams.set("minPrice", params.minPrice.toString());
    if (params.maxPrice) searchParams.set("maxPrice", params.maxPrice.toString());
    if (params.brands) {
      params.brands.forEach((brand) => searchParams.append("brands", brand));
    }
    if (params.rating) searchParams.set("rating", params.rating.toString());
    if (params.inStock !== undefined) searchParams.set("inStock", params.inStock.toString());
    if (params.tags) {
      params.tags.forEach((tag) => searchParams.append("tags", tag));
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?${searchParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      },
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    if (data?.data?.products) {
      const pagination = data.data.pagination || {};
      return {
        data: { products: data.data.products || [] },
        total: pagination.totalItems || 0,
        totalPages: pagination.totalPages || 1,
        from:
          pagination.totalItems && pagination.itemsPerPage
            ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1
            : 0,
        to:
          pagination.totalItems && pagination.itemsPerPage
            ? Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems,
              )
            : 0,
      };
    }
    return {
      data: { products: [] },
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    };
  } catch (error) {
    return {
      data: { products: [] },
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    };
  }
}