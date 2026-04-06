import { useEffect, useState } from "react";
import "../styles/Toaster.css";

export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handler = (event) => {
      const id = Date.now() + Math.random();
      const payload = event.detail || {};
      const next = {
        id,
        message: payload.message || "Done",
        type: payload.type || "success"
      };
      setItems((prev) => [...prev, next]);

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 2600);
    };

    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div key={item.id} className={`toast-item ${item.type}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}
