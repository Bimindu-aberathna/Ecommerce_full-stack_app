"use client";
import { ChevronRight, Package, Calendar, DollarSign } from "lucide-react";

import { useState } from "react";

interface ListItemProps {
    customerName: string;
    orderNumber?: string | null;
    createdAt: string;
    viewed: boolean;
    trackingNumber?: string;
}


export default function ListItem( {customerName, orderNumber, createdAt, viewed, trackingNumber}: ListItemProps) {



  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group mouse-hover:shadow-xl transform hover:scale-[1.01]"
    >
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Order Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 min-w-0">
              {/* Order Number */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-gray-800 truncate">
                  {orderNumber? orderNumber : customerName}
                </h3>
                {!viewed && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    New
                  </span>
                )}
              </div>

              {/* Customer Name */}
              <p className="text-sm text-gray-600 mb-1">
                {customerName}
              </p>

              {/* Order Date & Item Count */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Optional: Tracking Number (if exists) */}
          {trackingNumber && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Tracking: {" "}
                <span className="font-mono font-medium text-gray-700">
                  {trackingNumber}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
