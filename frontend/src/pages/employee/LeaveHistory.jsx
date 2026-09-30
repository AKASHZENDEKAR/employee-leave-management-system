import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelLeave,
  getLeaves,
} from "../../services/leaveService";
import "./LeaveHistory.css";

function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const loadLeaves = useCallback(async (statusFilter = "ALL") => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const data = await getLeaves(params);

      setLeaves(data.results || []);

      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
      });
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to load leave history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves(filterStatus);
  }, [loadLeaves, filterStatus]);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleCancel = async (leaveId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this pending leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(leaveId);
      setError("");

      await cancelLeave(leaveId);

      await loadLeaves(filterStatus);
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to cancel the leave request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  return (
    <div className="leave-history-page">
      <div className="leave-history-container">

        {/* Header */}
        <div className="leave-history-header">
          <div>
            <Link
              to="/employee/dashboard"
              className="back-link"
            >
              ← Back to Dashboard
            </Link>

            <h1>Leave History</h1>

            <p>
              View and manage your leave requests.
            </p>
          </div>

          <Link
            to="/employee/apply-leave"
            className="apply-leave-button"
          >
            Apply Leave
          </Link>
        </div>

        {/* Filter */}
        <div className="leave-history-toolbar">
          <div className="filter-group">
            <label htmlFor="status-filter">
              Filter by status
            </label>

            <select
              id="status-filter"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="request-count">
            {pagination.count} request
            {pagination.count !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="history-error">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="history-state">
            Loading leave history...
          </div>
        ) : leaves.length === 0 ? (
          <div className="history-empty">
            <h2>No leave requests found</h2>

            <p>
              You haven't submitted any leave requests
              {filterStatus !== "ALL"
                ? ` with ${filterStatus.toLowerCase()} status`
                : ""}.
            </p>

            <Link
              to="/employee/apply-leave"
              className="empty-action"
            >
              Apply for Leave
            </Link>
          </div>
        ) : (
          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Comment</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      {leave.leave_type}
                    </td>

                    <td>
                      {formatDate(leave.start_date)}
                    </td>

                    <td>
                      {formatDate(leave.end_date)}
                    </td>

                    <td>
                      {leave.total_days}
                    </td>

                    <td className="reason-cell">
                      {leave.reason}
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

                    <td className="manager-comment-cell">
                      {leave.manager_comment || "-"}
                    </td>

                    <td>
                      {leave.status === "PENDING" ? (
                        <button
                          type="button"
                          className="cancel-leave-button"
                          disabled={
                            actionLoading === leave.id
                          }
                          onClick={() =>
                            handleCancel(leave.id)
                          }
                        >
                          {actionLoading === leave.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : (
                        <span className="no-action">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination information */}
        {!loading && leaves.length > 0 && (
          <div className="pagination-info">
            Showing {leaves.length} of{" "}
            {pagination.count} request
            {pagination.count !== 1 ? "s" : ""}.
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaveHistory;