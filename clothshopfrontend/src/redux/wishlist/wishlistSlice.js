import { createSlice } from "@reduxjs/toolkit";
import { productOptions } from "../../components/product/productOptions";

export const WISHLIST_STORAGE_KEY = "hifashopnhub.wishlist.v1";

function snapshot(product) {
  if (!product || !/^[a-f\d]{24}$/i.test(product._id || "") || typeof product.name !== "string" || !product.name.trim()) return null;
  return { _id: product._id, name: product.name, image: typeof product.image === "string" ? product.image : "",
    description: typeof product.description === "string" ? product.description : "",
    category: typeof product.category === "string" ? product.category : "",
    price: Number.isFinite(product.price) && product.price >= 0 ? product.price : null,
    stock: Number.isInteger(product.stock) && product.stock >= 0 ? product.stock : null,
    color: productOptions(product.color), size: productOptions(product.size) };
}

export function readSavedWishlist() {
  try {
    if (typeof localStorage === "undefined") return { items: [] };
    const saved = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY));
    const items = (Array.isArray(saved?.items) ? saved.items : []).map(snapshot).filter(Boolean);
    return { items: [...new Map(items.map((product) => [product._id, product])).values()] };
  } catch { return { items: [] }; }
}

const wishlistSlice = createSlice({
  name: "wishlist", initialState: readSavedWishlist(),
  reducers: {
    toggleWishlist(state, { payload: product }) {
      const index = state.items.findIndex((item) => item._id === product?._id);
      if (index !== -1) { state.items.splice(index, 1); return; }
      const item = snapshot(product);
      if (item) state.items.unshift(item);
    },
    clearWishlist(state) { state.items = []; },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const wishlistPersistenceMiddleware = (store) => (next) => (action) => {
  const previous = store.getState().wishlist;
  const result = next(action);
  if (store.getState().wishlist !== previous) {
    try { localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(store.getState().wishlist)); }
    catch { /* Saving still works for the current session when storage is unavailable. */ }
  }
  return result;
};
