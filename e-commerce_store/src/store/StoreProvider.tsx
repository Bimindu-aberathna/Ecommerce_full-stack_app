"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { getStore, persistor } from "@/src/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = getStore();

  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        } 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
