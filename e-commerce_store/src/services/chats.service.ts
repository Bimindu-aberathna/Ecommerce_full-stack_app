import axios from "axios";
import { fetchUserMessagesObj } from "../types";

export type UserChatMessageDto = {
  id: number;
  chatId: number;
  sender: "user" | "admin";
  message: string;
  viewed: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type UserChatDto = {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  messages: UserChatMessageDto[];
};

export type FetchUserMessagesResult =
  | { success: true; chats: UserChatDto[] }
  | { success: false; message: string };

export class ChatService {
  // Fetch user messages
  //Add to cart
  //   static async addToCart({
  //     isAuthenticated,
  //     token,
  //     varietyId,
  //     quantity
  //   }: addToCartObj) {
  //     if(!isAuthenticated) {
  //       return { success: false, message: 'User not authenticated' };
  //     }
  //     if(!token) {
  //       return { success: false, message: 'No token provided' };
  //     }
  //     try {
  //       const response = await axios.post(
  //         `/api/cart/add`,
  //         {
  //           productVarietyId: varietyId,
  //           quantity
  //         },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json"
  //           },
  //         }
  //       );
  //       return response.data;
  //     } catch (error) {
  //       console.error('Add to cart error:', error);
  //       if (axios.isAxiosError(error) && error.response) {
  //         return {
  //           success: false,
  //           message: error.response.data.message || 'Add to cart failed'
  //         };
  //       }
  //       return { success: false, message: 'Network error' };
  //     }
  //   }

  static async fetchUserMessages({
    isAuthenticated,
    token,
    customerId,
  }: fetchUserMessagesObj) {
    if (!isAuthenticated) {
      return {
        success: false as const,
        message: "User not authenticated. Please login to view messages",
      };
    }
    if (!token) {
      return {
        success: false as const,
        message: "No token provided, Please login again",
      };
    }
    try {
      const response = await axios.get(`/api/chat/user/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status >= 200 && response.status < 300) {
        console.log("Fetch user messages response:", response.data);
        const chats = Array.isArray(response.data?.chats)
          ? response.data.chats
          : Array.isArray(response.data)
            ? response.data
            : [];

        return { success: true as const, chats };
      } else {
        return { success: false as const, message: "Failed to fetch messages" };
      }
    } catch (error) {
      console.error("Fetch user messages error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Failed to fetch messages",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  //send user Message
  static async sendUserMessage({
    isAuthenticated,
    token,
    productId,
    message,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    productId: string;
    message: string;
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login to send messages",
      };
    } else if (!message.trim()) {
      return { success: false as const, message: "Message cannot be empty" };
    }
    try {
      const response = await axios.post(
        `/api/chat/user/message`,
        {
          ...(productId && { productId }),
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status >= 200 && response.status < 300) {
        return { success: true as const };
      } else {
        return { success: false as const, message: "Failed to send message" };
      }
    } catch (error) {
      console.error("Send user message error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Failed to send message",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  static async fetchSellerMassages(customerId: string, token: string) {
    try {
      const response = await axios.get(
        `/api/chat/admin/chats/user/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status >= 200 && response.status < 300) {
        // console.log('Fetch seller messages response:', response.data);
        const messages = Array.isArray(response.data?.chat?.messages)
          ? response.data.chat.messages
          : Array.isArray(response.data)
            ? response.data
            : [];
        return { success: true as const, messages };
      } else {
        return { success: false as const, message: "Failed to fetch messages" };
      }
    } catch (error) {
      console.error("Fetch seller messages error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Failed to fetch messages",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  //send seller Message
  static async sendSellerMessage({
    isAuthenticated,
    token,
    message,
    chatId,
  }: {
    isAuthenticated: boolean;
    token: string | null;
    message: string;
    chatId: string | number;
  }) {
    if (!isAuthenticated || !token) {
      return {
        success: false as const,
        message: "User not authenticated. Please login to send messages",
      };
    } else if (!message.trim()) {
      return { success: false as const, message: "Message cannot be empty" };
    }
    try {
      const response = await axios.post(
        `/api/chat/admin/message`,
        {
          chatId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status >= 200 && response.status < 300) {
        return { success: true as const };
      } else {
        return { success: false as const, message: "Failed to send message" };
      }
    } catch (error) {
      console.error("Send seller message error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Failed to send message",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }

  static async getSellarChatList(token: string) {
    try {
      const response = await axios.get(`/api/chat/seller/chats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status >= 200 && response.status < 300) {
        // console.log("Fetch seller chat list response:", response.data);
        return { success: true as const, chats: response.data.chats };
      } else {
        return {
          success: false as const,
          message: "Failed to fetch chat list",
        };
      }
    } catch (error) {
      console.error("Fetch seller chat list error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false as const,
          message: error.response.data.message || "Failed to fetch chat list",
        };
      }
      return { success: false as const, message: "Network error" };
    }
  }
}

export const sendSellerMessage = ChatService.sendSellerMessage;
export const fetchSellerMessages = ChatService.fetchSellerMassages;
export const fetchUserMessages = ChatService.fetchUserMessages;
export const sendUserMessage = ChatService.sendUserMessage;
export const getSellarChatList = ChatService.getSellarChatList;
