import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ApplyLeave from "./pages/employee/ApplyLeave";
import LeaveHistory from "./pages/employee/LeaveHistory";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerLeaveRequests from "./pages/manager/ManagerLeaveRequests";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Employee routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/apply-leave"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <ApplyLeave />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/leave-history"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <LeaveHistory />
          </ProtectedRoute>
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute role="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/leave-requests"
        element={
          <ProtectedRoute role="MANAGER">
            <ManagerLeaveRequests />
          </ProtectedRoute>
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;