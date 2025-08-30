// app/(buyer)/products/[id]/page.tsx
import ProductImages from "@/src/components/buyer/product/ProductImages";
import axios from "axios";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import VarietySelector from "@/src/components/buyer/product/VarietySelector";

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

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`
    );
    const product = response.data.data || response.data;

    return {
      title: `${product.name} - Buy Online | Your Store`,
      description: product.description,
    };
  } catch (error) {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  const productId = params.id;
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

  try {
    const productResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
    );
    const product: Product = productResponse.data.data || productResponse.data;
    const subCategory: ProductSubCategory = product.subCategory;
    const category: ProductCategory = subCategory.category;
    console.log("Product Response:", productResponse.data);

    // const product = [{\"url\":\"https://firebasestorage.googleapis.com/v0/b/champions-stores.appspot.com/o/images%2Fs25.png?alt=media&token=95edf1fc-abf9-4857-a3e6-59221be212d4\",\"type\":\"image\",\"isPrimary\":true},{\"url\":\"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk8ANoxHoOiwBF2wTK4ZTFgB3Ow20FGLlgWg&s\",\"type\":\"image\",\"isPrimary\":false}]",
    //     "tags": "[\"smartphone\",\"android\",\"5G\",\"camera\"];

    // Check if product exists
    if (!productResponse.data || !productResponse.data.data) {
      notFound();
    }

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

                {/* Price Section */}
                {product.discountPercentage > 0 ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl md:text-2xl font-bold text-green-600">
                        Rs. {parseFloat(product.price).toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        Rs. {parseFloat(product.originalPrice).toLocaleString()}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {product.discountPercentage}% OFF
                    </span>
                  </div>
                ) : (
                  <p className="text-xl md:text-2xl font-bold text-blue-600 mb-4">
                    Rs. {parseFloat(product.price).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  
                    {/* {product.varieties.map((variant) => (
                      <label
                        key={variant.id}
                        className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                          variant.stock > 0
                            ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                            : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          className="sr-only"
                          disabled={variant.stock === 0}
                          
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            variant.stock > 0 ? "border-blue-500" : "border-gray-300"
                          }`}
                        >
                          {/* Add checked state styling here if needed */}
                        {/* </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {variant.name}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {variant.stock > 0
                              ? `${variant.stock} in stock`
                              : "Out of stock"}
                          </div>
                        </div>
                      </label>
                    ))} */}
                    <VarietySelector product={product} />
                </div>
              )}

              {/* Features Section
              {product.features && product.features.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}

              {/* Action Buttons */}
              <div className="space-y-3">
                

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Wishlist</span>
                  </button>

                  <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>

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

        {/* Reviews Section */}
        {/* {product.reviews && product.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="font-semibold">{review.author}</span>
                    <div className="ml-2 flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.text}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch product data:", error);

    // Check if it's a 404 error
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }

    // For other errors, show error page
    throw new Error("Failed to load product");
  }
}
