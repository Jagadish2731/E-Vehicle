# Viva / Presentation Script (2-3 Minutes)

Good morning/afternoon. My project title is **Electric Vehicle Recharge Bunk**, implemented using the **MERN stack in JavaScript**.

### 1) Problem and Need
With increasing EV adoption, users often face problems in finding nearby charging stations and available charging slots. This causes long queues and delays. My project solves this by enabling location-based bunk discovery, slot vacancy visibility, and online slot booking.

### 2) Proposed Solution
The system has two modules:
- **Admin Module**: manages bunk details, recharge slots, and booking status.
- **User Module**: searches nearby bunks, views details, checks slot vacancy, books slots, and cancels active bookings.

### 3) Technology Used
- **Frontend**: React + Vite (JSX), React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Security**: JWT authentication, role-based authorization, bcrypt password hashing

### 4) Key Features Demonstration Flow
1. Start backend and frontend (`npm run dev`) and keep MongoDB running.
2. Register/login as user and admin.
3. Admin creates EV bunk with address, contact, map link, and geo coordinates.
4. Admin adds slots for that bunk and verifies slot list.
5. User searches bunks by Indian state, district, and optional city or area, then books one available slot.
6. Admin opens booking table and demonstrates search (`q`), filters (status/date), sortable columns, and pagination.
7. Admin updates booking status (charging/completed), then shows summary report and CSV export.
8. Negative test: attempt booking an occupied slot and show rejection.

### 5) Quality and Engineering Practices
- Modular backend architecture with separate routes, controllers, models, middleware.
- Logging for important actions using ActionLog collection.
- Responsive UI for desktop and mobile.
- Test cases and project report prepared for submission.

### 6) Outcome
The project successfully reduces queue uncertainty by enabling planned EV charging with slot booking and operational management for bunk administrators.

### 7) Future Scope
- Real-time slot updates with WebSockets
- Online payment integration
- Notification system (email/SMS)
- Advanced analytics dashboard for demand forecasting

Thank you.
