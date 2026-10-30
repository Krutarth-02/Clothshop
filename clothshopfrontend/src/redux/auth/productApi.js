import { api } from "../api/api";
import { handleGetProductById } from "./product.dispacher";

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.infiniteQuery({
      providesTags: ["Products"],
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
      },
      query: ({ queryArg: keyword, pageParam }) => ({
        url: "/products/search",
        params: { keyword, page: pageParam },
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
  useSearchProductsInfiniteQuery,
  useGetProductByIdQuery,
} = productApi;
