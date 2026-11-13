import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./baseQueryWithAuth";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Profile", "Products", "Notifications", "Payments"],
  endpoints: () => ({}),
});

export function getCacheSession(getState) {
  for (const endpoint of ["getProfile"]) {
    const user = api.endpoints[endpoint]?.select()(getState())?.data?.data;
    if (user) return String(user._id);
  }
  return "";
}
