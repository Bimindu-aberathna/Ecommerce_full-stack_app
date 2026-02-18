"use client";

import CustomerNavbar from "@/src/components/buyer/navbar/CustomerNavbar";
import AuthGuard from "@/src/components/common/AuthGuard";
import { usePathname } from "next/navigation";



export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute =
    pathname === "/products" || pathname.startsWith("/products/");

  if (isPublicRoute) {
    return (
      <>
        <CustomerNavbar />
        {children}
      </>
    );
  }

  return (
    <AuthGuard allowedRoles={["buyer"]} unauthorizedRedirect="/seller/dashboard">
      <CustomerNavbar />
      {children}
    </AuthGuard>
  );
}
