import { api } from "../api/api";

const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (body) => ({ url: "/contact", method: "POST", body }),
      extraOptions: { skipAuthRedirect: true },
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;
