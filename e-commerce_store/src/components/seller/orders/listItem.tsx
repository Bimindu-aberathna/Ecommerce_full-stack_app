"use client";
import { ChevronRight, Package, Calendar, DollarSign } from "lucide-react";

import { Orders, OrderItemResponse } from "../../../types";
import { useState } from "react";
import OrderDetailsModal from "./OrderDetailsModal";
import { formatPrice } from "@/src/services/validation/formattinf.servis";

interface ListItemProps {
  order: Orders;
}


export default function ListItem( {order}: ListItemProps) {
  const [selectedOrder, setSelectedOrder] = useState<Orders | null>(null);


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"; 
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group mouse-hover:shadow-xl transform hover:scale-[1.01]"
        onClick={() => setSelectedOrder(order)}
      >
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Order Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 min-w-0">
                {/* Order Number */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-800 truncate">
                    {order.orderNumber}
                  </h3>
                  {!order.viewed && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      New
                    </span>
                  )}
                </div>

                {/* Customer Name */}
                <p className="text-sm text-gray-600 mb-1">
                  {order.customer.name}
                </p>

                {/* Order Date & Item Count */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Status & Amount */}
            <div className="flex items-center gap-4">
              {/* Total Amount */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Total</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  Rs. {formatPrice(order.totalAmount)}
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`px-4 py-2 rounded-lg border font-medium text-sm capitalize min-w-[120px] text-center ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </div>

              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Optional: Tracking Number (if exists) */}
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Tracking:{" "}
                <span className="font-mono font-medium text-gray-700">
                  {order.trackingNumber}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Render the modal conditionally */}
      {selectedOrder && (
        <OrderDetailsModal 
          onOpenChange={(open) => !open && setSelectedOrder(null)} 
          Order={selectedOrder} 
        />
      )}
    </>
  );
}
