import { api } from "../api/api";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query({
      query: () => "/admin/products",
      providesTags: ["Products"],
    }),
    saveAdminProduct: builder.mutation({
      query: ({ id, ...product }) => ({
        url: id
          ? "/admin/products/" + encodeURIComponent(id)
          : "/admin/products",
        method: id ? "PUT" : "POST",
        body: product,
      }),
      invalidatesTags: (result, error) => (error ? [] : ["Products"]),
    }),
    deleteAdminProduct: builder.mutation({
      query: (id) => ({
        url: "/admin/products/" + encodeURIComponent(id),
        method: "DELETE",
      }),
      invalidatesTags: (result, error) => (error ? [] : ["Products"]),
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useSaveAdminProductMutation,
  useDeleteAdminProductMutation,
} = adminApi;
