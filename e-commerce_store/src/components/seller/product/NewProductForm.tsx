"use client";
import React, { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { X, FolderPen } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import { useAuth } from "@/src/hooks/useAuth";
import { ProductService } from "@/src/services/product.service";
import NewVarietiesEditor, {
  NewProductVariety,
} from "@/src/components/seller/product/NewVarietiesEditor";

registerPlugin(FilePondPluginImagePreview);

interface NewProduct {
  name: string;
  description: string;
  price: string | number;
  originalPrice: string | number;
  brand: string;
  sku: string;
  tags: string[];
  weight: number;
  warranty: string;
  isActive: boolean;
  isFeatured: boolean;
  varieties: NewProductVariety[];
}

const emptyVariety = (): NewProductVariety => ({
  name: "",
  stock: 0,
  preorderLevel: 0,
});

interface categoryData {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
  subCategories: subCategories[];
}

interface subCategories {
  id: number;
  name: string;
  image: string;
  isActive: boolean;
}

function NewProduct() {
  const { token, user, isAuthenticated } = useAuth();
  // store new product data
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    brand: "",
    sku: "",
    tags: [],
    weight: 0,
    warranty: "",
    isActive: true,
    isFeatured: false,
    varieties: [emptyVariety()],
  });
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<categoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null,
  );

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericFields = new Set(["price", "originalPrice", "weight"]);
    setNewProduct((prev) => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value || 0) : value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setNewProduct((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const fetchCategoryData = async () => {
    try {
      const response = await ProductService.getCategories();
      if (response.success) {
        console.log("Fetched categories:", response.data.data);
        setCategories(response.data?.data);
        setSelectedCategory(response.data?.data?.[0]?.id || null);
      } else {
        toast.error(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("An error occurred while fetching categories");
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  // request format
  // {
    // "name": "Appli Iphone 16",
    // "description": "Latest Apple flagship smartphone with advanced features and high-quality camera system. Perfect for professional photography and everyday use.",
    // "price": 999.99,
    // "originalPrice": 1199.99,
    // "subCategoryId": {{subCategoryId}},
    // "brand": "Apple",
    // "sku": "APL-S24-001",
    // "images": [files],
    // "tags": ["smartphone", "android", "5G", "camera"],
    // "weight": 168.5,
    // "warranty": "2 years manufacturer warranty",
    // "isFeatured": true,
    // "varieties": [
    //   {
    //     "name": "128GB - Black",
    //     "stock": 50,
    //     "preorderLevel": 10
    //   },
    //   {
    //     "name": "256GB - Silver",
    //     "stock": 30,
    //     "preorderLevel": 5
    //   }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated || !token || user?.role !== "seller") {
        toast.error("You must be logged in as a seller to update product");
        return;
      }
      try {
        if (!selectedSubCategory) {
          toast.error("Please select a sub-category");
          return;
        }

        const hasImages = imageFiles.length > 0;
        if (!hasImages) {
          toast.error("New product must contain at least one image!");
          return;
        }

        const result = await ProductService.addNewProductMultipart({
          isAuthenticated,
          token,
          formData: (() => {
            const payload = new FormData();
            payload.append("name", newProduct.name);
            payload.append("description", String(newProduct.description));
            payload.append("price", String(newProduct.price));
            payload.append("originalPrice", String(newProduct.originalPrice));
            payload.append("subCategoryId", String(selectedSubCategory));
            payload.append("brand", String(newProduct.brand));
            payload.append("sku", String(newProduct.sku));
            payload.append("weight", String(newProduct.weight));
            payload.append("warranty", String(newProduct.warranty));
            payload.append("tags", JSON.stringify(newProduct.tags));
            payload.append("isActive", String(newProduct.isActive));
            payload.append("isFeatured", String(newProduct.isFeatured));
            payload.append("varieties", JSON.stringify(newProduct.varieties));
            imageFiles.forEach((item) => {
              if (item?.file) {
                payload.append("images", item.file);
              }
            });
            return payload;
          })(),
        });
        if (!result.success) {
          throw new Error(result.message || "Failed to update product");
        }
        else {
          }
        toast.success("Product created successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to update product");
      }
    };


  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FolderPen className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Information
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Category Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide text-gray-700 dark:text-gray-300">
                Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    disabled={categories.length === 0}
                    value={selectedCategory || ""}
                    onChange={(e) =>
                      setSelectedCategory(Number(e.target.value) || null)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-800 transition"
                  >
                    <option value="">Select a category</option>
                    {categories &&
                      categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="subCategory"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Sub-Category
                  </label>
                  <select
                    id="subCategory"
                    disabled={categories.length === 0}
                    value={selectedSubCategory || ""}
                    onChange={(e) =>
                      setSelectedSubCategory(Number(e.target.value) || null)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-800 transition"
                  >
                    <option value="">Select a sub-category</option>
                    {selectedCategory &&
                      categories
                        .find((c) => c.id === selectedCategory)
                        ?.subCategories.map((sub) => (
                          <option
                            key={sub.id}
                            value={sub.id}
                            className="text-gray-900 dark:text-gray-100"
                          >
                            {sub.name}
                          </option>
                        ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Product Info */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={newProduct.name}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={newProduct.description}
                  onChange={handleFieldChange}
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Sale Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="originalPrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Original Price
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    required
                    step="0.01"
                    value={newProduct.originalPrice}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Product Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    required
                    value={newProduct.brand}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    required
                    value={newProduct.sku}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    step="0.01"
                    value={newProduct.weight}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    htmlFor="warranty"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Warranty
                  </label>
                  <input
                    type="text"
                    id="warranty"
                    name="warranty"
                    value={newProduct.warranty}
                    onChange={handleFieldChange}
                    className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                    placeholder="e.g., 1 year manufacturer warranty"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={newProduct.tags.join(", ")}
                  onChange={handleTagsChange}
                  className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition"
                  placeholder="smartphone, 5G, camera, electronics"
                />
              </div>
            </div>

            {/* Varieties */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Varieties & Stock
              </h3>
              <NewVarietiesEditor
                varieties={newProduct.varieties}
                onChange={(varieties) =>
                  setNewProduct((prev) => ({ ...prev, varieties }))
                }
              />
            </div>

            {/* Images */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Product Images
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upload Images (max 10)
                </label>
                <div className="filepond-container">
                  <FilePond
                    files={imageFiles}
                    onupdatefiles={setImageFiles}
                    allowMultiple={true}
                    maxFiles={10}
                    acceptedFileTypes={["image/*"]}
                    labelIdle='Drag & Drop images or <span class="filepond--label-action">Browse</span>'
                  />
                </div>
              </div>
            </div>

            {/* Status Options */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={newProduct.isActive}
                    onChange={handleToggleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Active Product
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={newProduct.isFeatured}
                    onChange={handleToggleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition"
              >
                <FolderPen className="h-4 w-4" />
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default NewProduct;
