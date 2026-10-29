import { Navigate, Outlet } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useGetProfileQuery } from "../redux/auth/authApi";

export default function PublicRoute() {
  const signedIn = Boolean(localStorage.getItem("userId"));
  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !signedIn,
  });
  if (signedIn && isLoading)
    return (
      <Center mih="100dvh">
        <Loader aria-label="Checking account" />
      </Center>
    );
  if (signedIn && data?.data)
    return (
      <Navigate to={data.data.role === "admin" ? "/admin" : "/home"} replace />
    );
  return <Outlet />;
}
