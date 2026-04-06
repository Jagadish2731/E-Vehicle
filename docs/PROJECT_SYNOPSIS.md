# One-Page Project Synopsis

## Project Title
Electric Vehicle Recharge Bunk

## Domain
Industry / Smart Mobility

## Problem Statement
EV users face challenges in identifying nearby charging stations and knowing slot availability in real time. This leads to delays, long waiting times, and inefficient charging station utilization.

## Proposed Solution
Develop a full-stack web application in MERN stack to:
- locate nearby EV recharge bunks,
- display bunk and slot details,
- allow users to reserve charging slots,
- allow admins to manage bunks, slots, and booking lifecycle.

## Objectives
- Reduce charging queue time through slot booking.
- Improve accessibility of EV charging stations.
- Provide admin-level operational control and visibility.
- Deliver responsive and secure web experience.

## Technology Stack
- Frontend: React (JSX), Vite, React Router, Axios
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Security: JWT, bcrypt

## Module Overview
### Admin Module
- Register/Login
- Create/Update/Delete bunk details
- Create/Update/Delete slots
- Manage booking status
- View bookings with search, filters, sorting, and pagination
- View booking summary reports
- Export CSV report

### User Module
- Register/Login
- Search nearby bunks by coordinates and radius
- View bunk details (address, mobile, map link)
- View slot vacancy and reserve slot
- Cancel active booking

## Expected Outcomes
- Better EV charging experience through pre-booking.
- Transparent slot availability and operational control.
- Foundation for smart-city EV charging ecosystem.

## Deployment and Deliverables
- Backend deployable on Render/Railway
- Frontend deployable on Vercel/Netlify
- Deliverables include source code, README, test cases, detailed report, and submission checklist.
