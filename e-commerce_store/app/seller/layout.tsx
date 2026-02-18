"use client";

import AuthGuard from "@/src/components/common/AuthGuard";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["seller"]} unauthorizedRedirect="/">
      {children}
    </AuthGuard>
  );
}
