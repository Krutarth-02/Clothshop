import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const user = localStorage.getItem("userId");

  return user ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;