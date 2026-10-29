import { api } from "../api/api";
import { handleGetProductById } from "./product.dispacher";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.query({
      providesTags: ["Products"],
      query: (keyword) => ({
        url: `/products/search?keyword=${keyword}`,
        method: "GET",
      }),
    }),
    getProducts: builder.query({
      providesTags: ["Products"],
      query: () => ({
        url: "/products",
        method: "GET",
      }),
    }),
    getProductById: builder.query({
      providesTags: ["Products"],
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      async onQueryStarted(arg, toolkitApi) {
        await handleGetProductById(arg, toolkitApi);
      },
    }),
  }),
});

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductByIdQuery,
} = productApi;
