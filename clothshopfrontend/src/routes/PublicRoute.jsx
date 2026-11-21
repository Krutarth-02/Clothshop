import { getSessionUserId } from "../redux/api/baseQueryWithAuth";
import { Navigate, Outlet } from "react-router-dom";
import LoadingState from "../components/common/Loader";
import { useGetProfileQuery } from "../redux/auth/authApi";

const PublicRoute = () => {
  const signedIn = Boolean(getSessionUserId());
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
};

export default PublicRoute;
