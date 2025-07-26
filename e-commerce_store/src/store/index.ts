import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { 
  TypedUseSelectorHook, 
  useDispatch, 
  useSelector
} from "react-redux";

// User interface for better type safety
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'buyer' | 'seller';
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
      }>
    ) => {
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

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError, 
  updateUser 
} = authSlice.actions;

// Persist configuration
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ['isAuthenticated', 'user', 'token'], // Only persist these fields
};

const persistedReducer = persistReducer(persistConfig, authSlice.reducer);

// Store factory function
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            "persist/PERSIST", 
            "persist/REHYDRATE",
            "persist/REGISTER"
          ],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Store singleton for client-side
let store: AppStore | undefined;

export const getStore = (): AppStore => {
  // Server-side: always create a new store
  if (typeof window === 'undefined') {
    return makeStore();
  }
  
  // Client-side: reuse the store
  if (!store) {
    store = makeStore();
  }
  
  return store;
};

// Persistor
export const persistor = persistStore(getStore());