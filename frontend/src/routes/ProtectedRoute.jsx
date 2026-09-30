import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  role,
}) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    user.role !== role
  ) {
    const redirectPath =
      user.role === "MANAGER"
        ? "/manager/dashboard"
        : "/employee/dashboard";

    return (
      <Navigate
        to={redirectPath}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;