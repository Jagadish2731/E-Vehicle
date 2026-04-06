# Electric Vehicle Recharge Bunk - Project Report

## 1. Abstract
This project provides a complete EV charging slot booking platform using MERN stack. It helps users locate nearby charging bunks, check slot vacancy, and reserve charging slots to reduce waiting queues.

## 2. Problem Statement
EV users often face uncertainty in finding available charging points and booking slots in advance. This system solves discoverability and queue management by combining location-based search, slot visibility, and online booking.

## 3. Objectives
- Provide role-based access for Admin and User.
- Allow Admin to manage bunk and slot data.
- Allow User to search nearby bunks and book slots.
- Provide booking status tracking and logs.
- Build a responsive interface for mobile and desktop.

## 4. Technology Stack
- Frontend: React (JSX), Vite, React Router, Axios
- Backend: Node.js, Express.js, JWT authentication
- Database: MongoDB with Mongoose
- Logging: action-level logging in database (`ActionLog` collection)

## 5. Modules
### 5.1 Admin Module
- Register/Login
- Create, update, delete EV bunk details
- Create, update, delete recharge slots
- View and filter all bookings
- Update booking status (`charging`, `completed`, `cancelled`)
- View booking summary and export CSV report

### 5.2 User Module
- Register/Login
- Search nearby bunks using latitude, longitude, radius
- View bunk details (address, mobile, map link)
- View slot vacancy
- Book slots
- Cancel active bookings

## 6. Database Design
Collections:
- `users`
- `bunks`
- `slots`
- `bookings`
- `actionlogs`

Key relations:
- `Slot.bunk -> Bunk._id`
- `Booking.user -> User._id`
- `Booking.bunk -> Bunk._id`
- `Booking.slot -> Slot._id`

## 7. API Design (Major Endpoints)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/bunks`
- `GET /api/bunks/nearby`
- `POST /api/bunks`
- `PUT /api/bunks/:id`
- `DELETE /api/bunks/:id`
- `POST /api/slots`
- `GET /api/slots/bunk/:bunkId`
- `PATCH /api/slots/:id/status`
- `DELETE /api/slots/:id`
- `POST /api/bookings`
- `GET /api/bookings/mine`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings` (with pagination, search, sorting, filters)
- `GET /api/bookings/report/summary`

## 8. Security and Reliability
- JWT-based authentication and protected routes.
- Role-based authorization for admin-only operations.
- Password hashing using bcrypt.
- Validation through schema constraints and controlled status updates.

## 9. Optimization Notes
- Modular architecture with separated models/controllers/routes.
- Slot status index for efficient slot uniqueness per bunk.
- Query-based booking filters to reduce payload.
- Server-side booking pagination/search/sort to avoid loading large booking lists on client.

## 10. Recent Enhancements
- Admin booking table upgraded to clickable server-side sorting on `createdAt`, `status`, `user`, `email`, `bunk`, and `slot`.
- Admin booking API now supports `page`, `limit`, `sortBy`, `sortOrder`, and `q` with response shape `{ items, total, page, limit }`.
- Booking search supports user name/email, bunk name, slot number, and status text.
- CSV export now respects active search, sort, and filter conditions.
- Booking report summary route order corrected to prevent route shadowing.

## 11. Deployment Plan
- Backend deploy: Render/Railway
- Frontend deploy: Vercel/Netlify
- MongoDB: MongoDB Atlas

## 12. Conclusion
The system satisfies core requirements for EV recharge bunk management with responsive UX, secure APIs, queue reduction through slot booking, and extensible architecture for future smart-city integrations.

## 13. Screenshots (Template)
Add screenshots below before final submission:

1. Login Page
   - File name: `screenshots/login.png`
2. Register Page
   - File name: `screenshots/register.png`
3. User Dashboard - Nearby Search
   - File name: `screenshots/user-nearby-search.png`
4. User Dashboard - Slot Booking
   - File name: `screenshots/user-slot-booking.png`
5. Admin Dashboard - Bunk Management
   - File name: `screenshots/admin-bunk-management.png`
6. Admin Dashboard - Slot Management
   - File name: `screenshots/admin-slot-management.png`
7. Admin Dashboard - Booking Report
   - File name: `screenshots/admin-booking-report.png`
