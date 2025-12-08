import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function PublicRoutes() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/clients" replace />;
  }

  return <Outlet />;
}
