import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// This component does not fetch data directly from the mockserver.
// It relies on currentUser from context, which is set after login/signup (those use the mockserver).

export default function ProtectedRoute({ children, role }) {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && !Array.isArray(role) && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (role && Array.isArray(role) && !role.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
