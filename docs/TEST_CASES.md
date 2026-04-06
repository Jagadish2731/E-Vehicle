# Test Cases - Electric Vehicle Recharge Bunk

## Authentication
1. Register user with valid data -> success token and user profile.
2. Register with existing email -> conflict error.
3. Login with valid credentials -> success.
4. Login with invalid password -> unauthorized.

## Admin - Bunk Management
1. Admin creates bunk with valid fields -> bunk saved.
2. Admin updates bunk details -> updated values returned.
3. Admin deletes bunk -> bunk removed and dependent slots removed.
4. Normal user tries admin bunk endpoint -> forbidden.

## Admin - Slot Management
1. Admin creates slot for selected bunk -> success.
2. Duplicate slot number in same bunk -> validation error.
3. Admin updates slot status -> status changed.
4. Admin deletes slot -> slot removed.

## User - Location Search and Booking
1. User selects state/district (and optional city/area) and searches -> matching bunks returned.
2. User views slots for bunk -> slot list returned.
3. User books available slot -> booking created, slot becomes occupied.
4. User books occupied slot -> booking blocked.

## Booking Lifecycle
1. Admin marks booking as charging -> status updated.
2. Admin marks booking completed/cancelled -> slot becomes available.
3. User cancels active booking -> booking cancelled and slot released.
4. User cancels completed booking -> rejected.

## Reporting
1. Admin applies status/date filters on bookings -> filtered list returned.
2. Admin opens bookings list with `page` and `limit` -> response includes `items`, `total`, `page`, `limit` with expected page size.
3. Admin searches bookings with `q` (user/email/bunk/slot/status) -> only matching rows returned.
4. Admin sorts by each allowed `sortBy` (`createdAt`, `status`, `user`, `email`, `bunk`, `slot`) in asc/desc -> ordering changes correctly.
5. Admin loads summary endpoint -> counts returned by status.
6. Admin exports CSV -> file downloaded with current booking rows.

## Postman Smoke Checklist (Admin Booking APIs)
Use `Authorization: Bearer <adminToken>` for protected requests.

1. `GET /api/bookings?page=1&limit=8`
   - Expect: HTTP 200
   - Expect body keys: `items`, `total`, `page`, `limit`
   - Expect: `items.length <= 8`

2. `GET /api/bookings?page=1&limit=8&sortBy=createdAt&sortOrder=desc`
   - Expect: HTTP 200
   - Expect: newest bookings first (compare first two `createdAt` values)

3. `GET /api/bookings?page=1&limit=8&sortBy=bunk&sortOrder=asc`
   - Expect: HTTP 200
   - Expect: bunk names in ascending alphabetical order

4. `GET /api/bookings?page=1&limit=8&q=<knownUserOrBunkText>`
   - Expect: HTTP 200
   - Expect: all rows match search text in user/email/bunk/slot/status

5. `GET /api/bookings?status=charging&from=2026-04-01&to=2026-04-30`
   - Expect: HTTP 200
   - Expect: all rows have `status=charging` and match date range

6. `GET /api/bookings/report/summary`
   - Expect: HTTP 200
   - Expect numeric counters for booking statuses

## Postman Smoke Checklist (User Booking APIs)
Use `Authorization: Bearer <userToken>` for protected requests.

1. `GET /api/bunks/location-meta`
   - Expect: HTTP 200 with `states` and `districtsByState`

2. `GET /api/bunks/search?state=Karnataka&district=Bengaluru%20Urban`
   - Expect: HTTP 200 with bunks in that state/district

3. `GET /api/slots/bunk/<bunkId>`
   - Expect: HTTP 200
   - Expect: slot list for selected bunk

4. `POST /api/bookings`
   - Body: `{ "bunk": "<bunkId>", "slot": "<availableSlotId>" }`
   - Expect: HTTP 201
   - Expect: booking created with `status=booked`

5. `GET /api/bookings/mine`
   - Expect: HTTP 200
   - Expect: latest booking appears in user booking list

6. `PATCH /api/bookings/<bookingId>/cancel`
   - Expect: HTTP 200
   - Expect: booking status updated to `cancelled`

7. `POST /api/bookings` using an already occupied slot
   - Expect: HTTP 400/409
   - Expect: booking is rejected with availability error

## Demo Run Order (Viva / Presentation)
1. Start services
   - Run MongoDB
   - Run project root command: `npm run dev`

2. Authentication demo
   - Register/Login as user
   - Login as admin

3. Admin setup demo
   - Create one bunk
   - Create multiple slots for that bunk
   - Show slot list

4. User booking demo
   - Search bunks by state/district (and optional city/area)
   - Open bunk slots and create one booking
   - Verify booking appears in user dashboard

5. Admin booking management demo
   - Open admin bookings table
   - Show search (`q`), filter (`status`/date), sort by column headers, and pagination
   - Update booking status (charging/completed)

6. Validation and reporting demo
   - Refresh user dashboard to show updated booking status
   - Open `GET /api/bookings/report/summary` result
   - Export CSV and verify downloaded rows

7. Negative case demo
   - Attempt booking an occupied slot and show rejection message
