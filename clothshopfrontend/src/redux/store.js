import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import { cartReducer, cartPersistenceMiddleware } from "./cart/cartSlice";
import { wishlistReducer, wishlistPersistenceMiddleware } from "./wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, cartPersistenceMiddleware, wishlistPersistenceMiddleware),
});
