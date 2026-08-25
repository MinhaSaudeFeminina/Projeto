import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAdminRole, isAdminAuthenticated } from "@/state/adminAuthStore";

type AdminRoutesProps = {
  requiredRole?: string;
  requiredRoles?: string[];
};

export function AdminRoutes({ requiredRole, requiredRoles }: AdminRoutesProps) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole && !hasAdminRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !requiredRoles.some((role) => hasAdminRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
