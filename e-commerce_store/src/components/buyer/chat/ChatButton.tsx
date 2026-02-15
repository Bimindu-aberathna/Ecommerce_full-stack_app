"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Buyer_ChatModal from "./buyer_chat_modal";
import { useAuth } from "@/src/hooks/useAuth";

export default function ChatButton({ productId }: { productId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, token } = useAuth();

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-50 flex items-center gap-2"
        aria-label="Open chat"
        disabled={!isAuthenticated}
        title={!isAuthenticated ? "Login to chat" : "Chat with seller"}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Chat with Seller</span>
      </button>

      {/* Chat Modal */}
      {isOpen && isAuthenticated && (
        <Buyer_ChatModal
          open={isOpen}
          onOpenChange={setIsOpen}
          productId={productId ?? null}
        />
      )}
    </>
  );
}
