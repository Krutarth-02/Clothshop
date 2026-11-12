import { api } from "../api/api";

const adminOptions = { skipAuthRedirect: true };
export const adminApi = api.injectEndpoints({
  endpoints: builder => ({
    getAdminSession: builder.query({
      query: () => "/admin/session", extraOptions: adminOptions, providesTags: ["AdminSession"],
    }),
    loginAdmin: builder.mutation({
      query: body => ({ url: "/admin/login", method: "POST", body }), extraOptions: adminOptions,
      invalidatesTags: (result, error) => error ? [] : ["AdminSession"],
    }),
    logoutAdmin: builder.mutation({
      query: () => ({ url: "/admin/logout", method: "POST" }), extraOptions: adminOptions,
      invalidatesTags: ["AdminSession"],
    }),
    getAdminDashboard: builder.query({
      query: () => "/admin/dashboard", extraOptions: adminOptions, providesTags: ["AdminData"],
    }),
    getAdminData: builder.query({
      query: ({ resource, page = 1, search = "", staff = false }) => ({ url: `/admin/${resource}`, params: { page, search, staff } }),
      extraOptions: adminOptions, providesTags: ["AdminData"],
    }),
    saveAdminData: builder.mutation({
      query: ({ resource, id, body }) => ({ url: `/admin/${resource}${id ? `/${id}` : ""}`, method: id ? "PUT" : "POST", body }),
      extraOptions: adminOptions,
      invalidatesTags: (result, error) => error ? [] : ["AdminData", "AdminSession", "Products", "Profile", "Payments"],
    }),
    deleteAdminData: builder.mutation({
      query: ({ resource, id }) => ({ url: `/admin/${resource}/${id}`, method: "DELETE" }), extraOptions: adminOptions,
      invalidatesTags: (result, error) => error ? [] : ["AdminData", "AdminSession", "Products", "Profile"],
    }),
  }),
});

export const { useGetAdminSessionQuery, useLoginAdminMutation, useLogoutAdminMutation, useGetAdminDashboardQuery,
  useGetAdminDataQuery, useSaveAdminDataMutation, useDeleteAdminDataMutation } = adminApi;
