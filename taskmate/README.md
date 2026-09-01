# TaskMate

A daily task marketplace — post small jobs (pickups, cleaning, deliveries, repairs,
errands) with the price you're willing to pay. Nearby people bid to do them, you pick
one, funds are held in a simulated escrow, and released once the job's confirmed done.

## Theme: "Dispatch Board"

Deep navy background, warm paper-colored task cards with a torn/perforated ticket
edge, ink-stamp status badges (`OPEN`, `ASSIGNED`, `DONE`), hi-vis safety-orange
accent. Typefaces: Space Grotesk (headlines), Inter (body), IBM Plex Mono (prices,
ticket numbers, timestamps).

## Stack

- **Frontend:** React 18 + Vite, React Router, Redux Toolkit, Tailwind CSS,
  Framer Motion, Leaflet / react-leaflet (maps)
- **Backend:** Node.js + Express, MongoDB + Mongoose, JWT auth, Multer

No real-time layer (Socket.io) and no payment processor (Stripe) are used — chat/live
notifications are out of scope by design, and payments are a **simulated wallet**, not
real money.

## Project structure

Everything lives in this one project — no phase folders, no split repos:

```
taskmate/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # auth, user, task, bid, wallet, review, admin
│   ├── middleware/      # auth (JWT + admin guard), upload, error handling
│   ├── models/          # User, Task, Bid, Transaction, Review
│   ├── routes/
│   ├── utils/
│   ├── uploads/          # uploaded images (avatars, task photos)
│   └── server.js
└── frontend/
    └── src/
        ├── api/          # axios instance
        ├── components/   # Navbar, TaskCard, TaskMap, BidRow, StarRating, route guards
        ├── constants/    # categories.js — shared category list + currency formatter
        ├── pages/        # Landing, Login, Register, Dashboard, BrowseTasks,
        │                 # PostTask, TaskDetail, Wallet, Profile, Admin
        └── redux/        # store + slices (auth, tasks, bids, wallet)
```

## Getting started locally

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET
npm install
npm run dev
```

API runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend
automatically (see `vite.config.js`) — no CORS setup needed in dev.

**Both servers must be running at the same time**, in two separate terminals — the
backend is a pure JSON API with no UI of its own; the frontend is what you actually
open in the browser.

## Feature list

**Accounts**
- JWT auth (register/login), single account operates in **poster** or **tasker**
  mode, switchable anytime from the profile page
- Profile: name, phone, bio, skills, avatar upload, aggregate rating

**Task marketplace**
- Post a task: title, description, category, fixed/negotiable budget, deadline,
  location (browser geolocation or manual address), up to 5 photos
- Browse: category filter, keyword search, budget range, sort (newest / budget /
  deadline / nearest-to-me), list view or Leaflet map view
- Task detail page with full info and photo gallery

**Bidding**
- Taskers place one offer per task (amount + message)
- Task owner sees all offers, can accept one (auto-rejects the rest) or decline
  individually
- Taskers can withdraw a pending offer

**Simulated escrow wallet**
- Mock wallet balance per user, top up any amount (no real payment processor)
- Accepting an offer holds that amount in escrow from the poster's balance
- Tasker marks work done → poster confirms → escrow releases to the tasker
- Cancelling an assigned task refunds the held escrow
- Full transaction history per user

**Reviews**
- After a task is marked completed, both sides can leave a 1–5 star rating + comment
  for each other; feeds into the reviewee's aggregate rating shown on their profile

**Admin**
- `isAdmin` flag on users, gated by server-side middleware
- Platform stats (user count, tasks by status, transaction count)
- User list with ban/unban and verify/unverify actions
- Task list with a manual status override (for resolving disputes)

To make a user an admin, set `isAdmin: true` directly on their document in MongoDB
(e.g. via `mongosh` or MongoDB Compass) — there's no signup flow for it by design.

## What's intentionally not included

- **Real-time chat / live notifications** — dropped from scope on request. All
  status changes (new offer, accepted, completed) are visible by refreshing the
  relevant page rather than pushed live.
- **Real payments** — the wallet is a ledger in MongoDB, not connected to Stripe or
  any processor. No real money moves.

## Deployment notes

- **Backend:** Render, Railway, or Fly.io — set the same environment variables as
  `.env.example`, plus `NODE_ENV=production`
- **Database:** MongoDB Atlas free tier
- **Frontend:** Vercel or Netlify — for production you'll want to replace the Vite
  dev proxy with a `VITE_API_URL` environment variable pointed at your deployed
  backend, and update `src/api/axiosInstance.js` to use it as the `baseURL`
