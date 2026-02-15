"use client";
import React, { useEffect, useState } from "react";
import {
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ArchiveBoxIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";

import { useAuth } from "@/src/hooks/useAuth";
import { ProductService, updateVariety } from "@/src/services/product.service";

interface PrimaryData {
  productId: number;
  productName: string;
  varietyId: number;
  name: string;
  stock: number;
  preorderlevel: number;
  ignoreWarnings: boolean;
}

interface EditVarietyModalProps {
  primaryData: PrimaryData;
  open: boolean;
  onClose: (value: boolean) => void;
}

function EditVarietyModal({
  primaryData,
  open,
  onClose,
}: EditVarietyModalProps) {
  const { token, user, isAuthenticated } = useAuth();
  const [verietyData, setVerietyData] = useState({
    name: primaryData.name,
    stock: primaryData.stock || 0,
    preorderLevel: primaryData.preorderlevel || 0,
    ignoreWarnings: primaryData.ignoreWarnings,
  });
  useEffect(() => {
    setVerietyData({
      name: primaryData.name,
      stock: primaryData.stock,
      preorderLevel: primaryData.preorderlevel,
      ignoreWarnings: primaryData.ignoreWarnings,
    });
  }, [primaryData]);
  const handleClose = (value: boolean) => {
    onClose(value);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token || user?.role !== "seller") {
      toast.error("You must be logged in as a seller to update variety");
      return;
    }
    try {
  const res = await ProductService.updateProductVariety({
    isAuthenticated,
    token,
    productId: String(primaryData.productId),
    varietyId: String(primaryData.varietyId),
    varietyData: {
      name: verietyData.name,
      stock: verietyData.stock,
      preorderLevel: verietyData.preorderLevel,
      ignoreWarnings: verietyData.ignoreWarnings,
    },
  });

  if (!res.success) {
    throw new Error(res.message || "Failed to update variety");
  }else {
    window.location.reload();
  }

  toast.success("Variety updated successfully");
  onClose(false);

} catch (error: any) {
  toast.error(error?.message || "Failed to update variety");
}

  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto left-2">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-900 shadow-xl transition-all">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <span className="flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/10 p-2">
                <ArchiveBoxIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </span>
              <DialogTitle
                as="h3"
                className="text-lg font-bold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {primaryData.productName}
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
                Edit Variety
              </h4>
              <form className="space-y-5" onSubmit={handleUpdate}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Variety Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={verietyData.name}
                    onChange={(e) =>
                      setVerietyData({ ...verietyData, name: e.target.value })
                    }
                    className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="stock"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={verietyData.stock}
                      onChange={(e) =>
                        setVerietyData({
                          ...verietyData,
                          stock: Number(e.target.value),
                        })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="preorderLevel"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Pre-Order Level
                    </label>
                    <input
                      type="number"
                      id="preorderLevel"
                      name="preorderLevel"
                      value={verietyData.preorderLevel}
                      onChange={(e) =>
                        setVerietyData({
                          ...verietyData,
                          preorderLevel: Number(e.target.value),
                        })
                      }
                      className="block w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ignoreWarnings"
                    name="ignoreWarnings"
                    defaultChecked={primaryData.ignoreWarnings}
                    className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="ignoreWarnings"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Ignore Stock Warnings
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
  );
}

export default EditVarietyModal;
