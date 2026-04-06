import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", form);
      login(response.data);
      showToast("Login successful", "success");
      navigate(response.data.user.role === "admin" ? "/admin" : "/user");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <main className="container small login-page auth-page">
      <h2>Login</h2>
      <form className="form auth-form" onSubmit={handleSubmit}>
        <input placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </main>
  );
}
