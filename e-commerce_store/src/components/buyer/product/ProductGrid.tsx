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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {initialProducts?.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <ProductCard product={product} />
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-8 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-0">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn text-xs sm:text-sm"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const startPage = Math.max(1, currentPage - 2);
            return startPage + i;
          }).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`pagination-btn text-xs sm:text-sm ${
                currentPage === page ? 'active' : ''
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
