import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import toast from "react-hot-toast";

export function readStorage(key, fallback = null) {
  try { return globalThis.localStorage?.getItem(key) ?? fallback; }
  catch { return fallback; }
}
export function writeStorage(key, value) {
  try { if (!globalThis.localStorage) return false; globalThis.localStorage.setItem(key, String(value)); return true; }
  catch { return false; }
}
export function removeStorage(key) {
  try { if (!globalThis.localStorage) return false; globalThis.localStorage.removeItem(key); return true; }
  catch { return false; }
}
export const getSessionUserId = () => readStorage("userId");
export const clearSessionHints = () => {
  for (const key of ["userId", "role"]) removeStorage(key);
};
export function storeSessionHints(user) {
  if (!user?._id || typeof user.role !== "string") throw new Error("The server returned an invalid account.");
  writeStorage("userId", user._id);
  writeStorage("role", user.role);
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3001/api",
  credentials: "include",
  timeout: 30000,
});
const authFormEndpoints = new Set(["login", "register", "forgotPassword", "verifyOtp", "resetPassword"]);
let rateLimitToastShown = false;
let redirectPending = false;

export const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (api.signal.aborted) return result;
  const error = result.error;
  if (error?.status === 429 && !rateLimitToastShown) {
    toast.error(error.data?.message || "Too many requests. Please try again shortly.");
    rateLimitToastShown = true;
    setTimeout(() => { rateLimitToastShown = false; }, 3000);
  }
  if (error?.status === 401 && !extraOptions?.skipAuthRedirect &&
      !authFormEndpoints.has(api.endpoint) && !redirectPending && typeof window !== "undefined") {
    const signedIn = Boolean(getSessionUserId());
    clearSessionHints();
    if (signedIn) {
      redirectPending = true;
      setTimeout(() => window.location.assign("/login"), 1000);
    }
  }
  return result;
};
