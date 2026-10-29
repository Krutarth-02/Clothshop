import { api } from "../api/api";

export async function handleGetProductById(
  id,
  { dispatch, queryFulfilled },
) {
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
}
