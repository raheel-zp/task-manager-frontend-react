import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) {
    return <div className="text-center mt-10">Checking session...</div>;
  }

  if (!token) return <Navigate to="/login" />;
  return children;
}
