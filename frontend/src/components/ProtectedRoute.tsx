import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: ("admin" | "student")[];
}

const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const { isLoggedIn, user, loading } = useContext(LoginContext);

  if (loading) return <div>Loading...</div>;

  if (!isLoggedIn || !user?.role) {
    console.warn("User not logged in, redirecting...");
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole =
    requiredRoles.length === 0 || requiredRoles.includes(user.role);

  if (!hasRequiredRole) {
    console.warn("Unauthorized access attempt, redirecting...");
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;