import { api } from "../api/api";

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCheckoutDetails: builder.query({
      query: () => "/payments/checkout-details",
      providesTags: ["Profile", "Payments"],
    }),
    quoteCheckout: builder.mutation({
      query: (body) => ({ url: "/payments/quote", method: "POST", body }),
    }),
    createCodOrder: builder.mutation({
      query: (body) => ({ url: "/payments/orders", method: "POST", body }),
      invalidatesTags: (result, error) => error ? [] : ["Products", "Payments", "WelcomeCoupon", "Profile", "Notifications"],
    }),
  }),
});

export const { useGetCheckoutDetailsQuery, useQuoteCheckoutMutation, useCreateCodOrderMutation } = paymentApi;
