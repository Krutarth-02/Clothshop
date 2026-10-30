import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../components/common/Loader";
import { useGetProfileQuery } from "../redux/auth/authApi";

export default function PublicRoute() {
  const signedIn = Boolean(localStorage.getItem("userId"));
  const { data, isLoading } = useGetProfileQuery(undefined, {
    skip: !signedIn,
  });
  if (signedIn && isLoading)
    return (
      <LoadingState minHeight="100dvh" label="Checking account" />
    );
  if (signedIn && data?.data)
    return (
      <Navigate to="/home" replace />
    );
  return <Outlet />;
}
