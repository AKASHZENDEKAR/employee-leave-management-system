import { Navigate, Route, Routes } from "react-router-dom";

// ============================================================
// Authentication pages
// ============================================================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// ============================================================
// Employee pages
// ============================================================
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import ApplyLeave from "./pages/employee/ApplyLeave";
import LeaveHistory from "./pages/employee/LeaveHistory";

// ============================================================
// Manager pages
// ============================================================
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerLeaveRequests from "./pages/manager/ManagerLeaveRequests";

// ============================================================
// Route protection
// ============================================================
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <Routes>

      {/* ======================================================
          ROOT
          ====================================================== */}
      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ======================================================
          PUBLIC AUTHENTICATION ROUTES
          ====================================================== */}

      {/* Login */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Register */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />


      {/* ======================================================
          EMPLOYEE PROTECTED ROUTES
          ====================================================== */}

      {/* Employee Dashboard */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Apply Leave */}
      <Route
        path="/employee/apply-leave"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <ApplyLeave />
          </ProtectedRoute>
        }
      />

      {/* Leave History */}
      <Route
        path="/employee/leave-history"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <LeaveHistory />
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          MANAGER PROTECTED ROUTES
          ====================================================== */}

      {/* Manager Dashboard */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute role="MANAGER">
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Manager Leave Requests */}
      <Route
        path="/manager/leave-requests"
        element={
          <ProtectedRoute role="MANAGER">
            <ManagerLeaveRequests />
          </ProtectedRoute>
        }
      />


      {/* ======================================================
          FALLBACK / UNKNOWN ROUTES
          ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;