import { api } from "../api/api";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: (result, error) => (error ? [] : ["Notifications"]),
    }),
    dismissNotification: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error) => (error ? [] : ["Notifications"]),
    }),
    clearNotifications: builder.mutation({
      query: () => ({ url: "/notifications", method: "DELETE" }),
      invalidatesTags: (result, error) => (error ? [] : ["Notifications"]),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDismissNotificationMutation,
  useClearNotificationsMutation,
} = notificationApi;
