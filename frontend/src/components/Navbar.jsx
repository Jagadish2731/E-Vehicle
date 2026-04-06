import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

export default function Navbar({ theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <h1>EV Recharge Bunk</h1>
      <button className="link-btn menu-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
        {menuOpen ? "Close Menu" : "Menu"}
      </button>
      <nav className={menuOpen ? "open" : ""}>
        <button className="link-btn theme-btn" onClick={onToggleTheme}>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <Link to="/">Home</Link>
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && user.role === "user" && <Link to="/user">User Dashboard</Link>}
        {user && user.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}
        {user && (
          <button className="link-btn" onClick={logout}>
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
