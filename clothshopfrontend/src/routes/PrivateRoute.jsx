import { Navigate, Outlet } from "react-router-dom";
import { Alert, Button, Center, Loader, Stack } from "@mantine/core";
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
      <Center mih="60vh">
        <Loader aria-label="Checking account access" />
      </Center>
    );
  if (error?.status === 401 || (!error && !data?.data))
    return <Navigate to="/login" replace />;
  if (error)
    return (
      <Center mih="60vh" p="xl">
        <Stack>
          <Alert title="Unable to check account access">
            Please retry when the server is available.
          </Alert>
          <Button onClick={refetch}>Retry</Button>
        </Stack>
      </Center>
    );
  return <Outlet />;
}
