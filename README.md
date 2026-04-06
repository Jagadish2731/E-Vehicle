# Electric Vehicle Recharge Bunk (MERN, JavaScript)

Full-stack MERN project for EV charging station discovery, slot vacancy, and booking.

## Features
- User/Admin register and login (JWT auth)
- Admin: create/manage EV bunk details
- Admin: create/manage recharge slots
- User: find bunks by Indian state, district, and optional city/area
- User: view bunk details and slot vacancy
- User: book available slot
- Admin: update booking status (charging/completed/cancelled)
- Action logging for key operations
- Fully responsive React frontend

## Tech Stack
- Frontend: React + Vite (JSX), React Router, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT

## Project Structure
- `backend` - API server
- `frontend` - React app
- `docs` - report, test cases, and submission checklist

## Quick Commands (Project Root)
- `npm run dev` - run backend + frontend together
- `npm run dev:backend` - run backend only
- `npm run dev:frontend` - run frontend only
- `npm run build` - build frontend
- `npm run seed` - seed backend demo data (writes users, bunks, slots, bookings to MongoDB)
- `npm run verify-db` - print document counts in MongoDB (checks that data exists)

## Backend Setup
1. Open terminal in `backend`
2. Install packages: `npm install`
3. Configure `.env` (already created):
   - `PORT=5000`
   - `MONGO_URI=mongodb://127.0.0.1:27017/ev_recharge_bunk`
   - `JWT_SECRET=change_this_secret`
   - `CLIENT_URL=http://localhost:5173`
4. Run server: `npm run dev`
5. Optional demo data: `npm run seed` (clears users/bunks/slots/bookings and inserts sample records)

### Demo logins (after `npm run seed`)
| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@ev.com` | `admin123` |
| User | `user@ev.com` | `user123` |
| User | `priya@ev.com` | `user123` |
| User | `rahul@ev.com` | `user123` |
| User | `amit@ev.com` | `user123` |

Sample data includes **3 bunks** (two in Bengaluru Urban, one in Pune), **15 slots**, and **8 bookings** across statuses (booked, charging, completed, cancelled) so the admin dashboard and reports are easy to explore.

## Frontend Setup
1. Open terminal in `frontend`
2. Install packages: `npm install`
3. `.env` (already created):
   - `VITE_API_URL=http://localhost:5000/api`
4. Run app: `npm run dev`

## Main API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/bunks`
- `GET /api/bunks/location-meta` (states and districts for dropdowns)
- `GET /api/bunks/search?state=..&district=..&city=..&area=..` (at least one param)
- `GET /api/bunks/nearby?lat=..&lng=..&radiusKm=..` (optional legacy distance search)
- `POST /api/bunks` (admin)
- `POST /api/slots` (admin)
- `GET /api/slots/bunk/:bunkId`
- `POST /api/bookings`
- `GET /api/bookings/mine`
- `PATCH /api/bookings/:id/cancel` (user/admin own booking cancel)
- `GET /api/bookings` (admin) returns `{ items, total, page, limit }`
  - Query: `page`, `limit`, `sortBy` (`createdAt`|`status`|`user`|`email`|`bunk`|`slot`), `sortOrder` (`asc`|`desc`), `q` (search), `status`, `from`, `to`
- `GET /api/bookings?status=...&from=YYYY-MM-DD&to=YYYY-MM-DD` (admin filter)
- `GET /api/bookings/report/summary` (admin summary)
- `PATCH /api/bookings/:id/status` (admin)

### Admin Booking Query Examples
- Page 1, 8 rows, newest first: `GET /api/bookings?page=1&limit=8&sortBy=createdAt&sortOrder=desc`
- Search by user/bunk/slot/status text: `GET /api/bookings?page=1&limit=8&q=station`
- Filter by status and date range: `GET /api/bookings?status=charging&from=2026-04-01&to=2026-04-30`
- Sort alphabetically by bunk name: `GET /api/bookings?page=1&limit=8&sortBy=bunk&sortOrder=asc`

## Notes
- To use with map UI, save Google Maps links while creating bunk.
- MongoDB must be running locally (or set a cloud `MONGO_URI`).

## Deployment
- Backend (Render): `render.yaml` is included at project root.
- Frontend (Vercel): `frontend/vercel.json` is included for SPA routing.

## Git and GitHub
Run all Git commands from this project folder (`E-Vehicle`), not from your user home directory.

1. Create a new empty repository on GitHub (no README/license if you already have commits locally).
2. Add the remote and push (replace `YOUR_USER` and `YOUR_REPO`):

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

If your first commit is on `master`, either push `master` or rename first: `git branch -M main` then push.

## Submission Documents
- Detailed report: `docs/PROJECT_REPORT.md`
- Test cases: `docs/TEST_CASES.md`
- Final checklist: `docs/FINAL_SUBMISSION_CHECKLIST.md`
- Viva script: `docs/VIVA_SCRIPT.md`
- One-page synopsis: `docs/PROJECT_SYNOPSIS.md`
