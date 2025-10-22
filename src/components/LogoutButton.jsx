import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    toast.success("You’ve been logged out");
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 left-4 px-4 py-4 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Logout
    </button>
  );
}
