import "./AuthLayout.css";

function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            LF
          </div>

          <h1>LeaveFlow</h1>

          <p className="brand-description">
            Employee Leave Management System
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              Easy leave requests
            </div>

            <div>
              <span>✓</span>
              Fast manager approvals
            </div>

            <div>
              <span>✓</span>
              Transparent leave tracking
            </div>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        {children}
      </section>
    </div>
  );
}

export default AuthLayout;