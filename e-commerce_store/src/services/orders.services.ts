import axios from "axios";
import { fetchOrdersObj } from "../types";

export class OrderService {
  // Fetch orders
  static async fetchOrders({
    isAuthenticated,
    token,
    unprocessed = true,
  }: fetchOrdersObj) {
    if (!isAuthenticated) {
      return null;
    }
    if (!token) {
      return null;
    }
    const orders = await axios.get(`/api/cart/seller/orders/${unprocessed}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return orders.data;
  }

  // view order details
  static async viewOrderDetails(orderId: string | number, token: string) {
    const res = await axios.put(
      `/api/cart/seller/orders/${orderId}/viewed`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }

  static async addTrackingCode(
    orderId: string | number,
    trackingCode: string,
    token: string,
  ) {
    if (!trackingCode || trackingCode.trim() === "") {
      throw new Error("Tracking code cannot be empty");
    }
    if (!orderId || !token) {
      throw new Error("Missing order ID or authentication token");
    }
    const res = await axios.put(
      `/api/cart/seller/orders/${orderId}/tracking`,
      {
        trackingCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      throw new Error("Failed to add tracking code");
    }
  }

  static async acceptOrder(orderId: string | number, token: string) {
    if (!orderId || !token) {
      throw new Error("Missing order ID or authentication token");
    }
    const res = await axios.put(
      `/api/cart/seller/orders/${orderId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      //send error message from backend if available
      if (axios.isAxiosError(res) && res.response) {
        const errorMessage =
          res.response.data.message || "Failed to accept order";
        throw new Error(errorMessage);
      } else {
        throw new Error("Failed to accept order");
      }
    }
  }

  static async getRecentOrders(token: string) {
    if (!token) {
      throw new Error("Missing authentication token");
    }
    const res = await axios.get(`/api/cart/seller/orders/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      throw new Error("Failed to fetch recent orders");
    }
  }

  static async getSalesData(token: string, timeFrame: string) {
    if (!token) {
      throw new Error("Missing authentication token");
    }
    const res = await axios.get(`/api/analysis/seller/sales/${timeFrame}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      throw new Error("Failed to fetch sales data");
    }
  }
}

export default OrderService;

export const viewOrder = OrderService.viewOrderDetails;
export const addTrackingCode = OrderService.addTrackingCode;
export const acceptOrder = OrderService.acceptOrder;
export const getRecentOrders = OrderService.getRecentOrders;
export const getSalesData = OrderService.getSalesData;
