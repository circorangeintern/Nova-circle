# Backend Deliverables Evidence

Use this file as the submission index. Submit the repository link together with
the screenshots and short browser recording described below.

## 1. Core MVP API endpoints

Evidence in the repository:

- Route implementations: `src/routes/`
- Business logic: `src/controllers/`
- Validation and authorization: `src/utils/validation.js` and
  `src/middleware/auth.js`
- Database schema and migration: `prisma/schema.prisma` and
  `prisma/migrations/`
- API documentation: `API_CONTRACT.md`
- Importable Postman files: `postman/`
- Automated unit tests: `test/`
- Full live API smoke test: `scripts/e2e-smoke.js`

Run and capture the successful output:

```bash
npm test
npm run test:e2e
```

The backend and PostgreSQL must already be running before `test:e2e`. The
script uses `OFFICIAL_EMAIL` and `OFFICIAL_PASSWORD` from `.env` and exercises
every implemented endpoint against real PostgreSQL data.

## 2. Authentication

Implemented evidence:

- Citizen registration and login return signed JWTs.
- Passwords are hashed with bcrypt.
- Protected APIs verify `Authorization: Bearer <token>`.
- Citizen and government roles are enforced by the backend.
- Browser sessions persist in Zustand/localStorage.
- Persisted tokens are revalidated with `GET /api/auth/me` when the app starts.
- Logout clears the local session.
- Profile update, password change, and citizen account deletion are functional.

Capture these screenshots:

1. Postman registration response showing `201`, the user, and a token. Hide most
   of the token before sharing publicly.
2. Postman `GET /auth/me` response showing `200`.
3. Postman protected request without a token showing `401`.
4. Browser citizen account page after registration or login.
5. Browser official dashboard after official login.

## 3. Frontend-connected business flows

Record one short browser video showing these flows:

1. Citizen registers or logs in, submits a report with a photo and location,
   then sees the report in **My Reports** or the public map.
2. Government official logs in, opens that same report, advances it to
   **Acknowledged**, and adds a response note.
3. Open the public report detail and show the new status and audit timeline.

Keep DevTools **Network** open during the recording. Show the real requests:

- `POST /api/auth/register` or `POST /api/auth/login`
- `POST /api/reports`
- `GET /api/government/reports/:id`
- `PATCH /api/government/reports/:id/status`
- `GET /api/public/reports/:id`

## Submission package

Submit:

- GitHub repository link and commit hash.
- Exported Postman collection/environment or the files under `postman/`.
- Screenshot of `npm test` passing.
- Screenshot of `npm run test:e2e` passing.
- Screenshots of the main Postman authentication/API responses.
- A 60-90 second browser recording of the connected citizen and official flows.
- Optional deployed frontend and backend URLs when available.

Do not include `.env`, database passwords, JWT secrets, or full live tokens in
the submission.
