import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001/api",
  credentials: "include",
});

let rateLimitToastShown = false;
let redirectPending = false;
const authFormEndpoints = new Set([
  "login",
  "register",
  "forgotPassword",
  "verifyOtp",
  "resetPassword",
]);

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (api.signal.aborted) return result;

  const error = result.error;
  if (error?.status === 429 && !rateLimitToastShown) {
    toast.error(
      error.data?.message || "Too many requests. Please try again shortly.",
    );
    rateLimitToastShown = true;
    setTimeout(() => {
      rateLimitToastShown = false;
    }, 3000);
  }

  // Guests and unsuccessful auth forms keep their existing error handling.
  if (
    error?.status === 401 &&
    !extraOptions?.skipAuthRedirect &&
    !authFormEndpoints.has(api.endpoint) &&
    !redirectPending &&
    typeof window !== "undefined"
  ) {
    let signedIn = false;
    try {
      signedIn = Boolean(window.localStorage.getItem("userId"));
      if (signedIn) window.localStorage.removeItem("userId");
    } catch {
      // Storage can be unavailable; the caller still receives the API error.
    }
    if (signedIn) {
      redirectPending = true;
      setTimeout(() => window.location.assign("/login"), 1000);
    }
  }

  return result;
};
