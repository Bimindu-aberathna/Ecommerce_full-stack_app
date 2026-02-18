import React from "react";
import { featuredProduct, Product } from "../../../types";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { formatCurrency } from "../../../lib/utils";
import Image from "next/image";
import { json } from "stream/consumers";


interface ProductCardProps {
  product: featuredProduct;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export const FeaturedProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  className,
}) => {
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100,
      )
    : 0;

  const getImageUrl = (imagesString?: string): string => {
  if (!imagesString) return "/images/products/default-product.jpg";

  try {
    const parsed = JSON.parse(imagesString);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return "/images/products/default-product.jpg";
    }

    // Case 1: Array of strings
    if (typeof parsed[0] === "string") {
      return parsed[0];
    }

    // Case 2: Array of objects with url
    if (typeof parsed[0] === "object" && parsed[0].url) {
      // Prefer primary image
      const primary = parsed.find((img: any) => img.isPrimary);
      return primary?.url || parsed[0].url;
    }

    return "/images/products/default-product.jpg";
  } catch (error) {
    console.error("Invalid image JSON:", error);
    return "/images/products/default-product.jpg";
  }
};


  return (
    <Card className={className} href={`/products/${product.id}`}>
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={getImageUrl(product?.images || undefined)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            width={300}
            height={300}
          />
        </div>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToWishlist?.(product.id);
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          aria-label="Add to wishlist"
        >
          ❤️
        </button>

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3rem]" style={{ color: 'var(--text)' }}>
          {product.name}
        </h3>

        {/* Brand */}
        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">⭐⭐⭐⭐⭐</div>
          <span className="text-sm text-gray-500 ml-1">(4.5)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => {
              onAddToCart?.(product.id);
            }}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "More Details"}
          </Button>
        </div>

        {/* Stock Status */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
