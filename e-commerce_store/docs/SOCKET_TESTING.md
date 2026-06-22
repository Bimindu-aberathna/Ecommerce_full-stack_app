# Socket Testing Guide

## ✅ Yes, the socket IS listening to `chat:unread`

See [src/hooks/useSocket.ts](../src/hooks/useSocket.ts) lines 77-93.

## How to Verify It's Working

### 1. Check Console Logs

When the socket connects, you'll see:
```
✅ Socket connected: abc123xyz
   Listening for: chat:unread
   💡 Test in console: window.__socket.emit(...)
```

### 2. Watch for Incoming Events

When backend emits `chat:unread`, you'll see:
```
✅ Received chat:unread event: {scope: "user", hasUnread: true, ...}
   - Scope: user
   - Has Unread: true
   - Unread Count: 3
   → Updating USER badge to: true
```

### 3. Check State Updates

Open browser console and look for:
```
💬 ChatButton - hasNewMessages: true | isConnected: true
```

## Testing Without Backend

### Option 1: Test State Manually in Console

```javascript
// Open Redux DevTools or check window
// The state is in: state.userMessaging.hasNewMessages

// Manually trigger state update (client-side only test)
// This won't work with real socket, but tests the UI
import { store } from './src/store';
import { setUserHasNewMessages } from './src/store';
store.dispatch(setUserHasNewMessages(true));  // Badge should appear
store.dispatch(setUserHasNewMessages(false)); // Badge should disappear
```

### Option 2: Mock Backend Event (requires backend to be running)

Your backend needs to emit this event:

```javascript
// Backend code (when message is created)
io.to(`user:${userId}`).emit('chat:unread', {
  chatId: 123,
  userId: userId,
  scope: 'user',        // or 'admin' for seller
  unreadCount: 5,
  hasUnread: true
});
```

## Troubleshooting

### ❌ Not Connecting?

**Check:**
1. Is `NEXT_PUBLIC_SOCKET_URL` set in `.env.local`?
   ```env
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

2. Is the backend socket server running on that URL?

3. Is the user authenticated? (Socket only connects when logged in)

**Console will show:**
- ❌ No URL: `⚠️ NEXT_PUBLIC_SOCKET_URL not configured`
- ❌ Can't connect: `Socket connection error: TransportError`
- ✅ Connected: `✅ Socket connected: abc123`

### ✅ Connected but Badge Not Showing?

**Check Redux DevTools:**
1. Open Redux DevTools extension
2. Look at `state.userMessaging.hasNewMessages` (for buyers)
3. Or `state.adminMessaging.hasNewMessages` (for sellers)

**If state is `true` but badge not showing:**
- Check `hasNewMessages` value in console logs
- Inspect the button element in DevTools
- The badge element should be rendered when `hasNewMessages === true`

### ✅ Backend Emitting but Frontend Not Receiving?

**Check:**
1. Backend emits to correct room: `user:${userId}` or `admins`
2. Scope matches: `"user"` for buyers, `"admin"` for sellers
3. Event name is exactly: `"chat:unread"` (case-sensitive)
4. Payload structure matches:
   ```typescript
   {
     chatId: string | number;
     userId?: string | number;
     scope: "admin" | "user";
     unreadCount: number;
     hasUnread: boolean;
   }
   ```

## Quick Test Commands

### In Browser Console (when socket connected):

```javascript
// Check connection status
window.__socket?.connected  // Should be true

// Check current state
// Open Redux DevTools and select the store, then navigate to:
// state → userMessaging → hasNewMessages
// state → adminMessaging → hasNewMessages

// Check if listener is registered (advanced)
window.__socket?._callbacks?.$chat:unread  // Should show [function]
```

### Trigger from Backend (Node.js backend):

```javascript
// Test emitting to specific user
io.to('user:123').emit('chat:unread', {
  chatId: 1,
  userId: 123,
  scope: 'user',
  unreadCount: 1,
  hasUnread: true
});

// Test emitting to all admins
io.to('admins').emit('chat:unread', {
  chatId: 1,
  scope: 'admin',
  unreadCount: 1,
  hasUnread: true
});
```

## Expected Flow

1. User logs in → Socket connects
2. Backend creates message → 
3. Backend emits `chat:unread` to recipient →
4. Frontend `useSocket` receives event →
5. Frontend updates Redux state →
6. `ChatButton` re-renders with badge →
7. User opens chat → Backend emits `hasUnread: false` →
8. Badge disappears

## Still Not Working?

Check that:
- ✅ Socket URL is correct and backend is reachable
- ✅ JWT token is valid (socket auth uses `socket.handshake.auth.token`)
- ✅ User is in correct room on backend (joined `user:${userId}`)
- ✅ Backend emits with exact event name and payload structure
- ✅ Redux state is updating (use Redux DevTools)
- ✅ Component is reading state correctly (`useMassaging` hook)
