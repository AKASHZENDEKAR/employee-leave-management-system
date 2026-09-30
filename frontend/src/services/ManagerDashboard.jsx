import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getManagerDashboard } from "../../services/managerService";
import "./ManagerDashboard.css";

function ManagerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="manager-dashboard-page">
        <div className="manager-dashboard-state">
          Loading manager dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manager-dashboard-page">
        <div className="manager-dashboard-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard-page">
      <div className="manager-dashboard-container">

        {/* Header */}
        <div className="manager-dashboard-header">
          <div>
            <h1>Manager Dashboard</h1>

            <p>
              Monitor employee leave requests and approvals.
            </p>
          </div>

          <Link
            to="/manager/leave-requests"
            className="manager-primary-button"
          >
            View Leave Requests
          </Link>
        </div>

        {/* Statistics */}
        <div className="manager-stat-grid">

          <div className="manager-stat-card">
            <span>Pending Requests</span>

            <strong>
              {dashboard.pending_requests}
            </strong>

            <small>
              Waiting for review
            </small>
          </div>

          <div className="manager-stat-card">
            <span>Approved Today</span>

            <strong>
              {dashboard.approved_today}
            </strong>

            <small>
              Approved today
            </small>
          </div>

          <div className="manager-stat-card">
            <span>Total Employees</span>

            <strong>
              {dashboard.total_employees}
            </strong>

            <small>
              Active employees
            </small>
          </div>

        </div>

        {/* Management section */}
        <div className="manager-management-card">
          <div>
            <h2>Leave Request Management</h2>

            <p>
              Review pending requests, approve or reject
              leave applications, and add manager comments.
            </p>
          </div>

          <Link
            to="/manager/leave-requests"
            className="manager-secondary-button"
          >
            Open Requests
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ManagerDashboard;