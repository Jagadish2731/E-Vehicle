import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client";
import { showToast } from "../utils/toast";
import ConfirmDialog from "../components/ConfirmDialog";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [bunkForm, setBunkForm] = useState({
    name: "",
    address: "",
    mobile: "",
    googleMapLink: "",
    state: "",
    district: "",
    city: "",
    area: "",
    lat: "",
    lng: "",
    totalSlots: 0
  });
  const [locationMeta, setLocationMeta] = useState({ states: [], districtsByState: {} });
  const [slotForm, setSlotForm] = useState({ bunk: "", slotNumber: "", status: "available" });
  const [editingBunkId, setEditingBunkId] = useState("");
  const [selectedBunkSlots, setSelectedBunkSlots] = useState([]);
  const [bunks, setBunks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState({ total: 0, booked: 0, charging: 0, completed: 0, cancelled: 0 });
  const [bookingFilter, setBookingFilter] = useState({ status: "", from: "", to: "" });
  const [slotSearch, setSlotSearch] = useState("");
  const [slotPage, setSlotPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bunkSearch, setBunkSearch] = useState("");
  const [bunkSort, setBunkSort] = useState("name-asc");
  const [bookingSearchInput, setBookingSearchInput] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingSortBy, setBookingSortBy] = useState("createdAt");
  const [bookingSortOrder, setBookingSortOrder] = useState("desc");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingUpdatingId, setBookingUpdatingId] = useState("");
  const [confirm, setConfirm] = useState(null);
  const lastBookingFetchErrorRef = useRef("");
  const slotsPerPage = 6;
  const bookingsPerPage = 8;
  const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

  const loadBunks = async () => {
    const response = await api.get("/bunks");
    setBunks(response.data);
  };

  const fetchBookings = useCallback(
    async (page, filterOverride) => {
      const f = filterOverride ?? bookingFilter;
      setBookingsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(bookingsPerPage));
        params.append("sortBy", bookingSortBy);
        params.append("sortOrder", bookingSortOrder);
        if (f.status) params.append("status", f.status);
        if (f.from) params.append("from", f.from);
        if (f.to) params.append("to", f.to);
        if (bookingSearch.trim()) params.append("q", bookingSearch.trim());
        const response = await api.get(`/bookings?${params.toString()}`);
        setBookings(response.data.items);
        setBookingsTotal(response.data.total);
      } finally {
        setBookingsLoading(false);
      }
    },
    [bookingFilter, bookingSearch, bookingSortBy, bookingSortOrder, bookingsPerPage]
  );

  const loadReport = async () => {
    const response = await api.get("/bookings/report/summary");
    setReport(response.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadBunks(), loadReport()]);
        try {
          const metaRes = await api.get("/bunks/location-meta");
          setLocationMeta({
            states: metaRes.data.states || [],
            districtsByState: metaRes.data.districtsByState || {}
          });
        } catch {
          setLocationMeta({ states: [], districtsByState: {} });
        }
      } catch (error) {
        showToast(getErrorMessage(error, "Failed to load admin dashboard data"), "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setBookingSearch(bookingSearchInput);
      setBookingsPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [bookingSearchInput]);

  useEffect(() => {
    if (loading) return;
    const run = async () => {
      try {
        await fetchBookings(bookingsPage);
        lastBookingFetchErrorRef.current = "";
      } catch (error) {
        const msg = getErrorMessage(error, "Failed to load bookings");
        if (lastBookingFetchErrorRef.current !== msg) {
          showToast(msg, "error");
          lastBookingFetchErrorRef.current = msg;
        }
      }
    };
    run();
  }, [loading, bookingsPage, bookingSearch, fetchBookings]);

  const bunkDistrictOptions = useMemo(
    () => (bunkForm.state ? locationMeta.districtsByState[bunkForm.state] || [] : []),
    [bunkForm.state, locationMeta.districtsByState]
  );

  const filteredBunks = useMemo(() => {
    const q = bunkSearch.trim().toLowerCase();
    let list = bunks.filter((b) => {
      if (!q) return true;
      const hay = `${b.name} ${b.address} ${b.mobile} ${b.state || ""} ${b.district || ""} ${b.city || ""} ${b.area || ""}`.toLowerCase();
      return hay.includes(q);
    });
    const copy = [...list];
    if (bunkSort === "name-asc") copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (bunkSort === "name-desc") copy.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    if (bunkSort === "slots-desc") copy.sort((a, b) => (b.slotStats?.total || 0) - (a.slotStats?.total || 0));
    if (bunkSort === "slots-asc") copy.sort((a, b) => (a.slotStats?.total || 0) - (b.slotStats?.total || 0));
    return copy;
  }, [bunks, bunkSearch, bunkSort]);

  const createBunk = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: bunkForm.name,
        address: bunkForm.address,
        mobile: bunkForm.mobile,
        googleMapLink: bunkForm.googleMapLink,
        state: bunkForm.state || undefined,
        district: bunkForm.district || undefined,
        city: bunkForm.city || undefined,
        area: bunkForm.area || undefined,
        location: { lat: Number(bunkForm.lat), lng: Number(bunkForm.lng) },
        totalSlots: Number(bunkForm.totalSlots)
      };
      if (editingBunkId) {
        await api.put(`/bunks/${editingBunkId}`, payload);
        showToast("Bunk updated", "success");
      } else {
        await api.post("/bunks", payload);
        showToast("Bunk created", "success");
      }
      setEditingBunkId("");
      setBunkForm({
        name: "",
        address: "",
        mobile: "",
        googleMapLink: "",
        state: "",
        district: "",
        city: "",
        area: "",
        lat: "",
        lng: "",
        totalSlots: 0
      });
      loadBunks();
      loadReport();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to save bunk"), "error");
    }
  };

  const createSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post("/slots", slotForm);
      showToast("Slot created", "success");
      setSlotForm({ bunk: "", slotNumber: "", status: "available" });
      loadBunks();
      if (slotForm.bunk) {
        loadSlotsByBunk(slotForm.bunk);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to create slot"), "error");
    }
  };

  const updateBooking = async (id, status) => {
    if (bookingUpdatingId) return;
    setBookingUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      showToast(`Booking marked as ${status}`, "success");
      await fetchBookings(bookingsPage);
      loadReport();
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to update booking status"), "error");
    } finally {
      setBookingUpdatingId("");
    }
  };

  const loadSlotsByBunk = async (bunkId) => {
    const response = await api.get(`/slots/bunk/${bunkId}`);
    setSelectedBunkSlots(response.data);
    setSlotPage(1);
    setSlotSearch("");
  };

  const startEditBunk = (bunk) => {
    setEditingBunkId(bunk._id);
    setBunkForm({
      name: bunk.name,
      address: bunk.address,
      mobile: bunk.mobile,
      googleMapLink: bunk.googleMapLink || "",
      state: bunk.state || "",
      district: bunk.district || "",
      city: bunk.city || "",
      area: bunk.area || "",
      lat: bunk.location?.lat ?? "",
      lng: bunk.location?.lng ?? "",
      totalSlots: bunk.totalSlots ?? 0
    });
  };

  const deleteBunk = async (id) => {
    try {
      await api.delete(`/bunks/${id}`);
      showToast("Bunk deleted", "success");
      if (editingBunkId === id) {
        setEditingBunkId("");
        setBunkForm({
          name: "",
          address: "",
          mobile: "",
          googleMapLink: "",
          state: "",
          district: "",
          city: "",
          area: "",
          lat: "",
          lng: "",
          totalSlots: 0
        });
      }
      loadBunks();
      loadReport();
      setSelectedBunkSlots([]);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete bunk"), "error");
    }
  };

  const updateSlotStatus = async (slotId, status) => {
    try {
      await api.patch(`/slots/${slotId}/status`, { status });
      showToast("Slot status updated", "success");
      if (slotForm.bunk) {
        loadSlotsByBunk(slotForm.bunk);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to update slot status"), "error");
    }
  };

  const deleteSlot = async (slotId) => {
    try {
      await api.delete(`/slots/${slotId}`);
      showToast("Slot deleted", "success");
      if (slotForm.bunk) {
        loadSlotsByBunk(slotForm.bunk);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete slot"), "error");
    }
  };

  const applyBookingFilter = async () => {
    try {
      setBookingsPage(1);
      await fetchBookings(1);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to apply booking filter"), "error");
    }
  };

  const clearBookingFilter = async () => {
    try {
      const empty = { status: "", from: "", to: "" };
      setBookingFilter(empty);
      setBookingsPage(1);
      await fetchBookings(1, empty);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to clear booking filters"), "error");
    }
  };

  const exportBookingsCsv = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", "1");
      params.append("limit", "10000");
      params.append("sortBy", bookingSortBy);
      params.append("sortOrder", bookingSortOrder);
      if (bookingFilter.status) params.append("status", bookingFilter.status);
      if (bookingFilter.from) params.append("from", bookingFilter.from);
      if (bookingFilter.to) params.append("to", bookingFilter.to);
      if (bookingSearch.trim()) params.append("q", bookingSearch.trim());
      const response = await api.get(`/bookings?${params.toString()}`);
      const items = response.data.items || [];
      const headers = ["User", "User Email", "Bunk", "Slot", "Status", "Created At"];
      const rows = items.map((b) => [
        b.user?.name || "",
        b.user?.email || "",
        b.bunk?.name || "",
        b.slot?.slotNumber || "",
        b.status || "",
        b.createdAt ? new Date(b.createdAt).toISOString() : ""
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "booking-report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("CSV exported", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to export CSV"), "error");
    }
  };

  const handleBookingSortHeader = (apiKey) => {
    if (bookingSortBy === apiKey) {
      setBookingSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setBookingSortBy(apiKey);
      setBookingSortOrder(apiKey === "createdAt" ? "desc" : "asc");
    }
    setBookingsPage(1);
  };

  const sortIndicator = (apiKey) => {
    if (bookingSortBy !== apiKey) return "";
    return bookingSortOrder === "asc" ? " ▲" : " ▼";
  };

  const sortAria = (apiKey) => {
    if (bookingSortBy !== apiKey) return "none";
    return bookingSortOrder === "asc" ? "ascending" : "descending";
  };

  const filteredSlots = selectedBunkSlots.filter((slot) =>
    slot.slotNumber.toLowerCase().includes(slotSearch.toLowerCase())
  );
  const totalSlotPages = Math.max(1, Math.ceil(filteredSlots.length / slotsPerPage));
  const paginatedSlots = filteredSlots.slice((slotPage - 1) * slotsPerPage, slotPage * slotsPerPage);
  const totalBookingPages = Math.max(1, Math.ceil(bookingsTotal / bookingsPerPage));

  return (
    <main className="container admin-dashboard">
      <h2>Admin Dashboard</h2>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title || ""}
        message={confirm?.message || ""}
        confirmText={confirm?.confirmText || "OK"}
        danger={confirm?.danger}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          const action = confirm;
          setConfirm(null);
          if (!action) return;
          if (action.type === "deleteBunk") await deleteBunk(action.id);
          if (action.type === "deleteSlot") await deleteSlot(action.id);
          if (action.type === "cancelBooking") await updateBooking(action.id, "cancelled");
          if (action.type === "completeBooking") await updateBooking(action.id, "completed");
        }}
      />

      <section className="card section-card">
        <h3 className="section-heading">Booking Summary</h3>
        {loading ? (
          <div className="grid summary-grid">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        ) : (
          <div className="grid summary-grid">
            <article className="card summary-card"><p>Total: {report.total}</p></article>
            <article className="card summary-card"><p>Booked: {report.booked}</p></article>
            <article className="card summary-card"><p>Charging: {report.charging}</p></article>
            <article className="card summary-card"><p>Completed: {report.completed}</p></article>
            <article className="card summary-card"><p>Cancelled: {report.cancelled}</p></article>
          </div>
        )}
      </section>

      <section className="card section-card">
        <h3 className="section-heading">Create EV Bunk Location</h3>
        <form className="form" onSubmit={createBunk}>
          <input placeholder="Bunk Name" required value={bunkForm.name} onChange={(e) => setBunkForm({ ...bunkForm, name: e.target.value })} />
          <input placeholder="Address" required value={bunkForm.address} onChange={(e) => setBunkForm({ ...bunkForm, address: e.target.value })} />
          <input placeholder="Mobile" required value={bunkForm.mobile} onChange={(e) => setBunkForm({ ...bunkForm, mobile: e.target.value })} />
          <select
            required
            value={bunkForm.state}
            onChange={(e) => setBunkForm({ ...bunkForm, state: e.target.value, district: "" })}
          >
            <option value="">State / UT</option>
            {locationMeta.states.map((s) => (
              <option value={s} key={s}>{s}</option>
            ))}
          </select>
          <select
            required
            value={bunkForm.district}
            disabled={!bunkForm.state}
            onChange={(e) => setBunkForm({ ...bunkForm, district: e.target.value })}
          >
            <option value="">District</option>
            {bunkDistrictOptions.map((d) => (
              <option value={d} key={d}>{d}</option>
            ))}
          </select>
          <input placeholder="City" value={bunkForm.city} onChange={(e) => setBunkForm({ ...bunkForm, city: e.target.value })} />
          <input placeholder="Area / locality" value={bunkForm.area} onChange={(e) => setBunkForm({ ...bunkForm, area: e.target.value })} />
          <input placeholder="Google Map Link" value={bunkForm.googleMapLink} onChange={(e) => setBunkForm({ ...bunkForm, googleMapLink: e.target.value })} />
          <input placeholder="Latitude (map pin)" required value={bunkForm.lat} onChange={(e) => setBunkForm({ ...bunkForm, lat: e.target.value })} />
          <input placeholder="Longitude (map pin)" required value={bunkForm.lng} onChange={(e) => setBunkForm({ ...bunkForm, lng: e.target.value })} />
          <input placeholder="Total Slots" type="number" required value={bunkForm.totalSlots} onChange={(e) => setBunkForm({ ...bunkForm, totalSlots: e.target.value })} />
          <button type="submit">{editingBunkId ? "Update Bunk" : "Create Bunk"}</button>
        </form>
      </section>

      <section className="card section-card">
        <h3 className="section-heading">Manage Bunk Details</h3>
        <div className="row bunk-toolbar">
          <input
            className="bunk-search-input"
            placeholder="Search by name, address, mobile..."
            value={bunkSearch}
            onChange={(e) => setBunkSearch(e.target.value)}
          />
          <select value={bunkSort} onChange={(e) => setBunkSort(e.target.value)}>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="slots-desc">Slots (high → low)</option>
            <option value="slots-asc">Slots (low → high)</option>
          </select>
        </div>
        <div className="grid">
          {filteredBunks.map((b) => (
            <article className="card mini-card" key={b._id}>
              <p><strong>{b.name}</strong></p>
              <p>{b.address}</p>
              {(b.area || b.city || b.district || b.state) && (
                <p className="bunk-location-line">
                  {[b.area, b.city, b.district, b.state].filter(Boolean).join(" · ")}
                </p>
              )}
              <p>Mobile: {b.mobile}</p>
              <p>Slots: {b.slotStats?.available || 0}/{b.slotStats?.total || 0}</p>
              <div className="row">
                <button className="btn-secondary" type="button" onClick={() => startEditBunk(b)}>Edit</button>
                <button
                  className="btn-danger"
                  type="button"
                  onClick={() =>
                    setConfirm({
                      type: "deleteBunk",
                      id: b._id,
                      title: "Delete bunk?",
                      message: `Remove "${b.name}" and its slots from the system? This cannot be undone.`,
                      confirmText: "Delete",
                      danger: true
                    })
                  }
                >
                  Delete
                </button>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => {
                    setSlotForm({ ...slotForm, bunk: b._id });
                    loadSlotsByBunk(b._id);
                  }}
                >
                  View Slots
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <h3 className="section-heading">Manage Recharge Slots</h3>
        <form className="form" onSubmit={createSlot}>
          <select required value={slotForm.bunk} onChange={(e) => setSlotForm({ ...slotForm, bunk: e.target.value })}>
            <option value="">Select Bunk</option>
            {bunks.map((b) => (
              <option value={b._id} key={b._id}>{b.name}</option>
            ))}
          </select>
          <input placeholder="Slot Number" required value={slotForm.slotNumber} onChange={(e) => setSlotForm({ ...slotForm, slotNumber: e.target.value })} />
          <select value={slotForm.status} onChange={(e) => setSlotForm({ ...slotForm, status: e.target.value })}>
            <option value="available">available</option>
            <option value="occupied">occupied</option>
          </select>
          <button type="submit">Create Slot</button>
        </form>
        <div className="row slot-search-row">
          <input
            placeholder="Search slot number"
            value={slotSearch}
            onChange={(e) => {
              setSlotSearch(e.target.value);
              setSlotPage(1);
            }}
          />
        </div>
        {selectedBunkSlots.length > 0 && (
          <div className="grid slot-grid">
            {paginatedSlots.map((slot) => (
              <article className="card mini-card" key={slot._id}>
                <p>Slot: {slot.slotNumber}</p>
                <p>Status: {slot.status}</p>
                <div className="row">
                  <button className="btn-secondary" type="button" onClick={() => updateSlotStatus(slot._id, "available")}>Set Available</button>
                  <button className="btn-ghost" type="button" onClick={() => updateSlotStatus(slot._id, "occupied")}>Set Occupied</button>
                  <button
                    className="btn-danger"
                    type="button"
                    onClick={() =>
                      setConfirm({
                        type: "deleteSlot",
                        id: slot._id,
                        title: "Delete slot?",
                        message: `Remove slot ${slot.slotNumber}?`,
                        confirmText: "Delete",
                        danger: true
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {selectedBunkSlots.length > 0 && (
          <div className="row">
            <button type="button" disabled={slotPage <= 1} onClick={() => setSlotPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <p className="page-pill">
              Page {slotPage} / {totalSlotPages}
            </p>
            <button type="button" disabled={slotPage >= totalSlotPages} onClick={() => setSlotPage((p) => Math.min(totalSlotPages, p + 1))}>
              Next
            </button>
          </div>
        )}
      </section>

      <section className="card section-card">
        <h3 className="section-heading">Manage Booking Status</h3>
        <div className="row booking-filter-row">
          <select value={bookingFilter.status} onChange={(e) => setBookingFilter({ ...bookingFilter, status: e.target.value })}>
            <option value="">All status</option>
            <option value="booked">booked</option>
            <option value="charging">charging</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input type="date" value={bookingFilter.from} onChange={(e) => setBookingFilter({ ...bookingFilter, from: e.target.value })} />
          <input type="date" value={bookingFilter.to} onChange={(e) => setBookingFilter({ ...bookingFilter, to: e.target.value })} />
          <button type="button" disabled={bookingsLoading || !!bookingUpdatingId} onClick={applyBookingFilter}>Apply Filter</button>
          <button type="button" className="btn-ghost" disabled={bookingsLoading || !!bookingUpdatingId} onClick={clearBookingFilter}>Clear</button>
          <button type="button" className="btn-secondary" disabled={bookingsLoading || !!bookingUpdatingId} onClick={exportBookingsCsv}>Export CSV</button>
        </div>
        <div className="row booking-toolbar">
          <input
            className="booking-search-input"
            placeholder="Search user, bunk, slot, status... (server-side)"
            value={bookingSearchInput}
            onChange={(e) => setBookingSearchInput(e.target.value)}
          />
          {bookingsLoading && (
            <p className="booking-loading-hint" role="status" aria-live="polite">
              Loading bookings...
            </p>
          )}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th aria-sort={sortAria("user")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "user" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("user")}
                    aria-label={`Sort by user ${bookingSortBy === "user" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    User{sortIndicator("user")}
                  </button>
                </th>
                <th aria-sort={sortAria("email")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "email" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("email")}
                    aria-label={`Sort by email ${bookingSortBy === "email" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    Email{sortIndicator("email")}
                  </button>
                </th>
                <th aria-sort={sortAria("bunk")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "bunk" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("bunk")}
                    aria-label={`Sort by bunk ${bookingSortBy === "bunk" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    Bunk{sortIndicator("bunk")}
                  </button>
                </th>
                <th aria-sort={sortAria("slot")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "slot" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("slot")}
                    aria-label={`Sort by slot ${bookingSortBy === "slot" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    Slot{sortIndicator("slot")}
                  </button>
                </th>
                <th aria-sort={sortAria("status")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "status" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("status")}
                    aria-label={`Sort by status ${bookingSortBy === "status" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    Status{sortIndicator("status")}
                  </button>
                </th>
                <th aria-sort={sortAria("createdAt")}>
                  <button
                    type="button"
                    className={`th-sort${bookingSortBy === "createdAt" ? " active" : ""}`}
                    disabled={bookingsLoading || !!bookingUpdatingId}
                    onClick={() => handleBookingSortHeader("createdAt")}
                    aria-label={`Sort by created date ${bookingSortBy === "createdAt" ? `(currently ${bookingSortOrder})` : ""}`}
                  >
                    Created{sortIndicator("createdAt")}
                  </button>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.user?.name || "—"}</td>
                  <td>{b.user?.email || "—"}</td>
                  <td>{b.bunk?.name || "—"}</td>
                  <td>{b.slot?.slotNumber || "—"}</td>
                  <td><span className={`status-pill status-${b.status}`}>{b.status}</span></td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        disabled={!!bookingUpdatingId}
                        onClick={() => updateBooking(b._id, "charging")}
                      >
                        {bookingUpdatingId === b._id ? "Updating..." : "Charging"}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        disabled={!!bookingUpdatingId}
                        onClick={() =>
                          setConfirm({
                            type: "completeBooking",
                            id: b._id,
                            title: "Complete booking?",
                            message: "Mark this booking as completed and free the slot?",
                            confirmText: "Complete booking"
                          })
                        }
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        disabled={!!bookingUpdatingId}
                        onClick={() =>
                          setConfirm({
                            type: "cancelBooking",
                            id: b._id,
                            title: "Cancel booking?",
                            message: "Mark this booking as cancelled and free the slot?",
                            confirmText: "Cancel booking",
                            danger: true
                          })
                        }
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookingsTotal > 0 && (
          <div className="row booking-pagination">
            <button
              type="button"
              disabled={bookingsPage <= 1 || bookingsLoading || !!bookingUpdatingId}
              onClick={() => setBookingsPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <p className="page-pill">
              Page {bookingsPage} / {totalBookingPages} · {bookingsTotal} total
            </p>
            <button
              type="button"
              disabled={bookingsPage >= totalBookingPages || bookingsLoading || !!bookingUpdatingId}
              onClick={() => setBookingsPage((p) => Math.min(totalBookingPages, p + 1))}
            >
              Next
            </button>
            {bookingUpdatingId && (
              <p className="booking-progress-hint" role="status" aria-live="polite">
                Updating booking...
              </p>
            )}
          </div>
        )}
        {bookingsTotal === 0 && !loading && (
          <p className="empty-hint">No bookings match your filters or search.</p>
        )}
      </section>
    </main>
  );
}
