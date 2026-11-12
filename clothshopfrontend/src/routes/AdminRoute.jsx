import { Navigate, Outlet } from "react-router-dom";
import { Center } from "@mantine/core";
import { useGetAdminSessionQuery } from "../redux/admin/adminApi";
import LoadingState from "../components/common/Loader";
import ErrorAlert from "../components/common/ErrorAlert";

export default function AdminRoute() {
  const { data, isLoading, error, refetch } = useGetAdminSessionQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: 30000 });
  if (isLoading) return <LoadingState label="Checking admin access" />;
  if (error?.status === 401 || error?.status === 403 || !error && !data?.data) return <Navigate to="/admin/login" replace />;
  if (error) return <Center mih="80vh"><ErrorAlert title="Admin workspace unavailable" message={error?.data?.message || "Please retry."} onRetry={refetch} /></Center>;
  return <Outlet context={{ admin: data.data }} />;
}
