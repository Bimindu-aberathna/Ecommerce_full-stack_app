"use client";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { Product } from "@/src/types";
import Link from "next/link";

interface ProductsGridProps {
  initialProducts: Product[];
  totalPages: number;
  currentPage: number;
}

export default function ProductsGrid({
  initialProducts,
  totalPages,
  currentPage,
}: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const safePage = Math.max(1, Math.min(totalPages || 1, page));
    const params = new URLSearchParams(searchParams);
    params.set("page", safePage.toString());
    router.push(`?${params.toString()}`);
  };

  const safeCurrentPage = Math.max(1, Math.min(totalPages || 1, currentPage));
  const maxButtons = 5;
  const startPage = Math.max(
    1,
    Math.min(
      safeCurrentPage - 2,
      Math.max(1, (totalPages || 1) - maxButtons + 1),
    ),
  );
  const endPage = Math.min(totalPages || 1, startPage + maxButtons - 1);
  const pages =
    endPage >= startPage
      ? Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
      : [1];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialProducts.length > 0 ? (
          initialProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <ProductCard key={product.id} product={product} />
            </Link>
          ))
        ) : (
          <p className="col-span-full py-12 text-center text-gray-500">
            No products found.
          </p>
        )}
      </div>

      <div className="flex justify-center mt-8 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-0">
          <button
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="pagination-btn text-xs sm:text-sm"
          >
            Previous
          </button>

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-btn text-xs sm:text-sm ${
                safeCurrentPage === page ? "active" : ""
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === (totalPages || 1)}
            className="pagination-btn text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
