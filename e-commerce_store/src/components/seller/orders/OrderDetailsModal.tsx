"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ArchiveBoxIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Orders } from "../../../types";
import { formatPrice } from "@/src/services/validation/formattinf.servis";
import ShippingCode from "./ShippingCode";
import Seller_ChatModal from "../Chats/seller_chat_modal";
import { useAuth } from "@/src/hooks/useAuth";
import { viewOrder, acceptOrder as acceptOrderService } from "@/src/services/orders.services";
import { toast, ToastContainer } from "react-toastify";

interface OrderDetailsModalProps {
  onOpenChange: (open: boolean) => void;
  Order: Orders;
}

export default function OrderDetailsModal({
  onOpenChange,
  Order,
}: OrderDetailsModalProps) {
  const [open, setOpen] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const { token } = useAuth();

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) {
      onOpenChange(false);
    }
  };

  const openChatModal = () => {
    setOpenChat(true);
  };

  const handleAcceptOrder = () => {
    if (token && Order?.orderId) {
      acceptOrderService(Order.orderId, token)
        .then(() => {
          toast.success("Order accepted successfully");
        })
        .catch((error:any) => {
          console.error("Accept order error:", error);
          const errorMessage =
            error.response?.data?.message || "Failed to accept order";
          toast.error(errorMessage);
        });
    }
  };

  useEffect(() => {
    if(token && Order?.orderId) {
      viewOrder(Order.orderId, token)
    }
  }, [token, Order?.orderId]);

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-900 shadow-xl transition-all">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <span className="flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/10 p-2">
                <ArchiveBoxIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </span>
              <DialogTitle
                as="h3"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Order #{Order.orderNumber}
              </DialogTitle>
              {/* close Button top right */}
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Customer Info
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {Order.customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {Order.status}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> Rs.{" "}
                    {Order.totalAmount}
                  </div>
                </div>
              </div>
              {/* Delivery Info */}
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Delivery Info
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Recipient:</span>{" "}
                    {Order.customer.name}
                  </div>
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {Order.shippingAddress}
                  </div>
                  <div>
                    <span className="font-medium">Postal Code:</span>{" "}
                    {Order.postalCode}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {Order.telephone}
                  </div>
                </div>
              </div>
              {/* Order Items */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Order Items
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Product
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Price (Rs.)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Order.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {item.product.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">
                              {item.product.brand}
                            </span>{" "}
                            {item.product.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">
                            {formatPrice(item.price.toString())}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 px-6 py-4 w-full">
              <div>
                {" "}
                {Order.trackingNumber ? (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Tracking Code:</span>{" "}
                    {Order.trackingNumber}
                  </div>
                ) : (
                  <ShippingCode OrderId={Order.orderId} />
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAcceptOrder}
                  className="inline-flex justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  onClick={openChatModal}
                >
                  Message
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
      {
        openChat && (
          <Seller_ChatModal
            open={openChat}
            onOpenChange={setOpenChat}
            customerId={Order.customer.id}
          />
        ) 
      }
      <ToastContainer />
    </Dialog>
  );
}
