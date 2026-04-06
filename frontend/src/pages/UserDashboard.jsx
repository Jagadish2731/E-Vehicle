import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { showToast } from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const [locationMeta, setLocationMeta] = useState({ states: [], districtsByState: {} });
  const [loc, setLoc] = useState({ state: "", district: "", city: "", area: "" });
  const [bunks, setBunks] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedBunk, setSelectedBunk] = useState("");
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bunkSearch, setBunkSearch] = useState("");
  const [bunkSort, setBunkSort] = useState("name");
  const [confirmCancel, setConfirmCancel] = useState(null);

  const districtOptions = useMemo(
    () => (loc.state ? locationMeta.districtsByState[loc.state] || [] : []),
    [loc.state, locationMeta.districtsByState]
  );

  const searchByLocation = async () => {
    try {
      setError("");
      const params = new URLSearchParams();
      if (loc.state) params.append("state", loc.state);
      if (loc.district) params.append("district", loc.district);
      if (loc.city.trim()) params.append("city", loc.city.trim());
      if (loc.area.trim()) params.append("area", loc.area.trim());
      if (!params.toString()) {
        setError("Choose state, district, or enter city / area.");
        return;
      }
      const response = await api.get(`/bunks/search?${params.toString()}`);
      setBunks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to search bunks");
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
      const hay = `${b.name} ${b.address} ${b.mobile} ${b.state || ""} ${b.district || ""} ${b.city || ""} ${b.area || ""}`.toLowerCase();
      return hay.includes(q);
    });
    const copy = [...list];
    if (bunkSort === "name") copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (bunkSort === "city") copy.sort((a, b) => (a.city || "").localeCompare(b.city || ""));
    return copy;
  }, [bunks, bunkSearch, bunkSort]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadBookings();
        const { data } = await api.get("/bunks/location-meta");
        setLocationMeta({ states: data.states || [], districtsByState: data.districtsByState || {} });
      } catch {
        setLocationMeta({ states: [], districtsByState: {} });
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
        <h3 className="section-heading">Find EV Bunks by Location</h3>
        <p className="user-location-hint">
          Select state and district (India), then optionally narrow by city or area. Click Search.
        </p>
        <div className="user-location-grid">
          <select
            value={loc.state}
            onChange={(e) => setLoc({ ...loc, state: e.target.value, district: "" })}
          >
            <option value="">State / UT</option>
            {locationMeta.states.map((s) => (
              <option value={s} key={s}>{s}</option>
            ))}
          </select>
          <select
            value={loc.district}
            disabled={!loc.state}
            onChange={(e) => setLoc({ ...loc, district: e.target.value })}
          >
            <option value="">District</option>
            {districtOptions.map((d) => (
              <option value={d} key={d}>{d}</option>
            ))}
          </select>
          <input
            placeholder="City (optional)"
            value={loc.city}
            onChange={(e) => setLoc({ ...loc, city: e.target.value })}
          />
          <input
            placeholder="Area / locality (optional)"
            value={loc.area}
            onChange={(e) => setLoc({ ...loc, area: e.target.value })}
          />
          <button type="button" onClick={searchByLocation}>Search</button>
        </div>
        <div className="row user-bunk-toolbar">
          <input
            className="user-bunk-search"
            placeholder="Filter results by name, address, area..."
            value={bunkSearch}
            onChange={(e) => setBunkSearch(e.target.value)}
          />
          <select value={bunkSort} onChange={(e) => setBunkSort(e.target.value)}>
            <option value="name">Sort by name</option>
            <option value="city">Sort by city</option>
          </select>
        </div>
        <div className="grid bunk-result-grid">
          {displayBunks.map((b) => (
            <article className="card mini-card" key={b._id}>
              <h4>{b.name}</h4>
              <p>{b.address}</p>
              {(b.area || b.city || b.district || b.state) && (
                <p className="user-bunk-location">
                  {[b.area, b.city, b.district, b.state].filter(Boolean).join(" · ")}
                </p>
              )}
              <p>Mobile: {b.mobile}</p>
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
