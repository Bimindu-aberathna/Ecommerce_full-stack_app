# Socket Notification Usage

## What's Implemented

A minimal socket connection that ONLY handles `chat:unread` events to show/hide notification badges.

## Files

- **`src/hooks/useSocket.ts`** - Connects to socket, listens to `chat:unread`, updates badge state
- **`src/hooks/useMassaging.ts`** - Provides badge state and updaters

## Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## How to Use in TSX Files

### Example 1: Show Badge on Chat Button (Buyer)

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useSocket } from "@/src/hooks/useSocket";
import { useMassaging } from "@/src/hooks/useMassaging";

export default function ChatButton() {
  const { isConnected } = useSocket(); // Initialize socket connection
  const { hasNewMessages } = useMassaging(); // Get badge state

  return (
    <button className="relative">
      <MessageCircle className="w-6 h-6" />
      
      {/* Red dot badge */}
      {hasNewMessages && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
```

### Example 2: Show Badge on Seller Chat List

```tsx
"use client";

import { useSocket } from "@/src/hooks/useSocket";
import { useMassaging } from "@/src/hooks/useMassaging";

export default function SellerChatPage() {
  const { isConnected } = useSocket(); // Initialize socket
  const { hasAdminNewMessages } = useMassaging(); // Get seller badge state

  return (
    <div>
      <h1>
        Chats 
        {hasAdminNewMessages && (
          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" />
        )}
      </h1>
    </div>
  );
}
```

### Example 3: Show Badge in Navbar

```tsx
"use client";

import Link from "next/link";
import { useSocket } from "@/src/hooks/useSocket";
import { useMassaging } from "@/src/hooks/useMassaging";

export default function Navbar() {
  useSocket(); // Initialize socket connection once
  const { hasNewMessages } = useMassaging();

  return (
    <nav>
      <Link href="/chat" className="relative">
        Messages
        {hasNewMessages && <span className="badge">New</span>}
      </Link>
    </nav>
  );
}
```

## Backend Event Format

Your backend should emit `chat:unread` events like this:

```javascript
// When a message is sent
io.to(`user:${recipientId}`).emit('chat:unread', {
  chatId: 123,
  userId: recipientId,
  scope: 'user',        // or 'admin' for seller
  unreadCount: 5,
  hasUnread: true
});

// When chat is marked as read
io.to(`user:${userId}`).emit('chat:unread', {
  chatId: 123,
  userId: userId,
  scope: 'user',
  unreadCount: 0,
  hasUnread: false      // This clears the badge
});
```

## State Management

The state is stored in Redux and persisted, so:
- ✅ Badge state survives page reloads
- ✅ Badge updates across all components using `useMassaging()`
- ✅ No need to manually refresh or poll

## Clearing the Badge

Your existing HTTP endpoints should emit `chat:unread` with `hasUnread: false` after marking messages as viewed. The frontend will automatically update.

## Notes

- Call `useSocket()` once in a parent component (layout, navbar, or chat button)
- Use `useMassaging()` in any component that needs to display the badge
- The socket auto-reconnects if disconnected
- Only connects when user is authenticated
