import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

import "./AuthPages.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] =
    useState("");
  const [error, setError] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/password-reset/",
        { email }
      );

      setMessage(
        response.data.detail
      );
    } catch (errorResponse) {
      setError(
        errorResponse.response?.data?.detail ||
          "Unable to process request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot password?</h2>

          <p>
            Enter your email and we'll
            send instructions to reset
            your password.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              required
            />
          </div>

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send reset link"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;