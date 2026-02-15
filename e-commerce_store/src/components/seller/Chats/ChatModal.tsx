"use client";

import { useState } from "react";
import {
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ArchiveBoxIcon, ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import { Orders } from "../../../types";

interface ChatDetailsModalProps {
  onOpenChange: (open: boolean) => void;
  Order: Orders;
}

export default function ChatModal({
  onOpenChange,
  Order,
}: ChatDetailsModalProps) {
  const [open, setOpen] = useState(true);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) {
      onOpenChange(false);
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
                  <ChatBubbleBottomCenterIcon className="h-5 w-5" />
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
              {/* <div>
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
              </div> */}
              {/* Order Items */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Order Items
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <h2>Massagess</h2>
                </div>
              </div>
            </div>
            
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
