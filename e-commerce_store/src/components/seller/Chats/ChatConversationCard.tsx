"use client";
import { ChevronRight, Package, Calendar, DollarSign } from "lucide-react";

import { useState } from "react";
import ChatModal from "./ChatModal";
import Seller_ChatModal from "./seller_chat_modal";
import { on } from "events";

interface ChatConversationCardProps {
    customerId: number;
    customerName: string;
    lastMessage?: string;
    date: string;
    viewed: boolean;
}


export default function ChatConversationCard( {customerId,customerName, lastMessage, date, viewed}: ChatConversationCardProps) {
    const [chatModalProps, setChatModalProps] = useState({
        open: false,
        onOpenChange: (open: boolean) => setChatModalProps((prev) => ({ ...prev, open })),
        customerId: customerId,
    });



  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
        onClick={() => setChatModalProps((prev) => ({ ...prev, open: true }))}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-800">{customerName}</h3>
          {lastMessage && (
            <p className="text-sm text-gray-600 truncate max-w-xs mt-1">{lastMessage}</p>
          )}
        </div>
        <div className="text-xs text-gray-500">{date}</div>
      </div>
      {!viewed && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
      )}

    <div>
    </div>
      <Seller_ChatModal open={chatModalProps.open} onOpenChange={chatModalProps.onOpenChange} customerId={chatModalProps.customerId} />
    </div>
  );
}
