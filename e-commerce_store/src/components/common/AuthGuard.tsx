"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";

type Role = "buyer" | "seller";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
  unauthorizedRedirect?: string;
}

const buildRedirectUrl = (pathname: string, target: string) => {
  const hasQuery = target.includes("?");
  const separator = hasQuery ? "&" : "?";
  return `${target}${separator}next=${encodeURIComponent(pathname)}`;
};

export default function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
  unauthorizedRedirect = "/",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const [isAllowed, setIsAllowed] = useState(false);

  const normalizedRole = useMemo<Role | null>(() => {
    if (!user?.role) return null;
    return user.role === "seller" ? "seller" : "buyer";
  }, [user?.role]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsAllowed(false);
      router.replace(buildRedirectUrl(pathname, redirectTo));
      return;
    }

    if (allowedRoles && normalizedRole && !allowedRoles.includes(normalizedRole)) {
      setIsAllowed(false);
      router.replace(unauthorizedRedirect);
      return;
    }

    setIsAllowed(true);
  }, [
    isAuthenticated,
    user,
    normalizedRole,
    allowedRoles,
    router,
    pathname,
    redirectTo,
    unauthorizedRedirect,
  ]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
