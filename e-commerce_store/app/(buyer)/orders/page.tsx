"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Package, Truck } from "lucide-react";
import { AxiosError } from "axios";
import { useAuth } from "@/src/hooks/useAuth";
import OrderService from "@/src/services/orders.services";

type OrderItem = {
  id: number;
  quantity: number;
  price: string;
  totalPrice: string;
  productVariety?: {
    name: string;
    product?: { id: number; name: string };
  };
};

type UserOrder = {
  id: number;
  orderNumber: string;
  totalAmount: string;
  status: string;
  shippingAddress: string | Record<string, string>;
  trackingNumber: string | null;
  viewed: boolean;
  createdAt: string;
  items: OrderItem[];
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

function parseAddress(value: UserOrder["shippingAddress"]) {
  if (typeof value === "object" && value) return value;
  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    return { address: "Address unavailable" };
  }
}

function formatCurrency(value: string) {
  return `Rs. ${Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    let active = true;
    setLoading(true);
    setError("");

    OrderService.fetchUserOrders(token)
      .then((response) => {
        if (!active) return;
        if (!response?.success) throw new Error(response?.message || "Failed to fetch orders");
        setOrders(response.data?.orders || []);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof AxiosError
          ? requestError.response?.data?.message
          : requestError instanceof Error ? requestError.message : "Failed to fetch orders";
        setError(message || "Failed to fetch orders");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  if (loading) {
    return <main className="mx-auto max-w-5xl px-4 py-12"><div className="h-8 w-48 animate-pulse rounded bg-slate-200" /><div className="mt-8 space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-slate-100" />)}</div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Your purchases</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Order history</h1>
            <p className="mt-2 text-slate-500">Keep track of every order from placed to delivered.</p>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Continue shopping <ArrowRight size={16} />
          </Link>
        </div>

        {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {orders.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Package className="mx-auto text-slate-400" size={42} />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No orders yet</h2>
            <p className="mt-2 text-slate-500">Your completed purchases will appear here.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Browse products</Link>
          </section>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const address = parseAddress(order.shippingAddress);
              const status = order.status.toLowerCase();
              const itemPreview = order.items.slice(0, 2);
              const remainingItems = order.items.length - itemPreview.length;

              return (
                <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-bold text-slate-900">{order.orderNumber}</h2>
                        {!order.viewed && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">New</span>}
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[status] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>{order.status}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(order.createdAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><Package size={14} /> {order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                      </div>
                    </div>
                    <div className="sm:text-right"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Order total</p><p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p></div>
                  </div>

                  <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_240px]">
                    <div className="space-y-3">
                      {itemPreview.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                          <div className="min-w-0"><p className="truncate font-medium text-slate-800">{item.productVariety?.product?.name || "Product"}</p><p className="mt-1 text-sm text-slate-500">{item.productVariety?.name || "Standard"} · Qty {item.quantity}</p></div>
                          <p className="shrink-0 text-sm font-semibold text-slate-700">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      ))}
                      {remainingItems > 0 && <p className="px-1 text-sm text-slate-500">+ {remainingItems} more item{remainingItems === 1 ? "" : "s"}</p>}
                    </div>
                    <div className="border-t border-slate-100 pt-4 text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="font-semibold text-slate-800">Delivery details</p>
                      <p className="mt-2 text-slate-500">{address.address || "Address unavailable"}</p>
                      {address.postalCode && <p className="text-slate-500">{address.postalCode}</p>}
                      {address.telephone && <p className="mt-1 text-slate-500">{address.telephone}</p>}
                      <p className="mt-4 inline-flex items-center gap-1.5 font-medium text-slate-700">{order.trackingNumber ? <><Truck size={15} /> {order.trackingNumber}</> : <><Clock3 size={15} /> Tracking pending</>}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><CheckCircle2 size={14} className="text-emerald-600" /> Payment recorded</span>
                    <Link href={`/products/${order.items[0]?.productVariety?.product?.id || ""}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">View product <ArrowRight className="ml-1 inline" size={14} /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
