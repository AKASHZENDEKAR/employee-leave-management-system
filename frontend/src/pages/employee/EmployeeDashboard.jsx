import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getEmployeeDashboard,
  getLeaves,
} from "../../services/leaveService";

import LogoutButton from "../../components/LogoutButton";

import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);

  const [loading, setLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(true);

  const [error, setError] = useState("");
  const [leavesError, setLeavesError] = useState("");

  // ==========================================================
  // Load employee dashboard
  // ==========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeDashboard();

        setDashboard(data);
      } catch (errorResponse) {
        setError(
          errorResponse.response?.data?.detail ||
            "Unable to load employee dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ==========================================================
  // Load recent leave requests
  // ==========================================================

  useEffect(() => {
    const loadRecentLeaves = async () => {
      try {
        setLeavesLoading(true);
        setLeavesError("");

        const data = await getLeaves({
          page: 1,
          ordering: "-created_at",
        });

        setRecentLeaves(
          (data.results || []).slice(0, 5)
        );
      } catch (errorResponse) {
        setLeavesError(
          errorResponse.response?.data?.detail ||
            "Unable to load recent leave requests."
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
        return "employee-status approved";

      case "REJECTED":
        return "employee-status rejected";

      case "CANCELLED":
        return "employee-status cancelled";

      default:
        return "employee-status pending";
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

  // ==========================================================
  // Employee information
  // ==========================================================
  //
  // Use the username used for login.
  // Example:
  // username = "vikas"
  // Dashboard = "Good evening, vikas."
  //
  // ==========================================================

  const employeeName =
    user?.username || "Employee";

  const employeeFullName =
    user?.username || "Employee";

  const employeeInitial = (
    user?.username?.[0] || "E"
  ).toUpperCase();

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="employee-loading">
          <div className="employee-loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // Error
  // ==========================================================

  if (error) {
    return (
      <div className="employee-dashboard">
        <div className="employee-error">
          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <Link
            to="/login"
            className="employee-error-button"
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
    <div className="employee-dashboard">

      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="employee-topbar">

        <div className="employee-brand">

          <div className="employee-brand-logo">
            LF
          </div>

          <div>
            <h2>LeaveFlow</h2>

            <span>
              Leave Management
            </span>
          </div>

        </div>

        <div className="employee-profile">

          <div className="employee-avatar">
            {employeeInitial}
          </div>

          <div className="employee-profile-info">

            <strong>
              {employeeFullName}
            </strong>

            <span>
              Employee
            </span>

          </div>

          <LogoutButton />

        </div>

      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="employee-main">

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="employee-hero">

          <div>

            <span className="employee-eyebrow">
              EMPLOYEE OVERVIEW
            </span>

            <h1>
              {getGreeting()}, {employeeName}.
            </h1>

            <p>
              Manage your leave balance, submit requests,
              and track your leave activity.
            </p>

          </div>

          <Link
            to="/employee/apply-leave"
            className="employee-main-action"
          >
            Apply Leave

            <span>
              →
            </span>

          </Link>

        </section>

        {/* ===================================================
            STAT CARDS
            =================================================== */}

        <section className="employee-stat-grid">

          {/* Remaining Leave */}

          <article className="employee-stat-card remaining-card">

            <div className="employee-stat-icon">
              ◷
            </div>

            <div className="employee-stat-content">

              <span>
                Remaining Leave
              </span>

              <strong>
                {dashboard.remaining_annual_leave_days}
              </strong>

              <small>
                Annual leave days
              </small>

            </div>

          </article>

          {/* Used Leave */}

          <article className="employee-stat-card used-card">

            <div className="employee-stat-icon">
              ↗
            </div>

            <div className="employee-stat-content">

              <span>
                Used Leave
              </span>

              <strong>
                {dashboard.used_annual_leave_days}
              </strong>

              <small>
                Annual leave days
              </small>

            </div>

          </article>

          {/* Approved */}

          <article className="employee-stat-card approved-card">

            <div className="employee-stat-icon">
              ✓
            </div>

            <div className="employee-stat-content">

              <span>
                Approved
              </span>

              <strong>
                {dashboard.approved_leave_requests}
              </strong>

              <small>
                Leave requests
              </small>

            </div>

          </article>

          {/* Pending */}

          <article className="employee-stat-card pending-card">

            <div className="employee-stat-icon">
              ⏳
            </div>

            <div className="employee-stat-content">

              <span>
                Pending
              </span>

              <strong>
                {dashboard.pending_leave_requests}
              </strong>

              <small>
                Waiting for approval
              </small>

            </div>

          </article>

        </section>

        {/* ===================================================
            CONTENT
            =================================================== */}

        <section className="employee-content-grid">

          {/* =================================================
              RECENT LEAVES
              ================================================= */}

          <div className="employee-panel">

            <div className="employee-panel-header">

              <div>

                <h2>
                  Recent Leave Requests
                </h2>

                <p>
                  Your latest leave activity.
                </p>

              </div>

              <Link
                to="/employee/leave-history"
                className="employee-panel-link"
              >
                View all
              </Link>

            </div>

            {/* Loading */}

            {leavesLoading ? (

              <div className="employee-panel-state">

                <div className="small-loader"></div>

                Loading requests...

              </div>

            ) : leavesError ? (

              /* Error */

              <div className="employee-panel-state error">

                {leavesError}

              </div>

            ) : recentLeaves.length === 0 ? (

              /* Empty */

              <div className="employee-panel-state">

                <strong>
                  No leave requests yet
                </strong>

                <span>
                  Your leave applications will appear here.
                </span>

                <Link
                  to="/employee/apply-leave"
                  className="employee-empty-action"
                >
                  Apply for Leave
                </Link>

              </div>

            ) : (

              /* Table */

              <div className="employee-table-wrapper">

                <table className="employee-table">

                  <thead>

                    <tr>

                      <th>
                        Leave Type
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

                          <strong>
                            {leave.leave_type}
                          </strong>

                        </td>

                        <td>

                          <div className="employee-dates">

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

          <aside className="employee-panel employee-actions-panel">

            <div className="employee-panel-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage your leave easily.
                </p>

              </div>

            </div>

            <div className="employee-action-list">

              {/* Apply Leave */}

              <Link
                to="/employee/apply-leave"
                className="employee-action-item"
              >

                <div className="employee-action-icon">
                  +
                </div>

                <div>

                  <strong>
                    Apply for Leave
                  </strong>

                  <span>
                    Submit a new leave request
                  </span>

                </div>

                <span className="employee-action-arrow">
                  →
                </span>

              </Link>

              {/* Leave History */}

              <Link
                to="/employee/leave-history"
                className="employee-action-item"
              >

                <div className="employee-action-icon">
                  ≡
                </div>

                <div>

                  <strong>
                    Leave History
                  </strong>

                  <span>
                    View and manage your requests
                  </span>

                </div>

                <span className="employee-action-arrow">
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

export default EmployeeDashboard;
