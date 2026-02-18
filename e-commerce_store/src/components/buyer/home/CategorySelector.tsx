"use client";

import { featuredProduct, Product, subCategory } from "@/src/types";
import { FeaturedProductCard } from "../product/FeaturedProductCard";
import { useEffect, useState } from "react";
import { ProductService } from "@/src/services/product.service";

export function CategorySelector() {
  const [subCategories, setSubCategories] = useState<subCategory[]>([]);
  const fetchSubcategories = async () => {
    await ProductService.getSubCategories()
      .then((response) => {
        if (response.success && response.data) {
          setSubCategories(response.data);
        } else {
          console.error("Failed to fetch subcategories:", response.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching subcategories:", error);
      });
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  return (
    <div className="flex justify-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar py-2">
      {subCategories.map((subcategory) => (
        <div
          key={subcategory.id}
          className="min-w-[140px] sm:min-w-[160px] bg-gray-100 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition flex-shrink-0 cursor-pointer"
          onClick={() => {
            window.location.href = `/products?subcategory=${subcategory.id}`;
          }}
        >
          {subcategory.image ? (
            <img
              src={subcategory.image}
              alt={subcategory.name}
              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg mx-auto mb-3 sm:mb-4"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-lg mx-auto mb-3 sm:mb-4"></div>
          )}

          <h3 className="font-semibold text-sm sm:text-base">
            {subcategory.name}
          </h3>
        </div>
      ))}
    </div>
  );
}
