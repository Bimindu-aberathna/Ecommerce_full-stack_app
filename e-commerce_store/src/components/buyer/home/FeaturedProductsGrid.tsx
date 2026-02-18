"use client";

import { featuredProduct, Product } from "@/src/types";
import { FeaturedProductCard } from "../product/FeaturedProductCard";
import { useEffect, useState } from "react";
import { ProductService } from "@/src/services/product.service";

const FEATURED_PRODUCTS = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    description: "Premium quality wireless headphones with noise cancellation",
    price: 79.99,
    originalPrice: 99.99,
    images: [
      "https://firebasestorage.googleapis.com/v0/b/travel-app-29b3c.appspot.com/o/images%2F71Hx8b6HGbL._AC_SL1500_.jpg?alt=media&token=7ed50279-1983-432a-aafb-b9660b9282be",
    ],
    categoryId: "electronics",
    category: {
      id: "electronics",
      name: "Electronics",
      slug: "electronics",
      isActive: true,
    },
    brand: "AudioTech",
    sku: "AT-WH-001",
    stock: 25,
    tags: ["wireless", "bluetooth", "headphones"],
    features: ["Noise Cancellation", "30h Battery", "Quick Charge"],
    isActive: true,
    sellerId: "seller1",
    seller: {
      id: "seller1",
      email: "seller@example.com",
      firstName: "John",
      lastName: "Seller",
      role: "seller" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    description: "Track your fitness goals with this advanced smartwatch",
    price: 149.99,
    originalPrice: 199.99,
    images: [
      "https://firebasestorage.googleapis.com/v0/b/travel-app-29b3c.appspot.com/o/images%2F71Hx8b6HGbL._AC_SL1500_.jpg?alt=media&token=7ed50279-1983-432a-aafb-b9660b9282be",
    ],
    categoryId: "electronics",
    category: {
      id: "electronics",
      name: "Electronics",
      slug: "electronics",
      isActive: true,
    },
    brand: "FitTech",
    sku: "FT-SW-002",
    stock: 15,
    tags: ["smartwatch", "fitness", "health"],
    features: ["Heart Rate Monitor", "GPS", "Water Resistant"],
    isActive: true,
    sellerId: "seller1",
    seller: {
      id: "seller1",
      email: "seller@example.com",
      firstName: "John",
      lastName: "Seller",
      role: "seller" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt",
    price: 24.99,
    images: [
      "https://firebasestorage.googleapis.com/v0/b/travel-app-29b3c.appspot.com/o/images%2F71Hx8b6HGbL._AC_SL1500_.jpg?alt=media&token=7ed50279-1983-432a-aafb-b9660b9282be",
    ],
    categoryId: "fashion",
    category: {
      id: "fashion",
      name: "Fashion",
      slug: "fashion",
      isActive: true,
    },
    brand: "EcoWear",
    sku: "EW-TS-003",
    stock: 50,
    tags: ["organic", "cotton", "sustainable"],
    features: ["100% Organic Cotton", "Machine Washable", "Breathable"],
    isActive: true,
    sellerId: "seller2",
    seller: {
      id: "seller2",
      email: "seller2@example.com",
      firstName: "Jane",
      lastName: "Seller",
      role: "seller" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Ceramic Plant Pot Set",
    description: "Beautiful handcrafted ceramic pots for your plants",
    price: 34.99,
    originalPrice: 44.99,
    images: [
      "https://firebasestorage.googleapis.com/v0/b/travel-app-29b3c.appspot.com/o/images%2F71Hx8b6HGbL._AC_SL1500_.jpg?alt=media&token=7ed50279-1983-432a-aafb-b9660b9282be",
    ],
    categoryId: "home",
    category: {
      id: "home",
      name: "Home & Garden",
      slug: "home-garden",
      isActive: true,
    },
    brand: "GreenThumb",
    sku: "GT-PP-004",
    stock: 8,
    tags: ["ceramic", "plants", "home decor"],
    features: ["Drainage Holes", "Saucer Included", "Handcrafted"],
    isActive: true,
    sellerId: "seller3",
    seller: {
      id: "seller3",
      email: "seller3@example.com",
      firstName: "Mike",
      lastName: "Seller",
      role: "seller" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function FeaturedProductsGrid() {
  const [featuredProducts, setFeaturedProducts] = useState<featuredProduct[]>(
    [],
  );
  const fetchFeaturedProducts = async () => {
    await ProductService.getFeaturedProducts()
      .then((response) => {
        if (response.success && response.data) {
          setFeaturedProducts(response.data);
        } else {
          console.error("Failed to fetch featured products:", response.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching featured products:", error);
      });
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts && featuredProducts.map((product) => (
            <FeaturedProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => {
                console.log("Add to cart:", productId);
              }}
              onAddToWishlist={(productId) => {
                console.log("Add to wishlist:", productId);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
