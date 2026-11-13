import { api } from "../api/api";
import { handleCreateCodOrder } from "./payment.dispacher";

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
      async onQueryStarted(arg, toolkitApi) {
        await handleCreateCodOrder(arg, toolkitApi);
      },
    }),
  }),
});

export const { useGetCheckoutDetailsQuery, useQuoteCheckoutMutation, useCreateCodOrderMutation } = paymentApi;
