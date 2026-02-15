"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { X, FolderPen } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

import { useAuth } from "@/src/hooks/useAuth";
import { ProductService } from "@/src/services/product.service";

registerPlugin(FilePondPluginImagePreview);

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  originalPrice: string | number;
  brand: string;
  sku: string;
  images: string;
  tags: string;
  isActive: boolean;
  weight: string;
  warranty: string;
  isFeatured: boolean;
}

interface EditProductModalProps {
  product: Product;
  open?: boolean;
  onClose?: (value: boolean) => void;
  showTrigger?: boolean;
  triggerLabel?: string;
}

function EditProduct({
  product,
  open,
  onClose,
  showTrigger = true,
  triggerLabel = "Edit Product",
}: EditProductModalProps) {
  const { token, user, isAuthenticated } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = typeof open === "boolean" ? open : internalOpen;
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    brand: product.brand || "",
    sku: product.sku || "",
    weight: product.weight || "",
    warranty: product.warranty || "",
    tags: product.tags || "",
    isActive: product.isActive ?? true,
    isFeatured: product.isFeatured ?? false,
  });
  useEffect(() => {
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      brand: product.brand || "",
      sku: product.sku || "",
      weight: product.weight || "",
      warranty: product.warranty || "",
      tags: product.tags || "",
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
    });
  }, [product]);
  const handleClose = (value: boolean) => {
    if (onClose) {
      onClose(value);
    }
    if (typeof open !== "boolean") {
      setInternalOpen(value);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token || user?.role !== "seller") {
      toast.error("You must be logged in as a seller to update product");
      return;
    }
    try {
      const hasNewImages = imageFiles.length > 0;
      const result = hasNewImages
        ? await ProductService.updateProductMultipartWithAuth({
            isAuthenticated,
            token,
            productId: String(product.id),
            formData: (() => {
              const payload = new FormData();
              payload.append("name", String(formData.name));
              payload.append("description", String(formData.description));
              payload.append("price", String(formData.price));
              payload.append("originalPrice", String(formData.originalPrice));
              payload.append("brand", String(formData.brand));
              payload.append("sku", String(formData.sku));
              payload.append("weight", String(formData.weight));
              payload.append("warranty", String(formData.warranty));
              payload.append("tags", String(formData.tags));
              payload.append("isActive", String(formData.isActive));
              payload.append("isFeatured", String(formData.isFeatured));
              payload.append("replaceImages", String(replaceImages));
              imageFiles.forEach((item) => {
                if (item?.file) {
                  payload.append("images", item.file);
                }
              });
              return payload;
            })(),
          })
        : await ProductService.updateProductWithAuth({
            isAuthenticated,
            token,
            productId: String(product.id),
            productData: {
              name: formData.name,
              description: formData.description,
              price: formData.price,
              originalPrice: formData.originalPrice,
              brand: formData.brand,
              sku: formData.sku,
              weight: formData.weight,
              warranty: formData.warranty,
              tags: formData.tags,
              isActive: formData.isActive,
              isFeatured: formData.isFeatured,
            },
          });

      if (!result.success) {
        throw new Error(result.message || "Failed to update product");
      }
      else {
        window.location.reload();
        }
      toast.success("Product updated successfully");
      handleClose(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update product");
    }
  };

  

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          onClick={() => handleClose(true)}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition"
        >
          {triggerLabel}
        </button>
      )}
      <Dialog open={isOpen} onClose={handleClose} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/60" />
        <div className="fixed inset-0 z-20 w-screen overflow-y-auto left-2">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-900 shadow-xl transition-all">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <span className="flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/10 p-2">
                <FolderPen className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </span>
              <DialogTitle
                as="h3"
                className="text-lg font-bold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {product.name}
              </DialogTitle>
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Edit Product
              </h4>
              <form className="space-y-5" onSubmit={handleUpdate}>
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Price
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
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
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Weight
                    </label>
                    <input
                      type="text"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty: e.target.value })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                      className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    Featured
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={replaceImages}
                      onChange={(e) => setReplaceImages(e.target.checked)}
                      className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    Replace existing images
                  </label>
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
          </DialogPanel>
          </div>
        </div>
        <ToastContainer />
      </Dialog>
    </>
  );
}

export default EditProduct;
