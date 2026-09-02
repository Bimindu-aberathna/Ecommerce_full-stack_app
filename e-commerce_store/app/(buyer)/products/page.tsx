import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/buyer/product/ProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
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
    subcategory?: string;
    sort?: string;
    page?: string;
    tags?: string;
    minPrice?: string;
    maxPrice?: string;
    brands?: string[] | string;
    rating?: string;
    inStock?: string;

  }>;
}) {
  
  const params = await searchParams;

  const products = await fetchProducts({
    category: params.category,
    subCategory: params.subcategory,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    brands: Array.isArray(params.brands)
      ? params.brands
      : params.brands
        ? [params.brands]
        : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    inStock:
      params.inStock !== undefined ? params.inStock === "true" : undefined,
    sort: params.sort,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
          {params.category
            ? "Category Products"
            : params.subcategory
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
  sort?: string;
  page?: number;
  limit?: number;
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

    const page = params.page && Number.isFinite(params.page) && params.page > 0 ? params.page : 1;
    const limit = params.limit && Number.isFinite(params.limit) && params.limit > 0 ? params.limit : 12;
    searchParams.set("page", page.toString());
    searchParams.set("limit", limit.toString());

    // Map UI sort values to backend sortBy/sortOrder
    const sortMap: Record<string, { sortBy?: string; sortOrder?: "ASC" | "DESC" }> = {
      featured: {},
      newest: { sortBy: "createdAt", sortOrder: "DESC" },
      "price-low": { sortBy: "price", sortOrder: "ASC" },
      "price-high": { sortBy: "price", sortOrder: "DESC" },
      rating: { sortBy: "ratingAverage", sortOrder: "DESC" },
      "name-asc": { sortBy: "name", sortOrder: "ASC" },
      "name-desc": { sortBy: "name", sortOrder: "DESC" },
    };

    if (params.sort && sortMap[params.sort]) {
      const mapped = sortMap[params.sort];
      if (mapped.sortBy) searchParams.set("sortBy", mapped.sortBy);
      if (mapped.sortOrder) searchParams.set("sortOrder", mapped.sortOrder);
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
  } catch (_error) {
    return {
      data: { products: [] },
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    };
  }
}
