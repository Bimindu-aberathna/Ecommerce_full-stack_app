"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  XMarkIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/outline";
import { SendHorizontal } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import ChatBubble from "../../common/Chat/chatBubble";
import { fetchSellerMessages, sendSellerMessage } from "@/src/services/chats.service";
import type { UserChatMessageDto } from "@/src/services/chats.service";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";

interface SellerChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: number | null;
}
interface Message {
  id: string;
  chatId?: string;
  sender: "user" | "admin";
  message: string;
  viewed: boolean;
  createdAt: Date;
}

export default function Seller_ChatModal({
  open,
  onOpenChange,
  customerId,
}: SellerChatModalProps) {
  const { isAuthenticated, token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    void loadMessages();
    
  }, [open, customerId, isAuthenticated, token]);

  useEffect(() => {
    if(!isAuthenticated || !token || user?.role !== 'seller') {
      setError("Please login as seller to view messages");
      setMessages([]);
      router.push('/login');
      return;
    }
  }, [isAuthenticated, token, user?.role]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
  };

  const loadMessages = async () => {
    setError(null);

    if (!isAuthenticated) {
      setError("Please login to view messages");
      setMessages([]);
      return;
    }

    if (!token) {
      setError("Missing auth token. Please login again.");
      setMessages([]);
      return;
    }

    if (!customerId) {
      setError("Missing customer id.");
      setMessages([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchSellerMessages(customerId, token);
      if (!res.success) {
        setError(res.message || "Failed to fetch messages");
        setMessages([]);
        return;
      }

      const flattened: Message[] = (res.messages || []).map(
        (m: UserChatMessageDto) => ({
          id: `${m.chatId}-${m.id}`,
          chatId: String(m.chatId),
          sender: m.sender,
          message: m.message,
          viewed: m.viewed,
          createdAt: new Date(m.createdAt),
        })
      );

      flattened.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      setMessages(flattened);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    let chatId = messages[0]?.chatId;
    if (!chatId) {
      setError("No chat found for this customer.");
      return;
    }
    if(!query.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    sendSellerMessage({
      isAuthenticated,
      token,
      message: query,
      chatId,
    }).then((res) => {
      if (!res.success) {
        setError(res.message || "Failed to send message");
      }
      setQuery("");
      void loadMessages();
    }
    ).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to send message");
    }
    );
  };



  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      className="relative z-10"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto left-2">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-900 shadow-xl transition-all">
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <span className="flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/10 p-2">
                <ChatBubbleBottomCenterIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
              </span>
              <DialogTitle
                as="h3"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Chat
              </DialogTitle>
              {/* close Button top right */}
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close"
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
              {/* Customer Info */}
              <div className="md:col-span-2 max-h-96 overflow-y-auto">
                {isLoading && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading messages...
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                {!isLoading && !error && messages.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No messages yet.
                  </div>
                )}

                {messages.map((m) => (
                  <ChatBubble
                    key={m.id}
                    isSender={m.sender === "admin"}
                    message={m.message}
                    viewed={m.viewed}
                    createdAt={m.createdAt}
                  />
                ))}
              </div>

              {/* Order Items */}
              <div className="md:col-span-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Order Items
                </h4>
                <form className="flex items-center overflow-x-auto rounded-lg" onSubmit={handleSendMessage}>
                  <input
                    id="query_input"
                    name="query_input"
                    type="text"
                    onChange={(e) => setQuery(e.target.value)}
                    value={query}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
                  />
                  <button onClick={sendMessage} className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition">
                    <SendHorizontal />
                  </button>
                </form>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
