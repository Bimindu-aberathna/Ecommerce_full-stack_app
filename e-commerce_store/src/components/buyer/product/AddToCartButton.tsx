"use client";
import { useAuth } from "@/src/hooks/useAuth";
import { ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { addToCart } from "@/src/services/cart.service";
import { addToCartObj } from "@/src/types";
import { useCart } from "@/src/hooks/useCart";

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

function AddToCartButton({
  product,
  selectedVarietyId,
}: {
  product: Product;
  selectedVarietyId: number | null;
}) {
  const [varietyAvailability, setVarietyAvailability] =
    useState<boolean>(false);

    const { incrementCartCount } = useCart();

  useEffect(() => {
    if (selectedVarietyId) {
      const selectedVariety = product.varieties.find(
        (variant) => variant.id === selectedVarietyId
      );
      setVarietyAvailability(
        selectedVariety ? selectedVariety.stock > 0 : false
      );
    }
  }, [selectedVarietyId, product.varieties]);
  const { isAuthenticated, token} = useAuth();

  const handleAddToCart = async() => {
    if (selectedVarietyId && varietyAvailability) {
      const addToCartData: addToCartObj = {
        isAuthenticated,
        token,
        varietyId: selectedVarietyId,
        quantity: 1
      };
      try{
        const res = await addToCart(addToCartData);
        if(res.success){
          toast.success("Added to cart successfully!");
          incrementCartCount();
        } else {
          toast.error(res.message || "Failed to add to cart");
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  return (
    <section>
      <button
        className="w-full !bg-green-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={
          selectedVarietyId === null ||
          !product.isAvailable ||
          product.totalStock === 0 ||
          (selectedVarietyId !== null && !varietyAvailability)
        }
        onClick={handleAddToCart}
      >
        <ShoppingBag className="w-5 h-5" />
        {/* <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M13 13v8a2 2 0 002 2h0a2 2 0 002-2v-8m-4 0V9a2 2 0 00-2-2h0a2 2 0 00-2 2v4.01"
        />
      </svg> */}
        {selectedVarietyId === null
          ? "Select a variant"
          : product.isAvailable && product.totalStock && varietyAvailability
          ? "Add to Cart"
          : "Out of Stock"}
      </button>
      <ToastContainer />
    </section>
  );
}

export default AddToCartButton;
