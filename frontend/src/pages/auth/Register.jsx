import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/register/",
        {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          password_confirm: formData.password_confirm,
        }
      );

      console.log("Registration successful:", response.data);

      // Registration endpoint returns user information,
      // not JWT tokens. Login separately after registration.
      navigate("/login", {
        replace: true,
        state: {
          registrationSuccess:
            response.data?.detail ||
            "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      console.error("Registration error:", err);

      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .flatMap(([field, value]) => {
            if (Array.isArray(value)) {
              return value.map((message) => `${field}: ${message}`);
            }

            return `${field}: ${value}`;
          });

        setError(
          messages.length
            ? messages.join(" ")
            : "Registration failed."
        );
      } else {
        setError(
          err.message || "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Register as an employee.</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="last_name"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password_confirm"
            placeholder="Confirm password"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}