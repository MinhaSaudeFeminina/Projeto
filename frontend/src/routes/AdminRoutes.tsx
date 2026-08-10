import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAdminRole, isAdminAuthenticated } from "@/state/adminAuthStore";

type AdminRoutesProps = {
  requiredRole?: string;
};

export function AdminRoutes({ requiredRole }: AdminRoutesProps) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && !hasAdminRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
