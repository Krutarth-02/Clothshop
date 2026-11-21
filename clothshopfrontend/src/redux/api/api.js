import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./baseQueryWithAuth";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Profile", "Products", "Notifications", "Payments"],
  endpoints: () => ({}),
});

export const getCacheSession = (getState) => {
  const profile = api.endpoints.getProfile?.select()(getState());
  return profile?.isError ? "" : String(profile?.data?.data?._id || "");
};
