import { configureStore, createSlice, PayloadAction, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};


interface cartState {
  itemCount: number;
}

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string | null;
  loadingType: 'auth' | 'profile' | 'products' | 'cart' | 'orders' | 'general' | null;
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  loadingMessage: null,
  loadingType: null,
};

// Message interface
interface Message {
  id: string;
  customerId: string;
  sellerId: string;
  senderId: string;
  senderRole: 'buyer' | 'seller';
  receiverId: string;
  content: string;
  messageType: 'product_inquiry' | 'order_inquiry' | 'general';
  productId?: string;
  orderId?: string;
  timestamp: number;
  isRead: boolean;
}

interface MessagingState {
  messagesByCustomer: Record<string, Message[]>;
  activeCustomerId: string | null;
  loading: boolean;
  error: string | null;
  lastSyncedAt: number | null;
}

const initialMessagingState: MessagingState = {
  messagesByCustomer: {},
  activeCustomerId: null,
  loading: false,
  error: null,
  lastSyncedAt: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

const initialCartState = {
  itemCount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    setCount: (state, action: PayloadAction<number>) => {
      state.itemCount = action.payload;
    },
  },
});

const loadingSlice = createSlice({
  name: "loading",
  initialState: initialLoadingState,
  reducers: {
    startLoading: (state, action: PayloadAction<{ 
      message?: string; 
      type?: LoadingState['loadingType'] 
    }>) => {
      state.isLoading = true;
      state.loadingMessage = action.payload.message || "Loading...";
      state.loadingType = action.payload.type || "general";
    },
    stopLoading: (state) => {
      state.isLoading = false;
      state.loadingMessage = null;
      state.loadingType = null;
    },
    updateLoadingMessage: (state, action: PayloadAction<string>) => {
      if (state.isLoading) {
        state.loadingMessage = action.payload;
      }
    },
  },
});

// Messaging slice
const messagingSlice = createSlice({
  name: "messaging",
  initialState: initialMessagingState,
  reducers: {
    setMessagesForCustomer: (
      state,
      action: PayloadAction<{ customerId: string; messages: Message[] }>
    ) => {
      state.messagesByCustomer[action.payload.customerId] = action.payload.messages;
      state.loading = false;
      state.error = null;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { customerId } = action.payload;
      if (!state.messagesByCustomer[customerId]) {
        state.messagesByCustomer[customerId] = [];
      }
      state.messagesByCustomer[customerId].push(action.payload);
    },
    setActiveCustomer: (state, action: PayloadAction<string | null>) => {
      state.activeCustomerId = action.payload;
    },
    markAsReadForCustomer: (
      state,
      action: PayloadAction<{ customerId: string; messageIds: string[] }>
    ) => {
      const messages = state.messagesByCustomer[action.payload.customerId] || [];
      messages.forEach((msg) => {
        if (action.payload.messageIds.includes(msg.id)) {
          msg.isRead = true;
        }
      });
    },
    setMessagingLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMessagingError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLastSyncedAt: (state, action: PayloadAction<number | null>) => {
      state.lastSyncedAt = action.payload;
    },
    clearActiveCustomer: (state) => {
      state.activeCustomerId = null;
    },
  },
});


export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError, 
  updateUser 
} = authSlice.actions;

export const {
  setCount
} = cartSlice.actions;  

export const {
  startLoading,
  stopLoading,
  updateLoadingMessage
} = loadingSlice.actions;

export const {
  setMessagesForCustomer,
  addMessage,
  setActiveCustomer,
  markAsReadForCustomer,
  setMessagingLoading,
  setMessagingError,
  setLastSyncedAt,
  clearActiveCustomer
} = messagingSlice.actions;

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ['auth', 'cart', 'messaging'],
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  cart: cartSlice.reducer,
  loading: loadingSlice.reducer,
  messaging: messagingSlice.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;