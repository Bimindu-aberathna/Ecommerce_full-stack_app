'use client';

import React, { useEffect, useState, use } from "react";
import ProductImages from "@/src/components/buyer/product/ProductImages";
import VarietySelector from "@/src/components/seller/product/VerietySelector";
import ChatButton from "@/src/components/buyer/chat/ChatButton";
import EditProduct from "@/src/components/seller/product/EditProduct";
import axios from "axios";

interface Props {
  params: {
    id: string;
  };
}

interface ProductVariety {
  id: number;
  productId: number;
  name: string;
  stock: number;
  ignoreWarnings: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductCategory {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductSubCategory extends ProductCategory {
  categoryId: number;
  name: string;
  category: ProductCategory;
}

interface ProductCreatedBy {
  id: number;
  firstName: string;
  lastName: string;
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
  subCategory: ProductSubCategory;
  createdBy: ProductCreatedBy;
  discountPercentage: number;
  isAvailable: boolean;
  totalStock: number;
}


export default function ProductPage({ params }: Props) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
        );
        
        const data = response.data?.data || response.data;
        if (!data) {
          throw new Error("Product not found");
        }
        
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const stringToJson = (str: string) => {
    try {
      const json = JSON.parse(str);
      console.log("Parsed JSON:", json);
      return Array.isArray(json) ? json : [json];
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const subCategory: ProductSubCategory = product.subCategory;
  const category: ProductCategory = subCategory?.category;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center">
          <ProductImages images={stringToJson(product.images) || []} />
        </div>

        <div className="p-4">
          <div className="space-y-6">
            {/* Product Title */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div>
                <EditProduct product={product} />
              </div>
            </div>

            {/* Product Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Selling Price
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {product.price}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Original Price
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {product.originalPrice}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Brand
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {product.brand}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Warranty
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {product.warranty}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Category
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {category?.name || "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Subcategory
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {subCategory?.name || "N/A"}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border sm:col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  SKU
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">
                  {product.sku || "N/A"}
                </p>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.isAvailable && product.totalStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    In Stock ({product.totalStock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Variants Section */}
            {product.varieties && product.varieties.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Available Variants
                </h3>
                <VarietySelector product={product} />
              </div>
            )}

            {/* Product Description */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}