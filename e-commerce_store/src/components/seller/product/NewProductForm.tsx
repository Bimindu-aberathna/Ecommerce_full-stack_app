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
      <div className="">
        <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-4">
          <div className="text-lg font-bold">Add New Product</div>
        </div>
        <div className="px-6 py-5">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                 Category
                </label>
                {/* //category select dropdown */}
                <select
                  disabled = {categories.length === 0}
                  value={selectedCategory || ""}
                  onChange={(e) =>
                    setSelectedCategory(Number(e.target.value) || null)
                  }
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories && categories.map((category) => (
                    <option key={category.id} value={category.id} className="text-gray-900 mb-1">
                      {category.name}
                    </option>
                  ))}
                </select>
                
              </div>
              <div>
                <label
                  htmlFor="originalPrice"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Sub-Category
                </label>
                <select
                  disabled = {categories.length === 0}
                  value={selectedSubCategory || ""}
                  onChange={(e) =>
                    setSelectedSubCategory(Number(e.target.value) || null)
                  }
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {selectedCategory && 
                    categories.find(c => c.id === selectedCategory)?.subCategories.map(sub => (
                      <option key={sub.id} value={sub.id} className="text-gray-900 mb-1">
                        {sub.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm dark:text-gray-400 mb-1.5"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProduct.name}
                onChange={handleFieldChange}
                className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm dark:text-gray-400 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={newProduct.description}
                onChange={handleFieldChange}
                className="block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="originalPrice"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Original Price
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={newProduct.originalPrice}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={newProduct.brand}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  SKU
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={newProduct.sku}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Weight
                </label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={newProduct.weight}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="warranty"
                  className="block text-sm dark:text-gray-400 mb-1.5"
                >
                  Warranty
                </label>
                <input
                  type="text"
                  id="warranty"
                  name="warranty"
                  value={newProduct.warranty}
                  onChange={handleFieldChange}
                  className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="tags"
                className="block text-sm dark:text-gray-400 mb-1.5"
              >
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={newProduct.tags.join(", ")}
                onChange={handleTagsChange}
                className="block w-full h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <NewVarietiesEditor
              varieties={newProduct.varieties}
              onChange={(varieties) =>
                setNewProduct((prev) => ({ ...prev, varieties }))
              }
            />
            <div className="space-y-2">
              <label className="block text-sm dark:text-gray-400 mb-1.5">
                New Images
              </label>
              <FilePond
                files={imageFiles}
                onupdatefiles={setImageFiles}
                allowMultiple={true}
                maxFiles={10}
                acceptedFileTypes={["image/*"]}
                labelIdle='Drag & Drop images or <span class="filepond--label-action">Browse</span>'
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
              >
                Save Changes
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
