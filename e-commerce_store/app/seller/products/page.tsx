import { Metadata } from "next";
import SidebarFilters from "@/src/components/buyer/product/SidebarFilters";
import ProductsGrid from "@/src/components/seller/product/SellerProductGrid";
import SortDropdown from "@/src/components/buyer/product/SortDropdown";
import axios from "axios";
import ChatButton from "@/src/components/buyer/chat/ChatButton";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import Link from "next/link";


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
  }>;
}) {
  const params = await searchParams;
  // navigation


  const products = await fetchProducts({
    category: params.category,
    subcategory: params.subcategory,
    sort: params.sort || "featured",
    page: parseInt(params.page || "1"),
  });

  function redirectToNewProduct() {
    window.location.href = "/seller/products/new";
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SellerNavbar />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold mb-4">
            {params.category
              ? "Category Products"
              : params.subcategory
                ? "Subcategory Products"
                : "All Products"}
          </h1>
          <Link href="/seller/products/new">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-bold"
              // onClick={() => {
              //   window.location.href = "/seller/products/new";
              // }}
            >
              + New Product
            </button>
          </Link>
        </div>
        <p className="text-gray-600">
          Discover amazing products at great prices
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {products.from || 1}-{products.to || 0} of{" "}
              {products.total || 0} products
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

    console.log("Fetching products with params:", searchParams.toString());

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
    console.error("Error fetching products:", error);
    return {
      data: { products: [] },
      total: 0,
      totalPages: 1,
      from: 0,
      to: 0,
    };
  }
}
