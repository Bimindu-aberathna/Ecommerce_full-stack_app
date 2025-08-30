"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { Product } from '@/src/types';
import Link from 'next/link';

interface ProductsGridProps {
  initialProducts: Product[];
  totalPages: number;
  currentPage: number;
}

export default function ProductsGrid({ 
  initialProducts, 
  totalPages, 
  currentPage 
}: ProductsGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
    // console.log("initialProducts", initialProducts);
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialProducts?.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-btn ${
                currentPage === page ? 'active' : ''
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
