import { useEffect, useState } from "react";
import api from "../api/client";
import "../styles/HomePage.css";

export default function HomePage() {
  const [bunks, setBunks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/bunks");
        setBunks(response.data);
      } catch (err) {
        setError("Login to view bunk list and slot availability.");
      }
    };
    load();
  }, []);

  return (
    <main className="container home-page">
      <h2>Nearby EV Recharge Stations</h2>
      {error && <p className="error">{error}</p>}
      <div className="grid home-bunk-grid">
        {bunks.map((bunk) => (
          <article key={bunk._id} className="card bunk-card">
            <h3>{bunk.name}</h3>
            <p>{bunk.address}</p>
            <p>Mobile: {bunk.mobile}</p>
            <p>
              Slots: {bunk.slotStats?.available || 0} available / {bunk.slotStats?.total || 0} total
            </p>
            {bunk.googleMapLink && (
              <a href={bunk.googleMapLink} target="_blank" rel="noreferrer">
                Open in Google Maps
              </a>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
