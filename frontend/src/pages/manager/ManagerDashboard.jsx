import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getManagerDashboard,
  getAllLeaves,
} from "../../services/managerService";

import LogoutButton from "../../components/LogoutButton";

import "./ManagerDashboard.css";

function ManagerDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(true);

  const [error, setError] = useState("");
  const [leavesError, setLeavesError] = useState("");

  // ==========================================================
  // Manager dashboard statistics
  // ==========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getManagerDashboard();

        setDashboard(data);
      } catch (errorResponse) {
        setError(
          errorResponse.response?.data?.detail ||
            "Unable to load manager dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================================
  // Recent leave requests
  // ==========================================================

  useEffect(() => {
    const loadRecentLeaves = async () => {
      try {
        setLeavesLoading(true);
        setLeavesError("");

        const data = await getAllLeaves({
          page: 1,
          ordering: "-created_at",
        });

        setRecentLeaves(
          (data.results || []).slice(0, 5)
        );
      } catch (errorResponse) {
        setLeavesError(
          errorResponse.response?.data?.detail ||
            "Unable to load recent requests."
        );
      } finally {
        setLeavesLoading(false);
      }
    };

    loadRecentLeaves();
  }, []);

  // ==========================================================
  // Helpers
  // ==========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(
      `${dateValue}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "manager-status approved";

      case "REJECTED":
        return "manager-status rejected";

      case "CANCELLED":
        return "manager-status cancelled";

      default:
        return "manager-status pending";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const managerName =
    user?.first_name ||
    user?.username ||
    "Manager";

  const managerFullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.username || "Manager";

  const managerInitial = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    "M"
  ).toUpperCase();

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div className="manager-loading">
          <div className="dashboard-loader"></div>
          <p>Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Error
  // ==========================================================

  if (error) {
    return (
      <div className="manager-dashboard">
        <div className="manager-error">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <Link
            to="/login"
            className="manager-error-button"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Dashboard
  // ==========================================================

  return (
    <div className="manager-dashboard">

      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="manager-topbar">

        {/* Brand */}
        <div className="manager-brand">
          <div className="manager-brand-logo">
            LF
          </div>

          <div>
            <h2>LeaveFlow</h2>
            <span>Leave Management</span>
          </div>
        </div>

        {/* Profile */}
        <div className="manager-profile">

          <div className="manager-avatar">
            {managerInitial}
          </div>

          <div className="manager-profile-info">
            <strong>
              {managerFullName}
            </strong>

            <span>
              Manager
            </span>
          </div>

          <LogoutButton />

        </div>
      </header>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="manager-main">

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="manager-hero">

          <div>
            <span className="manager-eyebrow">
              MANAGEMENT OVERVIEW
            </span>

            <h1>
              {getGreeting()}, {managerName}.
            </h1>

            <p>
              Monitor leave activity, review requests,
              and keep your team moving smoothly.
            </p>
          </div>

          <Link
            to="/manager/leave-requests"
            className="manager-main-action"
          >
            View Leave Requests
            <span>→</span>
          </Link>

        </section>


        {/* ===================================================
            STATISTICS
            =================================================== */}

        <section className="manager-stat-grid">

          {/* Pending */}
          <article className="manager-stat-card pending-card">

            <div className="manager-stat-icon">
              ⏳
            </div>

            <div className="manager-stat-content">

              <span>
                Pending Requests
              </span>

              <strong>
                {dashboard.pending_requests}
              </strong>

              <small>
                Waiting for review
              </small>

            </div>

          </article>


          {/* Approved */}
          <article className="manager-stat-card approved-card">

            <div className="manager-stat-icon">
              ✓
            </div>

            <div className="manager-stat-content">

              <span>
                Approved Today
              </span>

              <strong>
                {dashboard.approved_today}
              </strong>

              <small>
                Requests approved today
              </small>

            </div>

          </article>


          {/* Employees */}
          <article className="manager-stat-card employees-card">

            <div className="manager-stat-icon">
              👥
            </div>

            <div className="manager-stat-content">

              <span>
                Total Employees
              </span>

              <strong>
                {dashboard.total_employees}
              </strong>

              <small>
                Active employees
              </small>

            </div>

          </article>

        </section>


        {/* ===================================================
            CONTENT GRID
            =================================================== */}

        <section className="manager-content-grid">

          {/* =================================================
              RECENT REQUESTS
              ================================================= */}

          <div className="manager-panel manager-recent-panel">

            <div className="manager-panel-header">

              <div>
                <h2>
                  Recent Leave Requests
                </h2>

                <p>
                  Latest activity from your employees.
                </p>
              </div>

              <Link
                to="/manager/leave-requests"
                className="manager-panel-link"
              >
                View all
              </Link>

            </div>


            {leavesLoading ? (

              <div className="manager-panel-state">
                <div className="small-loader"></div>
                Loading recent requests...
              </div>

            ) : leavesError ? (

              <div className="manager-panel-state error">
                {leavesError}
              </div>

            ) : recentLeaves.length === 0 ? (

              <div className="manager-panel-state">

                <strong>
                  No leave requests yet
                </strong>

                <span>
                  Employee requests will appear here.
                </span>

              </div>

            ) : (

              <div className="manager-recent-table-wrapper">

                <table className="manager-recent-table">

                  <thead>
                    <tr>
                      <th>
                        Employee
                      </th>

                      <th>
                        Dates
                      </th>

                      <th>
                        Days
                      </th>

                      <th>
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {recentLeaves.map((leave) => (

                      <tr key={leave.id}>

                        <td>

                          <div className="employee-cell">

                            <div className="employee-mini-avatar">
                              {(
                                leave.employee_name?.[0] ||
                                "E"
                              ).toUpperCase()}
                            </div>

                            <div>

                              <strong>
                                {leave.employee_name}
                              </strong>

                              <span>
                                {leave.leave_type}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="dates-cell">

                            <strong>
                              {formatDate(
                                leave.start_date
                              )}
                            </strong>

                            <span>
                              to{" "}
                              {formatDate(
                                leave.end_date
                              )}
                            </span>

                          </div>

                        </td>


                        <td>
                          {leave.total_days}{" "}
                          {leave.total_days === 1
                            ? "day"
                            : "days"}
                        </td>


                        <td>

                          <span
                            className={getStatusClass(
                              leave.status
                            )}
                          >
                            {leave.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>


          {/* =================================================
              QUICK ACTIONS
              ================================================= */}

          <aside className="manager-panel manager-actions-panel">

            <div className="manager-panel-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common manager tasks.
                </p>

              </div>

            </div>


            <div className="manager-action-list">

              <Link
                to="/manager/leave-requests"
                className="manager-action-item"
              >

                <div className="manager-action-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Review Requests
                  </strong>

                  <span>
                    Approve or reject pending leave
                  </span>

                </div>

                <span className="manager-action-arrow">
                  →
                </span>

              </Link>


              <Link
                to="/manager/leave-requests"
                className="manager-action-item"
              >

                <div className="manager-action-icon">
                  ⌕
                </div>

                <div>

                  <strong>
                    Search Requests
                  </strong>

                  <span>
                    Find requests by employee
                  </span>

                </div>

                <span className="manager-action-arrow">
                  →
                </span>

              </Link>

            </div>

          </aside>

        </section>

      </main>
    </div>
  );
}

export default ManagerDashboard;