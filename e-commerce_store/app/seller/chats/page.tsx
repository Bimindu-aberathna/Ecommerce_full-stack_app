"use client";
import React, { useState, useEffect } from "react";
import SellerNavbar from "@/src/components/buyer/navbar/SellerNavBar";
import ChatConversationCard from "@/src/components/seller/Chats/ChatConversationCard";
import { getSellarChatList } from "@/src/services/chats.service";
import { useAuth } from "@/src/hooks/useAuth";

type chatCardPropType = {
  customerId: number;
  customerName: string;
  lastMessage?: string;
  date: string;
  viewed: boolean;
};

const Chats: React.FC = () => {
  const { token } = useAuth();
  const [chats, setChats] = useState<chatCardPropType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChats = async () => {
    if (!token) {
      console.error("No authentication token found. Please login.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await getSellarChatList(token);
      if (response?.success && Array.isArray(response?.chats)) {
        const normalizedChats = response.chats.map((chat: any) => ({
          customerId: chat?.user?.id || 0,
          customerName:
            (chat?.user?.firstName ? chat.user.firstName : "") +
            (chat?.user?.lastName ? " " + chat.user.lastName : "") ||
            "Unknown User",
          lastMessage: chat.messages?.[0]?.message || "No messages yet",
          date: new Date(
            chat.messages?.[0]?.updatedAt ||
              chat.messages?.[0]?.createdAt ||
              chat.createdAt
          ).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          viewed: chat.messages?.[0]?.viewed || false,
        }));
        setChats(normalizedChats);
      } else {
        console.error("Failed to fetch chats:", response?.message);
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [token]);

  return (
    <div>
      <SellerNavbar />
      <div className="p-6 ml-16 md:ml-64">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Seller Chats</h1>
          <p className="text-gray-600">
            Manage your conversations with customers
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading chats...</div>
          </div>
        ) : chats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat, index) => (
              <ChatConversationCard
                key={index}
                customerName={chat.customerName}
                lastMessage={chat.lastMessage}
                date={chat.date}
                viewed={chat.viewed}
                customerId={chat.customerId}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No chats yet</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Chats;
