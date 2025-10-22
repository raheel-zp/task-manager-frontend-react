import { useState, useEffect } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return false;
      return decoded.exp * 1000 < Date.now();
    } catch (err) {
      console.error("Invalid token:", err);
      return true;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setToken(res.data.token);
      toast.success("Logged in successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      setToken(res.data.token);
      toast.success("Registration successful!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed";
      toast.error(errorMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, token, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
