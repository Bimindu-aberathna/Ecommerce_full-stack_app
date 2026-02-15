"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import { toast, ToastContainer } from "react-toastify";
import { ShoppingBag, Bell } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { useLoading } from "@/src/hooks/useLoading";
import OrderService from "@/src/services/orders.services";
import ListItem from "@/src/components/seller/orders/listItem";


interface OrderItem {
  orderItemId: number;
  quantity: number;
  price: string;
  totalPrice: string;
  product: {
    id: number;
    name: string;
    brand: string;
    images: string;
    weight: string;
    variety: string;
  };
}

interface Order {
  orderId: number;
  orderNumber: string;
  totalAmount: string;
  status: string;
  viewed: boolean;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  postalCode: string;
  telephone: string;
  trackingNumber?: string | null;
  itemCount: number;
  customer: {
    id: number;
    email: string;
    name: string;
  };
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const { isAuthenticated, logout, token, user } = useAuth();
  const { showLoading, hideLoading, updateMessage, isLoading } = useLoading();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const previousOrderCount = useRef(0);
  const [unseenOrders, setUnseenOrders] = useState(false);
  const router = useRouter();

  const fetchOrders = async (showLoadingState = true) => {
    try {
      if (showLoadingState) showLoading("Loading orders...");
      setError(null);
      
      if (!token || !isAuthenticated || user?.role !== 'seller') {
        toast.error('Login required.');
        await new Promise(res => setTimeout(res, 1500));
        router.push('/auth/login');
        return;
      }

      const response = await OrderService.fetchOrders({
        isAuthenticated,
        token,
        unprocessed: unseenOrders
      });
      
      if (!response.success) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          router.push('/auth/login');
          return;
        }
        
        if (response.status === 404) {
          console.warn('Orders API endpoint not found');
          setOrders([]);
          return;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setOrders(response.data || []);

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders');
      
      if (!error.message?.includes('404')) {
        toast.error('Failed to load orders. Please try again.');
      }
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, token, unseenOrders]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex">
        <SellerNavbar name="orders" />
        <main className="flex-1 ml-64 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <ToastContainer />
      <SellerNavbar name="orders" />
      
      <main className="flex-1 ml-15 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Orders</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold">{orders.length}</span>
            </div>
            
            {newOrdersCount > 0 && (
              <button
                onClick={() => setNewOrdersCount(0)}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-xl"
              >
                <Bell className="w-5 h-5" />
                {newOrdersCount} New
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="mt-2 text-red-600 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ✅ Fixed: Removed extra wrapper div */}
        <div className="space-y-4">
          {orders.map((order) => (
            <ListItem
              key={order.orderId}
              order={order}
              onClick={() => router.push(`/seller/orders/${order.orderId}`)}
            />
          ))}
        </div>

        {orders.length === 0 && !error && (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No orders yet</h3>
            <p className="text-gray-500 mt-2">Orders will appear here when customers make purchases</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
