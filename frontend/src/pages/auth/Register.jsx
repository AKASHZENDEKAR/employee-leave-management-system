import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import api from "../../services/api";

import "./AuthPages.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      form.password !==
      form.password_confirm
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/register/",
        form
      );

      navigate("/login", {
        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch (errorResponse) {
      const data =
        errorResponse.response?.data;

      if (data) {
        const firstError =
          Object.values(data)
            .flat()
            .find(Boolean);

        setError(
          firstError ||
            "Registration failed."
        );
      } else {
        setError(
          "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create account</h2>
          <p>
            Register as an employee.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-row">
            <div className="form-field">
              <label>First name</label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Last name</label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Confirm password</label>
            <input
              name="password_confirm"
              type="password"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;