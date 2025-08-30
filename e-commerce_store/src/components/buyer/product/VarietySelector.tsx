"use client";
import React, { useState } from "react";
import AddToCartButton from "./AddToCartButton";

interface ProductVariety {
  id: number;
  productId: number;
  name: string;
  stock: number;
  ignoreWarnings: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  subCategoryId: number;
  brand: string;
  sku: string;
  images: string;
  tags: string;
  ratingAverage: string;
  ratingCount: number;
  isActive: boolean;
  weight: string;
  warranty: string;
  isFeatured: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  varieties: ProductVariety[];
  discountPercentage: number;
  isAvailable: boolean;
  totalStock: number;
}

function VarietySelector({ product }: { product: Product }) {
  const [selectedVarietyId, setSelectedVarietyId] = useState<number | null>(
    null
  );
  return (
    <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {product.varieties.map((variant) => (
        <label
          key={variant.id}
        className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
          variant.stock > 0
            ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
        } ${
          variant.stock > 0 && selectedVarietyId === variant.id
            ? "border-blue-500 bg-blue-50"
            : ""
        }`}
        >
          <input
            type="radio"
            name="variant"
            value={variant.id}
            className="sr-only"
            disabled={variant.stock === 0}
            checked={variant.stock > 0 && selectedVarietyId === variant.id}
            onChange={() => setSelectedVarietyId(variant.id)}
          />
          <div
            className={`w-4 h-4 rounded-full border-2 mr-3 ${
              variant.stock > 0 ? "border-blue-500" : "border-gray-300"
            }`}
          >
            {/* Add checked state styling here if needed */}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">
              {variant.name}
            </span>
            <div className="text-xs text-gray-500 mt-1">
              {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"}
            </div>
          </div>
        </label>
      ))}
    </div>

    <div className="mt-4">
      <AddToCartButton product={product} selectedVarietyId={selectedVarietyId} />
    </div>
  </div>
  );
}

export default VarietySelector;
