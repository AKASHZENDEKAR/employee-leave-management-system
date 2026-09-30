import { useAuth } from "../context/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}

export default LogoutButton;