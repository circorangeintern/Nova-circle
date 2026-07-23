# PublicEye Backend

Backend API scaffold for **PublicEye — Civic Infrastructure Accountability Platform**, built against the MVP scope in the PRD (citizen reporting, public monitoring, government status management, analytics).

## Stack
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT auth (bcrypt password hashing)
- Multer for photo uploads
- Zod for request validation

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL (e.g. a free Neon Postgres instance) and JWT_SECRET
npx prisma migrate dev --name init
npm run dev                # starts on http://localhost:5000
```

Check `GET /health` to confirm it's running.

## Project structure

```
prisma/
  schema.prisma       # User, Report, StatusHistory models + enums
  er_diagram.png       # rendered ER diagram for the deliverable
src/
  app.js               # express app, route mounting, error handling
  server.js            # entry point
  config/
    db.js              # Prisma client singleton
    upload.js           # multer config for report photos
  middleware/
    auth.js             # JWT verification + role guard
    errorHandler.js     # centralized error → JSON response
  controllers/
    auth.controller.js
    report.controller.js
    analytics.controller.js
  routes/
    auth.routes.js       # /api/auth/*
    reports.routes.js    # /api/reports/*        (citizen)
    public.routes.js     # /api/public/*         (open)
    government.routes.js # /api/government/*     (official)
    analytics.routes.js  # /api/analytics/*      (open)
API_CONTRACT.md        # full endpoint documentation — this week's deliverable
```

## What's implemented (MVP scope from the PRD)

- **Auth:** citizen register/login, JWT issuance, `/me`
- **Citizen reports:** submit report with photo + GPS + category + description, view own reports
- **Public:** browse/filter all reports by category and status (no auth)
- **Government:** view reports, update status through the fixed flow `Reported → Acknowledged → In Progress → Resolved`, with an audit trail in `StatusHistory`
- **Analytics:** total reports, breakdown by category/status, most-reported category, monthly summary

## Not yet wired up (flag for the team)
- Government official account creation (PRD says officials are "authorized" — decide if that's an admin-seeded flow or an invite system for Week 3)
- Photo storage is local disk for now; swap `src/config/upload.js` for S3/Cloudinary before deploying
- No rate limiting yet on `/auth/login` or `/reports` (worth adding before public demo)

## Notes on the ER diagram
`prisma/er_diagram.png` was generated straight from the schema below — if the schema changes, regenerate it so the two stay in sync.
