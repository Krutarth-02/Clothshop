import { api, getCacheSession } from "../api/api";

export async function handleWishlistChange(
  { userId, body, product },
  { dispatch, getState, queryFulfilled },
) {
  const patch = dispatch(
    api.util.updateQueryData("getWishlist", undefined, (draft) => {
      if (!Array.isArray(draft?.data) || draft.userId !== userId) return;
      if (body.action === "clear") draft.data = [];
      else if (product && !draft.data.some((item) => item._id === product._id))
        draft.data.unshift(product);
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    if (getCacheSession(getState) === userId) patch.undo();
  }
}

export async function handleRemoveWishlist(
  { userId, productId },
  { dispatch, getState, queryFulfilled },
) {
  const patch = dispatch(
    api.util.updateQueryData("getWishlist", undefined, (draft) => {
      if (!Array.isArray(draft?.data) || draft.userId !== userId) return;
      draft.data = draft.data.filter((item) => item._id !== productId);
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    if (getCacheSession(getState) === userId) patch.undo();
  }
}

export async function handleCartChange(
  { userId, body, item },
  { dispatch, getState, queryFulfilled },
) {
  const patch = dispatch(
    api.util.updateQueryData("getCart", undefined, (draft) => {
      if (!Array.isArray(draft?.data) || draft.userId !== userId) return;
      if (body.action === "clear") { draft.data = []; return; }
      const existing = draft.data.find((entry) =>
        entry.productId === body.productId && entry.color === body.color && entry.size === body.size);
      if (existing) existing.quantity = body.action === "add" ? existing.quantity + body.quantity : body.quantity;
      else if (item) draft.data.push(item);
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    if (getCacheSession(getState) === userId) patch.undo();
  }
}

export async function handleRemoveCart(
  { userId, productId, color, size },
  { dispatch, getState, queryFulfilled },
) {
  const patch = dispatch(
    api.util.updateQueryData("getCart", undefined, (draft) => {
      if (!Array.isArray(draft?.data) || draft.userId !== userId) return;
      draft.data = draft.data.filter((entry) =>
        !(entry.productId === productId && entry.color === color && entry.size === size));
    }),
  );
  try {
    await queryFulfilled;
  } catch {
    if (getCacheSession(getState) === userId) patch.undo();
  }
}

export const handleGetProductById = async (
  id,
  { dispatch, queryFulfilled },
) => {
  try {
    const { data: response } = await queryFulfilled;
    if (!response?.data || response.data._id !== id) return;

    dispatch(
      api.util.updateQueryData("getProducts", undefined, (draft) => {
        if (!Array.isArray(draft?.data)) return;
        const product = draft.data.find((item) => item._id === id);
        if (product) Object.assign(product, response.data);
      }),
    );
  } catch {
    // A failed read leaves the existing list unchanged; the query reports the error.
  }
};
