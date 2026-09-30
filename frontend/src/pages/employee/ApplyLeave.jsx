import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createLeave } from "../../services/leaveService";
import "./ApplyLeave.css";

function ApplyLeave() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leave_type: "ANNUAL",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.leave_type) {
      newErrors.leave_type = "Please select a leave type.";
    }

    if (!form.start_date) {
      newErrors.start_date = "Start date is required.";
    } else if (form.start_date < today) {
      newErrors.start_date = "Leave cannot be applied for a past date.";
    }

    if (!form.end_date) {
      newErrors.end_date = "End date is required.";
    } else if (
      form.start_date &&
      form.end_date < form.start_date
    ) {
      newErrors.end_date =
        "End date cannot be before the start date.";
    }

    if (!form.reason.trim()) {
      newErrors.reason = "Reason is required.";
    } else if (form.reason.trim().length < 5) {
      newErrors.reason =
        "Reason must contain at least 5 characters.";
    } else if (form.reason.trim().length > 500) {
      newErrors.reason =
        "Reason cannot exceed 500 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await createLeave({
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason.trim(),
      });

      setSuccessMessage(
        "Leave request submitted successfully."
      );

      setForm({
        leave_type: "ANNUAL",
        start_date: "",
        end_date: "",
        reason: "",
      });

      setTimeout(() => {
        navigate("/employee/dashboard");
      }, 1000);
    } catch (errorResponse) {
      const responseData = errorResponse.response?.data;

      if (responseData && typeof responseData === "object") {
        const backendErrors = {};

        Object.entries(responseData).forEach(([field, message]) => {
          if (Array.isArray(message)) {
            backendErrors[field] = message.join(" ");
          } else if (typeof message === "string") {
            backendErrors[field] = message;
          }
        });

        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        } else {
          setSubmitError(
            responseData.detail ||
              "Unable to submit leave request."
          );
        }
      } else {
        setSubmitError(
          "Unable to submit leave request. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-leave-page">
      <div className="apply-leave-container">
        <div className="apply-leave-header">
          <div>
            <Link
              to="/employee/dashboard"
              className="back-link"
            >
              ← Back to Dashboard
            </Link>

            <h1>Apply for Leave</h1>

            <p>
              Submit a new leave request for manager approval.
            </p>
          </div>
        </div>

        <div className="apply-leave-card">
          <form
            className="apply-leave-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="leave_type">
                Leave Type
              </label>

              <select
                id="leave_type"
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
              >
                <option value="ANNUAL">
                  Annual Leave
                </option>

                <option value="SICK">
                  Sick Leave
                </option>

                <option value="CASUAL">
                  Casual Leave
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>

              {errors.leave_type && (
                <div className="field-error">
                  {errors.leave_type}
                </div>
              )}
            </div>

            <div className="date-row">
              <div className="form-field">
                <label htmlFor="start_date">
                  Start Date
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  min={today}
                  value={form.start_date}
                  onChange={handleChange}
                />

                {errors.start_date && (
                  <div className="field-error">
                    {errors.start_date}
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="end_date">
                  End Date
                </label>

                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  min={form.start_date || today}
                  value={form.end_date}
                  onChange={handleChange}
                />

                {errors.end_date && (
                  <div className="field-error">
                    {errors.end_date}
                  </div>
                )}
              </div>
            </div>

            <div className="form-field">
              <div className="reason-header">
                <label htmlFor="reason">
                  Reason
                </label>

                <span>
                  {form.reason.length}/500
                </span>
              </div>

              <textarea
                id="reason"
                name="reason"
                rows="6"
                maxLength="500"
                placeholder="Enter the reason for your leave..."
                value={form.reason}
                onChange={handleChange}
              />

              {errors.reason && (
                <div className="field-error">
                  {errors.reason}
                </div>
              )}
            </div>

            {submitError && (
              <div className="submit-error">
                {submitError}
              </div>
            )}

            {successMessage && (
              <div className="submit-success">
                {successMessage}
              </div>
            )}

            <div className="form-actions">
              <Link
                to="/employee/dashboard"
                className="cancel-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Leave Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyLeave;