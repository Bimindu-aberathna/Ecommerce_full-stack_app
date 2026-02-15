"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import {
  Package,
  ShoppingBasket,
  DollarSign,
  TrendingUp,
  MessageCircleMore,
  AlertTriangle,
} from "lucide-react";
import { getRecentOrders, getSalesData } from "@/src/services/orders.services";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAuth } from "@/src/hooks/useAuth";
import { ProductService } from "@/src/services/product.service";
import SalesChart from "@/src/components/seller/dashboard/SalesChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const kpis = [
  {
    title: "Total Orders",
    value: "128",
    delta: "+12%",
    icon: Package,
  },
  {
    title: "Revenue (30d)",
    value: "Rs. 1,245,000",
    delta: "+8%",
    icon: DollarSign,
  },
  {
    title: "Products",
    value: "342",
    delta: "+6",
    icon: ShoppingBasket,
  },
  {
    title: "Conversion",
    value: "3.4%",
    delta: "+0.3%",
    icon: TrendingUp,
  },
];

type recentOrder = {
  id: string;
  customer: string;
  total: string;
  status: string;
};

// const lowStock = [
//   { name: "iPhone 16 Pro 256GB", stock: 4 },
//   { name: "Sony WH-1000XM5", stock: 6 },
//   { name: "MacBook Air M3", stock: 3 },
// ];

type lowStockItem = {
  brand: string;
  name: string;
  variant: string;
  stock: number;
  preOrderLevel: number;
};

const activity = [
  "New order ORD-1021 created",
  "Stock updated: Sony WH-1000XM5",
  "Customer message received",
];

type salesDataPoint = {
  period: string;
  totalSales: number;
  orderCount: number;
};

const Dashboard: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<recentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<lowStockItem[]>([]);
  const [dataTimeFrame, setDataTimeFrame] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [salesData, setSalesData] = useState<salesDataPoint[]>([]);
  const { token } = useAuth();

  const fetchRecentOrders = async () => {
    if (!token) {
      console.error(
        "No authentication token found. Cannot fetch recent orders.",
      );
      return;
    }
    try {
      const response = await getRecentOrders(token);
      const rawOrders =
        (Array.isArray(response?.data?.orders) && response.data.orders) ||
        (Array.isArray(response?.orders) && response.orders) ||
        (Array.isArray(response?.data) && response.data) ||
        [];

      const normalized = rawOrders.map((element: any) => ({
        id: String(element.orderId || element.id || ""),
        customer: element.customer?.name || "Unknown Customer",
        total: String(element.totalAmount || element.total || ""),
        status: String(element.status || ""),
      }));

      setRecentOrders(normalized);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const response = await getSalesData(token, dataTimeFrame);
      const rawData = response?.data || response || [];
      setSalesData(rawData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  const fetchLowStockItems = async () => {
    if (!token) {
      console.error(
        "No authentication token found. Cannot fetch low stock items.",
      );
      return;
    }
    try {
      const response = await ProductService.getLowStockProducts(token);
      const rawProducts =
        (Array.isArray(response?.data) && response.data) ||
        (Array.isArray(response?.data?.data) && response.data.data) ||
        (Array.isArray(response) && response) ||
        [];
      const normalized = rawProducts.map((element: any) => ({
        brand: element.product?.brand || "Unknown Brand",
        name: element.product?.name || "Unknown Product",
        variant: element.name || "Default Variant",
        stock: element.stock || 0,
        preOrderLevel: element.preOrderLevel || 0,
      }));

      setLowStockItems(normalized);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecentOrders();
      fetchLowStockItems();
    }
  }, [token]);
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [dataTimeFrame, token]);
  return (
    <div>
      <SellerNavbar />
      <div className="p-6 ml-16 md:ml-64">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-gray-600">
            Quick snapshot of sales, inventory, and customer activity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.title}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{kpi.title}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {kpi.value}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <kpi.icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 text-xs text-green-600">{kpi.delta}</p>
            </div>
          ))}
        </div>
        {salesData.length > 0 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sales Performance</h2>
                <p className="text-sm text-gray-500 mt-1">Track your sales and orders over time</p>
              </div>
              <select
                value={dataTimeFrame}
                onChange={(e) => setDataTimeFrame(e.target.value as any)}
                className="w-full sm:w-40 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition duration-200"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="w-full">
              <SalesChart data={salesData} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link
                href="/seller/orders"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.id}
                      </p>
                      <p className="text-xs text-gray-500">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.total}
                      </p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No recent orders found.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h2 className="text-lg font-semibold">Low Stock</h2>
            </div>
            <div className="space-y-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {item.brand} {item.name}
                      </span>
                      <span className="font-semibold text-red-600">
                        {item.stock}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.variant} • Pre-order level: {item.preOrderLevel}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No low stock items.</p>
              )}
            </div>
            <Link
              href="/seller/products"
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              Manage inventory
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/seller/products/new"
                className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add New Product
              </Link>
              <Link
                href="/seller/orders"
                className="rounded-md border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Review Orders
              </Link>
              <Link
                href="/seller/chats"
                className="rounded-md border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Open Messages
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircleMore className="h-4 w-4 text-blue-600" />
              <h2 className="text-lg font-semibold">Activity Feed</h2>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {activity.map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-gray-100 px-3 py-2"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
