# PublicEye — API Contract Documentation

**Base URL (local dev):** `http://localhost:5000/api`
**Auth scheme:** Bearer JWT — send `Authorization: Bearer <token>` on protected routes.

---

## 1. Authentication

### `POST /auth/register`
Public. Creates a new **citizen** account (government officials are provisioned separately).

**Request body**
```json
{ "name": "Ada Obi", "email": "ada@example.com", "password": "minimum6chars" }
```

**Response `201`**
```json
{
  "user": { "id": "uuid", "name": "Ada Obi", "email": "ada@example.com", "role": "CITIZEN" },
  "token": "eyJhbGciOi..."
}
```

**Errors:** `400 VALIDATION_ERROR`, `409 DUPLICATE_ENTRY` (email already registered)

---

### `POST /auth/login`
Public.

**Request body**
```json
{ "email": "ada@example.com", "password": "minimum6chars" }
```

**Response `200`** — same shape as register.
**Errors:** `401 INVALID_CREDENTIALS`

---

### `GET /auth/me`
Auth required (any role). Returns the logged-in user's profile.

**Response `200`**
```json
{ "user": { "id": "uuid", "name": "Ada Obi", "email": "ada@example.com", "role": "CITIZEN" } }
```
**Errors:** `401 UNAUTHORIZED`, `401 INVALID_TOKEN`

---

## 2. Citizen — Reports

### `POST /reports`
Auth required, role: `CITIZEN`. `multipart/form-data`.

**Fields:** `photo` (file, required), `category` (`ROAD`|`SCHOOL`|`WATER`|`ELECTRICITY`), `description` (string, ≤250 chars), `latitude` (float), `longitude` (float)

**Response `201`**
```json
{
  "report": {
    "id": "uuid", "category": "ROAD", "description": "Pothole on 3rd Ave",
    "photoUrl": "/uploads/173...jpg", "latitude": 7.3775, "longitude": 3.9470,
    "status": "REPORTED", "citizenId": "uuid", "createdAt": "2026-07-13T09:00:00Z"
  }
}
```
**Errors:** `400 VALIDATION_ERROR` (missing photo/bad fields), `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

### `GET /reports/mine`
Auth required, role: `CITIZEN`. Returns the caller's own submitted reports, newest first.

**Response `200`**
```json
{ "reports": [ { "id": "uuid", "category": "ROAD", "status": "IN_PROGRESS", "...": "..." } ] }
```

---

## 3. Public

### `GET /public/reports`
No auth required.

**Query params (all optional):** `category`, `status`, `page` (default 1), `limit` (default 20)

**Response `200`**
```json
{
  "reports": [ { "id": "uuid", "category": "WATER", "status": "ACKNOWLEDGED", "...": "..." } ],
  "total": 42, "page": 1, "limit": 20
}
```
Note: citizen identity is deliberately excluded from this endpoint's payload.

---

## 4. Government

All routes below require `Authorization: Bearer <token>` for a user with `role: GOVERNMENT_OFFICIAL`.

### `GET /government/reports`
**Query params (optional):** `status`, `category`

**Response `200`**
```json
{
  "reports": [
    {
      "id": "uuid", "category": "ROAD", "status": "REPORTED",
      "citizen": { "id": "uuid", "name": "Ada Obi", "email": "ada@example.com" },
      "...": "..."
    }
  ]
}
```
**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN` (not an official)

---

### `PATCH /government/reports/:id/status`
Updates a report's status. Enforces the fixed forward flow:
`REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED` (no skipping or reversing stages).

**Request body**
```json
{ "status": "ACKNOWLEDGED" }
```

**Response `200`**
```json
{ "report": { "id": "uuid", "status": "ACKNOWLEDGED", "...": "..." } }
```
**Errors:**
- `400 INVALID_STATUS_TRANSITION` — e.g. trying to jump from `REPORTED` to `RESOLVED`
- `404 NOT_FOUND` — report doesn't exist
- `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

## 5. Analytics

Public per the PRD's transparency goal — no auth required.

### `GET /analytics/summary`
**Response `200`**
```json
{
  "totalReports": 128,
  "reportsByCategory": [ { "category": "ROAD", "count": 60 }, { "category": "WATER", "count": 31 } ],
  "reportsByStatus": [ { "status": "REPORTED", "count": 20 }, { "status": "RESOLVED", "count": 55 } ],
  "mostReportedCategory": "ROAD"
}
```

### `GET /analytics/monthly?year=2026`
**Response `200`**
```json
{
  "year": 2026,
  "months": [ { "month": 1, "count": 10, "resolved": 4 }, { "month": 2, "count": 14, "resolved": 9 } ]
}
```

---

## 6. Error Code Reference

| HTTP Status | `error` code               | Meaning                                      |
|-------------|-----------------------------|-----------------------------------------------|
| 400         | `VALIDATION_ERROR`          | Request body/query failed schema validation   |
| 400         | `INVALID_STATUS_TRANSITION` | Status update skips or reverses the flow      |
| 401         | `UNAUTHORIZED`              | Missing/malformed Authorization header        |
| 401         | `INVALID_TOKEN`             | JWT invalid or expired                        |
| 401         | `INVALID_CREDENTIALS`       | Login email/password mismatch                 |
| 403         | `FORBIDDEN`                 | Authenticated but wrong role for this route   |
| 404         | `NOT_FOUND`                 | Resource (report, route) doesn't exist        |
| 409         | `DUPLICATE_ENTRY`           | Unique constraint violated (e.g. email taken) |
| 500         | `INTERNAL_SERVER_ERROR`     | Unhandled server error                        |

All error responses share this shape:
```json
{ "error": "ERROR_CODE", "message": "Human-readable explanation" }
```
