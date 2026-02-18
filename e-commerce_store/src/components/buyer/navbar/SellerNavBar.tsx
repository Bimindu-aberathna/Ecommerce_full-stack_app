"use client";
import React from "react";
import Image from "next/image";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBasket,
  MessageCircleMore
} from "lucide-react";
import { useSellerNavbar } from "@/src/hooks/sellerNavBar";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
//next navigation
import { useRouter } from "next/navigation";

interface CurrentTab {
  name?: string;
  expanded?: boolean;
}

export default function SellerNavbar({
  name = "dashboard",
  expanded = true,
}: CurrentTab) {
  const { isExpanded, toggleExpansion } = useSellerNavbar(expanded);
  const {logout} = useAuth(); 
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    router.push("/auth/login");
  };

  return (
    <nav
      className={`fixed left-0 top-0 h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
      aria-label="Sidebar"
    >
      {/* Header / Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700 transition-all duration-300">
        {!isExpanded ? (
          <Image
            alt="Clampion Stores"
            src="/images/logos/store-logo.png"
            width={50}
            height={50}
            className="rounded-full"
          />
        ) : (
          <Image
            alt="Clampion Stores"
            src="/images/logos/expanded-logo.png"
            width={170}
            height={50}
            className="rounded-full"
          />
        )}
      </div>

      <div className="flex items-center">
        <button
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={toggleExpansion}
          className="ml-auto rounded hover:!bg-gray-700 mr-1 w-12 h-12 justify-center flex items-center !p-0"
        >
          {!isExpanded ? (
            <ArrowRightFromLine className="w-5 h-5" />
          ) : (
            <ArrowLeftFromLine className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content (categories / navigation) */}
      <div className="flex-1 overflow-auto p-2 flex flex-col lg:justify-center">
        <ul className="space-y-2 mt-4">
          <Link href="/seller/dashboard">
            <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
              <div className="flex-row gap-3 flex items-center p-2 w-full">
                <div>
                  <LayoutDashboard />
                </div>
                {isExpanded && <span className="ml-2">Dashboard</span>}
              </div>
            </li>
          </Link>
          <Link href="/seller/orders">
          <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
            <div className="flex-row gap-3 flex items-center p-2 w-full">
              <div>
                <Package />
              </div>
              {isExpanded && <span className="ml-2">Orders</span>}
            </div>
          </li>
          </Link>
          <Link href="/seller/products">
          <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
            <div className="flex-row gap-3 flex items-center p-2 w-full">
              <div>
                <ShoppingBasket />
              </div>
              {isExpanded && <span className="ml-2">Products</span>}
            </div>
          </li>
          </Link>
          <Link href="/seller/chats">
          <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
            <div className="flex-row gap-3 flex items-center p-2 w-full ">
              <div className="relative">
                <MessageCircleMore />
                <div className="absolute -top-1 -right-2 z-10 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              {isExpanded && <span className="ml-2">Chats</span>}
            </div>
          </li>
          </Link>
          <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
            <div className="flex-row gap-3 flex items-center p-2 w-full">
              <div>
                <Settings />
              </div>
              {isExpanded && <span className="ml-2">Settings</span>}
            </div>
          </li>
          <li className="flex justify-start items-center rounded hover:bg-gray-700 cursor-pointer">
            <div className="flex-row gap-3 flex items-center p-2 w-full" onClick={handleLogout}>
              <div>
                <LogOut />
              </div>
              {isExpanded && <span className="ml-2">Logout</span>}
            </div>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-700 text-gray-300 text-sm">
        {isExpanded ? (
          "© 2025 Clampion Stores"
        ) : (
          <span className="sr-only">Footer</span>
        )}
      </div>
    </nav>
  );
}
