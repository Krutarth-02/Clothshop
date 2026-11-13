import { api, getCacheSession } from "../api/api";

export async function handleCreateCodOrder(_values, toolkitApi) {
  const { dispatch, queryFulfilled, getState } = toolkitApi;
  const session = getCacheSession(getState);
  const isCurrent = () => getCacheSession(getState) === session;
  try {
    const { data: response } = await queryFulfilled;
    if (!isCurrent() || !response?.data) return;
    const orders = [response.data];
    dispatch(api.util.updateQueryData("getPayments", undefined, (draft) => {
      if (!Array.isArray(draft?.data)) return;
      for (const order of orders) {
        const existing = draft.data.find((item) => item._id === order._id);
        if (existing) Object.assign(existing, order);
        else draft.data.push(order);
      }
      draft.data.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b._id.localeCompare(a._id));
      draft.count = draft.data.length;
    }));
    for (const args of api.util.selectCachedArgsForQuery(getState(), "getCheckoutDetails")) {
      dispatch(api.util.updateQueryData("getCheckoutDetails", args, (draft) => {
        if (!draft?.data || !response.data.shippingAddress) return;
        draft.data.shippingAddress = response.data.shippingAddress;
      }));
    }
  } catch {
    // Failed checkout leaves cached orders and stock unchanged.
  }
}
