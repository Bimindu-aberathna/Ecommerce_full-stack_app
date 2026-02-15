"use client";

import { useAuth } from "@/src/hooks/useAuth";
import { addTrackingCode } from "@/src/services/orders.services";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function ShippingCode({ OrderId }: { OrderId: string | number }) {
  const [shippingCode, setShippingCode] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { token } = useAuth();

  const showShippingCodeInput = () => {
    setShowInput(true);
  };

  const cancelShippingCodeInput = () => {
    setShippingCode("");
    setShowInput(false);
  };

  const saveShippingCOde = () => {
    if (shippingCode.trim() === "") {
      toast.error("Shipping code cannot be empty");
      return;
    } else {
        addTrackingCode(OrderId, shippingCode, token!)
          .then(() => {
            toast.success("Shipping code added successfully");
            setShowInput(false);
          })
          .catch((error) => {
            console.error("Add tracking code error:", error);
            const errorMessage =
              error.response?.data?.message || "Failed to add shipping code";
            toast.error(errorMessage);
          });
      }
    };

  return (
    <div className="flex flex-col gap-3">
      {!showInput ? (
        <button
          type="button"
          onClick={showShippingCodeInput}
          className="inline-flex w-fit items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Delivery
        </button>
      ) : (
        <div className="flex flex-row gap-2">
          <input
            value={shippingCode}
            onChange={(e) => setShippingCode(e.target.value)}
            placeholder="Enter shipping code"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-500/30"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              onClick={saveShippingCOde}
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelShippingCodeInput}
              className="inline-flex items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
