import { api } from "../api/api";

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
} = notificationApi;
