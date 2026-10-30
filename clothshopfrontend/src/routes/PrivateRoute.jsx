import { Navigate, Outlet } from "react-router-dom";
import { Center } from "@mantine/core";
import LoadingState from "../components/common/Loader";
import ErrorAlert from "../components/common/ErrorAlert";
import { useGetProfileQuery } from "../redux/auth/authApi";

export default function PrivateRoute() {
  const signedIn = Boolean(localStorage.getItem("userId"));
  const { data, isLoading, isFetching, error, refetch } = useGetProfileQuery(
    undefined,
    {
      skip: !signedIn,
      refetchOnMountOrArgChange: true,
    },
  );
  if (!signedIn) return <Navigate to="/login" replace />;
  if (isLoading || isFetching)
    return (
      <LoadingState label="Checking account access" />
    );
  if (error?.status === 401 || (!error && !data?.data))
    return <Navigate to="/login" replace />;
  if (error)
    return (
      <Center mih="60vh" p="xl">
        <ErrorAlert color="blue" title="Unable to check account access" onRetry={refetch}
          message="Please retry when the server is available." />
      </Center>
    );
  return <Outlet />;
}
