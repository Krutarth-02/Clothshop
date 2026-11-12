import { api } from "../api/api";

export const couponApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWelcomeCoupon: builder.query({
      query: () => "/coupons/welcome",
      providesTags: ["WelcomeCoupon"],
    }),
    dismissWelcomeCoupon: builder.mutation({
      query: () => ({ url: "/coupons/welcome/dismiss", method: "POST" }),
      invalidatesTags: (result, error) => error ? [] : ["WelcomeCoupon"],
    }),
  }),
});
export const { useGetWelcomeCouponQuery, useDismissWelcomeCouponMutation } = couponApi;
