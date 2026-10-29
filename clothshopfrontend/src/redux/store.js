import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import { cartReducer, cartPersistenceMiddleware } from "./cart/cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, cartPersistenceMiddleware),
});
