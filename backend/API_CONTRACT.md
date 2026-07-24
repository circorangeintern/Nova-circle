# PublicEye — API Contract Documentation

**Base URL (local dev):** `http://localhost:5000/api`
**Auth scheme:** Bearer JWT — send `Authorization: Bearer <token>` on protected routes.

### `GET /health`
The health check sits outside the `/api` prefix at `http://localhost:5000/health`.

**Response `200`**
```json
{ "status": "ok" }
```

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

### `PATCH /auth/me`
Auth required. Updates the current user's supported profile fields.

**Request body**
```json
{ "name": "Adaeze Obi", "defaultAnonymous": false }
```

At least one field is required. `defaultAnonymous` is primarily used by citizen
accounts.

**Response `200`**
```json
{ "user": { "id": "uuid", "name": "Adaeze Obi", "defaultAnonymous": false } }
```

---

### `PATCH /auth/password`
Auth required. Changes the current user's password.

**Request body**
```json
{ "currentPassword": "old-password", "newPassword": "new-password-8+" }
```

**Response `200`**
```json
{ "message": "Password updated" }
```

**Errors:** `401 INVALID_CREDENTIALS`

---

### `DELETE /auth/me`
Auth required, role: `CITIZEN`. Deletes the current citizen account. Existing
reports remain public but are unlinked from the deleted account.

**Response:** `204 No Content`

**Errors:** `403 FORBIDDEN` for government official accounts.

---

## 2. Citizen — Reports

### `POST /reports`
Auth required, role: `CITIZEN`. `multipart/form-data`.

**Fields:**

- Required: `photo` (JPEG, PNG, or WEBP up to 5 MB), `category`
  (`ROAD`|`SCHOOL`|`WATER`|`ELECTRICITY`), `severity`
  (`LOW`|`MEDIUM`|`HIGH`|`CRITICAL`), `description` (≤250 chars),
  `latitude`, and `longitude`.
- Optional: `title`, `lga`, `state`, `address`, `reporterName`, and
  `reporterContact`.

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

### `GET /reports/:id`
Auth required, role: `CITIZEN`. Returns one report only when it belongs to the
current citizen. Includes status history.

**Response `200`**
```json
{ "report": { "id": "uuid", "status": "REPORTED", "statusHistory": [] } }
```

**Errors:** `404 NOT_FOUND`

---

### `PATCH /reports/:id`
Auth required, role: `CITIZEN`. `multipart/form-data`. Updates the current
citizen's report while its status is still `REPORTED`. The photo is optional
during an update.

**Response `200`**
```json
{ "report": { "id": "uuid", "description": "Updated description" } }
```

**Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`, `400 REPORT_LOCKED`

---

### `DELETE /reports/:id`
Auth required, role: `CITIZEN`. Deletes the current citizen's report while its
status is still `REPORTED`.

**Response:** `204 No Content`

**Errors:** `403 FORBIDDEN`, `404 NOT_FOUND`, `400 REPORT_LOCKED`

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

### `GET /public/reports/:id`
No auth required. Returns one public report with its status history. Citizen
identity and private contact information are excluded.

**Response `200`**
```json
{
  "report": {
    "id": "uuid",
    "status": "ACKNOWLEDGED",
    "statusHistory": [
      {
        "status": "ACKNOWLEDGED",
        "note": "Inspection scheduled",
        "changedBy": { "name": "Works Officer", "jurisdiction": "Surulere" }
      }
    ]
  }
}
```

**Errors:** `404 NOT_FOUND`

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

### `GET /government/reports/:id`
Auth required, role: `GOVERNMENT_OFFICIAL`. Returns report detail, citizen
identity for official follow-up, and the complete status history.

**Response `200`**
```json
{
  "report": {
    "id": "uuid",
    "citizen": { "id": "uuid", "name": "Ada Obi", "email": "ada@example.com" },
    "statusHistory": []
  }
}
```

**Errors:** `404 NOT_FOUND`, `401 UNAUTHORIZED`, `403 FORBIDDEN`

---

### `PATCH /government/reports/:id/status`
Updates a report's status. Enforces the fixed forward flow:
`REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED` (no skipping or reversing stages).

**Request body**
```json
{ "status": "ACKNOWLEDGED", "note": "Inspection scheduled" }
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
| 400         | `REPORT_LOCKED`              | Citizen tried to change a report after an official response |
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

---

## 7. Test and Postman Evidence

- Import `postman/PublicEye.postman_collection.json` and
  `postman/Local.postman_environment.json` into Postman.
- Run controller tests with `npm test`.
- With PostgreSQL and the API running, run the full live smoke test with
  `npm run test:e2e`.
- See `DELIVERABLES.md` for the recommended submission screenshots and browser
  recording sequence.
