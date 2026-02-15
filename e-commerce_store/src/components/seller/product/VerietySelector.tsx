"use client";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import EditVariety from "./EditVariety";

interface ProductVariety {
  id: number;
  productId: number;
  name: string;
  stock: number;
  preorderLevel: number;
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
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {product.varieties.map((variant) => (
          <label
            key={variant.id}
            className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            } ${selectedVarietyId === variant.id
                ? "border-blue-500 bg-blue-50"
                : ""
            }`}
          >
            <input
              type="radio"
              name="variant"
              value={variant.id}
              className="sr-only"
              checked={selectedVarietyId === variant.id}
              onChange={() => setSelectedVarietyId(variant.id)}
            />
            <div
              className={`w-4 h-4 rounded-full border-2 mr-3 border-blue-500`}
            >
              {/* Add checked state styling here if needed */}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                {variant.name}
              </span>
              <div className={`text-xs text-gray-500 mt-1
                ${variant.stock > 0 ? "text-green-600" : "text-red-600"}
              `}>
                {variant.stock > 0
                  ? `${variant.stock} in stock`
                  : "Out of stock"}
              </div>
            </div>
          </label>
        ))}
      </div>
      {selectedVarietyId && (
        <div className="flex justify-end">
          <button
            type="button"
            className=" m-2 inline-flex items-center p-2 rounded-md bg-blue-500 hover:bg-blue-300 text-white font-semibold transition"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Variety
          </button>
        </div>
      )}
      {selectedVarietyId && (
        <EditVariety
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          primaryData={{
            productId: product.id,
            productName: product.name,
            varietyId: selectedVarietyId,
            name:
              product.varieties.find((v) => v.id === selectedVarietyId)?.name ||
              "",
            stock:
              product.varieties.find((v) => v.id === selectedVarietyId)
                ?.stock || 0,
            preorderlevel:
              product.varieties.find((v) => v.id === selectedVarietyId)
                ?.preorderLevel || 0,
            ignoreWarnings:
              product.varieties.find((v) => v.id === selectedVarietyId)
                ?.ignoreWarnings || false,
          }}
        />
      )}
    </div>
  );
}

export default VarietySelector;
