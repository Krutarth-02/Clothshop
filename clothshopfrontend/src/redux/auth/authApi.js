import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000/api", // backend URL
    credentials: "include", // for cookies 
  }),

  endpoints: (builder) => ({
    // 🔐 Register
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // 🔐 Login
    login: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
      }),
    }),

    // 👤 Get Profile (Protected Route)
    getProfile: builder.query({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
    }),

    // ✅ Forgot Password
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: "/user/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Verify OTP
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/user/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Reset Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/user/reset-password",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks
export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApi;