import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  approveLeave,
  getAllLeaves,
  rejectLeave,
} from "../../services/managerService";

import "./ManagerLeaveRequests.css";

function ManagerLeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const loadLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        ordering: "-created_at",
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const data = await getAllLeaves(params);

      setLeaves(data.results || []);
      setTotalCount(data.count || 0);
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleApprove = async (leave) => {
    const comment = window.prompt(
      "Manager comment (optional):",
      ""
    );

    if (comment === null) {
      return;
    }

    try {
      setActionLoading(leave.id);
      setError("");

      await approveLeave(leave.id, comment.trim());

      await loadLeaves();
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to approve this leave request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leave) => {
    const comment = window.prompt(
      "Enter rejection reason:",
      ""
    );

    if (comment === null) {
      return;
    }

    if (!comment.trim()) {
      setError(
        "A manager comment is required when rejecting a leave request."
      );
      return;
    }

    try {
      setActionLoading(leave.id);
      setError("");

      await rejectLeave(leave.id, comment.trim());

      await loadLeaves();
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to reject this leave request."
      );
    } finally {
      setActionLoading(null);
    }
  };

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
        return "status-badge status-approved";

      case "REJECTED":
        return "status-badge status-rejected";

      case "CANCELLED":
        return "status-badge status-cancelled";

      default:
        return "status-badge status-pending";
    }
  };

  return (
    <div className="manager-requests-page">
      <div className="manager-requests-container">

        <div className="manager-requests-header">
          <div>
            <Link
              to="/manager/dashboard"
              className="back-link"
            >
              Back to Dashboard
            </Link>

            <h1>Leave Requests</h1>

            <p>
              Review and manage employee leave requests.
            </p>
          </div>
        </div>

        <div className="manager-filters">

          <form
            className="search-form"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
            />

            <button type="submit">
              Search
            </button>
          </form>

          <div className="status-filter">
            <label htmlFor="status-filter">
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

        </div>

        {error && (
          <div className="manager-request-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="manager-request-state">
            Loading leave requests...
          </div>
        ) : leaves.length === 0 ? (
          <div className="manager-request-state">
            <h2>No requests found</h2>

            <p>
              No leave requests match the selected filters.
            </p>
          </div>
        ) : (
          <div className="manager-table-wrapper">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>End</th>
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
                      <strong>
                        {leave.employee_name}
                      </strong>
                    </td>

                    <td>{leave.leave_type}</td>

                    <td>
                      {formatDate(leave.start_date)}
                    </td>

                    <td>
                      {formatDate(leave.end_date)}
                    </td>

                    <td>{leave.total_days}</td>

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

                    <td className="comment-cell">
                      {leave.manager_comment || "-"}
                    </td>

                    <td>
                      {leave.status === "PENDING" ? (
                        <div className="action-buttons">

                          <button
                            type="button"
                            className="approve-button"
                            disabled={
                              actionLoading === leave.id
                            }
                            onClick={() =>
                              handleApprove(leave)
                            }
                          >
                            {actionLoading === leave.id
                              ? "..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            className="reject-button"
                            disabled={
                              actionLoading === leave.id
                            }
                            onClick={() =>
                              handleReject(leave)
                            }
                          >
                            Reject
                          </button>

                        </div>
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

        {!loading && totalCount > 0 && (
          <div className="pagination-bar">

            <button
              type="button"
              disabled={page === 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {page}
            </span>

            <button
              type="button"
              disabled={leaves.length < 10}
              onClick={() =>
                setPage((current) => current + 1)
              }
            >
              Next
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default ManagerLeaveRequests;