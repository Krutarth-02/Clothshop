import { createSlice } from "@reduxjs/toolkit";
import { productOptions } from "../../components/product/productOptions";

// Cart state stays local until the backend provides cart/order endpoints.

export const CART_STORAGE_KEY = "clothshop.cart.v1";
export const itemKey = (id, color, size) => JSON.stringify([id, color, size]);

export function validItem(item) {
  return (
    item &&
    typeof item.productId === "string" &&
    /^[a-f\d]{24}$/i.test(item.productId) &&
    typeof item.name === "string" &&
    Boolean(item.name.trim()) &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.size === "string" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    Number.isInteger(item.stock) &&
    item.stock >= 0
  );
}

export function readSavedCart() {
  try {
    if (typeof localStorage === "undefined") return { items: [], buyNow: null };
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    const items = [];
    for (const item of Array.isArray(saved?.items) ? saved.items : []) {
      if (!validItem(item)) continue;
      const key = itemKey(item.productId, item.color, item.size);
      const existing = items.find((entry) => entry.key === key);
      if (existing) existing.quantity += item.quantity;
      else items.push({ ...item, key });
    }
    return {
      items,
      buyNow: validItem(saved?.buyNow)
        ? {
            ...saved.buyNow,
            key: itemKey(
              saved.buyNow.productId,
              saved.buyNow.color,
              saved.buyNow.size,
            ),
          }
        : null,
    };
  } catch {
    return { items: [], buyNow: null };
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState: readSavedCart(),
  reducers: {
    addCartItem(state, { payload: item }) {
      if (!validItem(item)) return;
      const total = state.items
        .filter((entry) => entry.productId === item.productId)
        .reduce((sum, entry) => sum + entry.quantity, 0);
      if (total + item.quantity > item.stock) return;
      const key = itemKey(item.productId, item.color, item.size);
      const existing = state.items.find((entry) => entry.key === key);
      if (existing) {
        existing.quantity += item.quantity;
        existing.price = item.price;
        existing.stock = item.stock;
      } else state.items.push({ ...item, key });
    },
    removeCartItem(state, { payload: key }) {
      state.items = state.items.filter((item) => item.key !== key);
    },
    changeCartQuantity(state, { payload: { key, quantity, stock } }) {
      const item = state.items.find((entry) => entry.key === key);
      if (
        !item ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        !Number.isInteger(stock) ||
        stock < 0
      )
        return;
      const otherQuantity = state.items
        .filter(
          (entry) => entry.productId === item.productId && entry.key !== key,
        )
        .reduce((sum, entry) => sum + entry.quantity, 0);
      if (quantity < item.quantity || quantity + otherQuantity <= stock) {
        item.quantity = quantity;
        item.stock = stock;
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setBuyNowItem(state, { payload: item }) {
      if (validItem(item) && item.quantity <= item.stock)
        state.buyNow = {
          ...item,
          key: itemKey(item.productId, item.color, item.size),
        };
    },
    changeBuyNowQuantity(state, { payload: { quantity, stock } }) {
      if (
        state.buyNow &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        Number.isInteger(stock) &&
        stock >= 0 &&
        (quantity < state.buyNow.quantity || quantity <= stock)
      ) {
        state.buyNow.quantity = quantity;
        state.buyNow.stock = stock;
      }
    },
    clearBuyNow(state) {
      state.buyNow = null;
    },
  },
});

export const cartActions = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export function createCartItem(product, color, size, quantity) {
  if (typeof product.price !== "number" || !Number.isFinite(product.price))
    return null;
  const colors = productOptions(product.color),
    sizes = productOptions(product.size);
  if (
    (colors.length ? !colors.includes(color) : Boolean(color)) ||
    (sizes.length ? !sizes.includes(size) : Boolean(size))
  )
    return null;
  const item = {
    productId: product._id,
    name: product.name,
    image: product.image || "",
    price: Math.round(product.price * 100) / 100,
    color: color || "",
    size: size || "",
    quantity,
    stock: product.stock,
  };
  return validItem(item) && quantity <= product.stock
    ? { ...item, key: itemKey(item.productId, item.color, item.size) }
    : null;
}

export const addToCart = (item) => (dispatch, getState) => {
  if (!validItem(item)) return false;
  const total = getState()
    .cart.items.filter((entry) => entry.productId === item.productId)
    .reduce((sum, entry) => sum + entry.quantity, 0);
  if (total + item.quantity > item.stock) return false;
  dispatch(cartActions.addCartItem(item));
  return true;
};

export const {
  removeCartItem,
  changeCartQuantity,
  clearCart,
  setBuyNowItem,
  changeBuyNowQuantity,
  clearBuyNow,
} = cartActions;

export const cartPersistenceMiddleware = (store) => (next) => (action) => {
  const previousCart = store.getState().cart;
  const result = next(action);
  const cart = store.getState().cart;
  if (cart !== previousCart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // The cart remains usable for this session when storage is unavailable.
    }
  }
  return result;
};
