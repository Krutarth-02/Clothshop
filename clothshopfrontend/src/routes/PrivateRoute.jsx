import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const user = localStorage.getItem("userId");

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;