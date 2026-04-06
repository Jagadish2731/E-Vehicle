import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { showToast } from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const [coords, setCoords] = useState({ lat: "", lng: "", radiusKm: 10 });
  const [bunks, setBunks] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedBunk, setSelectedBunk] = useState("");
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bunkSearch, setBunkSearch] = useState("");
  const [bunkSort, setBunkSort] = useState("distance");
  const [confirmCancel, setConfirmCancel] = useState(null);

  const searchNearby = async () => {
    try {
      setError("");
      const response = await api.get(`/bunks/nearby?lat=${coords.lat}&lng=${coords.lng}&radiusKm=${coords.radiusKm}`);
      setBunks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search nearby bunks");
    }
  };

  const loadSlots = async (bunkId) => {
    try {
      setError("");
      setSelectedBunk(bunkId);
      const response = await api.get(`/slots/bunk/${bunkId}`);
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch slots");
    }
  };

  const loadBookings = async () => {
    const response = await api.get("/bookings/mine");
    setBookings(response.data);
  };

  const bookSlot = async (slotId) => {
    try {
      setError("");
      await api.post("/bookings", { bunk: selectedBunk, slot: slotId });
      setMessage("Slot booked successfully");
      showToast("Slot booked successfully", "success");
      loadSlots(selectedBunk);
      loadBookings();
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setError("");
      await api.patch(`/bookings/${bookingId}/cancel`);
      setMessage("Booking cancelled");
      showToast("Booking cancelled", "success");
      loadBookings();
      if (selectedBunk) {
        loadSlots(selectedBunk);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Cancellation failed";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const displayBunks = useMemo(() => {
    const q = bunkSearch.trim().toLowerCase();
    let list = bunks.filter((b) => {
      if (!q) return true;
      const hay = `${b.name} ${b.address} ${b.mobile}`.toLowerCase();
      return hay.includes(q);
    });
    const copy = [...list];
    if (bunkSort === "distance") copy.sort((a, b) => a.distanceKm - b.distanceKm);
    if (bunkSort === "name") copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return copy;
  }, [bunks, bunkSearch, bunkSort]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadBookings();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <main className="container user-dashboard">
      <h2>User Dashboard</h2>

      <ConfirmDialog
        open={!!confirmCancel}
        title="Cancel this booking?"
        message="Your slot will be released for others to book."
        confirmText="Yes, cancel"
        danger
        onClose={() => setConfirmCancel(null)}
        onConfirm={async () => {
          if (confirmCancel) await cancelBooking(confirmCancel);
        }}
      />

      <section className="card section-card">
        <h3 className="section-heading">Search Nearby EV Bunks</h3>
        <div className="row">
          <input placeholder="Latitude" value={coords.lat} onChange={(e) => setCoords({ ...coords, lat: e.target.value })} />
          <input placeholder="Longitude" value={coords.lng} onChange={(e) => setCoords({ ...coords, lng: e.target.value })} />
          <input placeholder="Radius km" value={coords.radiusKm} onChange={(e) => setCoords({ ...coords, radiusKm: e.target.value })} />
          <button type="button" onClick={searchNearby}>Search</button>
        </div>
        <div className="row user-bunk-toolbar">
          <input
            className="user-bunk-search"
            placeholder="Filter results by name, address..."
            value={bunkSearch}
            onChange={(e) => setBunkSearch(e.target.value)}
          />
          <select value={bunkSort} onChange={(e) => setBunkSort(e.target.value)}>
            <option value="distance">Sort by distance</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
        <div className="grid bunk-result-grid">
          {displayBunks.map((b) => (
            <article className="card mini-card" key={b._id}>
              <h4>{b.name}</h4>
              <p>{b.address}</p>
              <p>Mobile: {b.mobile}</p>
              <p>Distance: {b.distanceKm.toFixed(2)} km</p>
              {b.googleMapLink && (
                <p>
                  <a href={b.googleMapLink} target="_blank" rel="noreferrer">
                    Open Google Map
                  </a>
                </p>
              )}
              <button type="button" onClick={() => loadSlots(b._id)}>View Slots</button>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <h3 className="section-heading">Slot Vacancy</h3>
        <div className="grid">
          {slots.map((s) => (
            <article className="card mini-card" key={s._id}>
              <p>Slot: {s.slotNumber}</p>
              <p>Status: {s.status}</p>
              {s.status === "available" && <button type="button" onClick={() => bookSlot(s._id)}>Book</button>}
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <h3 className="section-heading">My Bookings</h3>
        {loading ? (
          <div className="grid">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
        <div className="grid">
          {bookings.map((b) => (
            <article className="card mini-card" key={b._id}>
              <p>{b.bunk?.name} - Slot {b.slot?.slotNumber}</p>
              <p>Status: {b.status}</p>
              {!["completed", "cancelled"].includes(b.status) && (
                <button className="btn-danger" type="button" onClick={() => setConfirmCancel(b._id)}>Cancel Booking</button>
              )}
            </article>
          ))}
        </div>
        )}
      </section>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
