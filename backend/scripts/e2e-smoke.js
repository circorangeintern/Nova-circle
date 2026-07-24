require('dotenv').config();

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const baseUrl = (process.env.E2E_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const officialEmail = process.env.OFFICIAL_EMAIL;
const officialPassword = process.env.OFFICIAL_PASSWORD;
const imagePath = process.env.E2E_IMAGE || path.resolve(
  __dirname,
  '..',
  '..',
  'frontend',
  'public',
  'reports',
  'market-road-pothole.jpg',
);

const passed = [];

async function request(urlPath, { method = 'GET', token, body, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  let finalBody = body;

  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  });
  const data = response.status === 204
    ? null
    : await response.json().catch(() => ({}));

  return { status: response.status, data };
}

function check(name, condition) {
  assert.ok(condition, name);
  passed.push(name);
}

function reportForm(overrides = {}) {
  const values = {
    title: 'E2E road issue',
    category: 'ROAD',
    severity: 'HIGH',
    description: 'A verified road issue submitted during end-to-end testing.',
    latitude: '6.5008',
    longitude: '3.3486',
    lga: 'Surulere',
    state: 'Lagos',
    address: 'E2E Test Road',
    ...overrides,
  };
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) form.append(key, String(value));
  }
  return form;
}

async function addImage(form) {
  const image = await fs.promises.readFile(imagePath);
  form.append('photo', new Blob([image], { type: 'image/jpeg' }), 'evidence.jpg');
  return form;
}

async function main() {
  if (!officialEmail || !officialPassword) {
    throw new Error('Set OFFICIAL_EMAIL and OFFICIAL_PASSWORD to the seeded official credentials.');
  }

  const email = `e2e.${Date.now()}@example.com`;
  const initialPassword = 'CitizenPass123!';
  const newPassword = 'CitizenPass456!';

  let response = await request('/health');
  check('Health endpoint', response.status === 200 && response.data.status === 'ok');

  response = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'E2E Citizen', email, password: initialPassword },
  });
  check(
    'Citizen registration returns a JWT',
    response.status === 201 && response.data.token && response.data.user.role === 'CITIZEN',
  );
  const citizenToken = response.data.token;
  const citizenId = response.data.user.id;

  response = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Duplicate Citizen', email, password: initialPassword },
  });
  check('Duplicate registration is rejected', response.status === 409);

  response = await request('/api/auth/me', { token: citizenToken });
  check(
    'JWT session resolves the current user',
    response.status === 200 && response.data.user.id === citizenId,
  );

  response = await request('/api/auth/me');
  check(
    'Protected endpoint rejects a missing token',
    response.status === 401 && response.data.error === 'UNAUTHORIZED',
  );

  response = await request('/api/auth/me', {
    method: 'PATCH',
    token: citizenToken,
    body: { name: 'E2E Citizen Updated', defaultAnonymous: false },
  });
  check(
    'Citizen profile update',
    response.status === 200
      && response.data.user.name === 'E2E Citizen Updated'
      && response.data.user.defaultAnonymous === false,
  );

  response = await request('/api/reports', {
    method: 'POST',
    token: citizenToken,
    body: await addImage(reportForm()),
  });
  check(
    'Citizen creates a report with a real image upload',
    response.status === 201 && response.data.report.status === 'REPORTED',
  );
  const reportId = response.data.report.id;

  response = await request('/api/reports/mine', { token: citizenToken });
  check(
    'Citizen retrieves their persisted report',
    response.status === 200 && response.data.reports.some((report) => report.id === reportId),
  );

  response = await request(`/api/reports/${reportId}`, { token: citizenToken });
  check(
    'Citizen retrieves their report detail',
    response.status === 200 && response.data.report.id === reportId,
  );

  response = await request(`/api/reports/${reportId}`, {
    method: 'PATCH',
    token: citizenToken,
    body: reportForm({ description: 'Updated by the citizen before an official response.' }),
  });
  check(
    'Citizen edits an open report',
    response.status === 200
      && response.data.report.description === 'Updated by the citizen before an official response.',
  );

  response = await request('/api/public/reports?category=ROAD&status=REPORTED');
  check(
    'Public filtered report listing',
    response.status === 200 && response.data.reports.some((report) => report.id === reportId),
  );

  response = await request(`/api/public/reports/${reportId}`);
  check(
    'Public report detail hides citizen identity',
    response.status === 200
      && response.data.report.id === reportId
      && !Object.hasOwn(response.data.report, 'citizenId'),
  );

  response = await request('/api/analytics/summary');
  check(
    'Analytics summary reflects persisted reports',
    response.status === 200 && response.data.totalReports >= 1,
  );

  response = await request('/api/analytics/monthly?year=2026');
  check(
    'Monthly analytics returns all twelve months',
    response.status === 200 && response.data.year === 2026 && response.data.months.length === 12,
  );

  response = await request('/api/government/reports', { token: citizenToken });
  check(
    'Role enforcement rejects a citizen on an official route',
    response.status === 403 && response.data.error === 'FORBIDDEN',
  );

  response = await request('/api/auth/login', {
    method: 'POST',
    body: { email: officialEmail, password: officialPassword },
  });
  check(
    'Government official login',
    response.status === 200 && response.data.user.role === 'GOVERNMENT_OFFICIAL',
  );
  const officialToken = response.data.token;

  response = await request('/api/reports/mine', { token: officialToken });
  check(
    'Role enforcement rejects an official on a citizen route',
    response.status === 403 && response.data.error === 'FORBIDDEN',
  );

  response = await request('/api/government/reports', { token: officialToken });
  check(
    'Official retrieves the real citizen report',
    response.status === 200 && response.data.reports.some((report) => report.id === reportId),
  );

  response = await request(`/api/government/reports/${reportId}`, { token: officialToken });
  check(
    'Official retrieves report detail',
    response.status === 200 && response.data.report.id === reportId,
  );

  response = await request(`/api/government/reports/${reportId}/status`, {
    method: 'PATCH',
    token: officialToken,
    body: { status: 'RESOLVED' },
  });
  check(
    'Status workflow rejects skipped stages',
    response.status === 400 && response.data.error === 'INVALID_STATUS_TRANSITION',
  );

  response = await request(`/api/government/reports/${reportId}/status`, {
    method: 'PATCH',
    token: officialToken,
    body: { status: 'ACKNOWLEDGED', note: 'Inspection scheduled by E2E verification.' },
  });
  check(
    'Official advances the report workflow',
    response.status === 200 && response.data.report.status === 'ACKNOWLEDGED',
  );
  check(
    'Status update creates audit history',
    response.data.report.statusHistory.some(
      (entry) => entry.note === 'Inspection scheduled by E2E verification.',
    ),
  );

  response = await request(`/api/reports/${reportId}`, {
    method: 'PATCH',
    token: citizenToken,
    body: reportForm({ description: 'This edit must be rejected.' }),
  });
  check(
    'Citizen edits are locked after an official responds',
    response.status === 400 && response.data.error === 'REPORT_LOCKED',
  );

  for (const status of ['IN_PROGRESS', 'RESOLVED']) {
    response = await request(`/api/government/reports/${reportId}/status`, {
      method: 'PATCH',
      token: officialToken,
      body: { status, note: `Moved to ${status} by E2E verification.` },
    });
    check(`Official advances report to ${status}`, response.status === 200);
  }

  response = await request(`/api/public/reports/${reportId}`);
  check(
    'Official responses are visible publicly',
    response.status === 200
      && response.data.report.status === 'RESOLVED'
      && response.data.report.statusHistory.length === 3,
  );

  response = await request('/api/reports', {
    method: 'POST',
    token: citizenToken,
    body: await addImage(reportForm({ title: 'Disposable E2E report' })),
  });
  check('Citizen creates a second report', response.status === 201);
  const disposableReportId = response.data.report.id;

  response = await request(`/api/reports/${disposableReportId}`, {
    method: 'DELETE',
    token: citizenToken,
  });
  check('Citizen deletes their open report', response.status === 204);

  response = await request(`/api/public/reports/${disposableReportId}`);
  check('Deleted report is no longer public', response.status === 404);

  response = await request('/api/auth/password', {
    method: 'PATCH',
    token: citizenToken,
    body: { currentPassword: initialPassword, newPassword },
  });
  check('Authenticated password change', response.status === 200);

  response = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password: initialPassword },
  });
  check('Old password is rejected', response.status === 401);

  response = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password: newPassword },
  });
  check(
    'New password login succeeds',
    response.status === 200 && response.data.user.id === citizenId,
  );
  const refreshedCitizenToken = response.data.token;

  response = await request('/api/auth/me', {
    method: 'DELETE',
    token: refreshedCitizenToken,
  });
  check('Citizen deletes their account', response.status === 204);

  response = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password: newPassword },
  });
  check('Deleted account can no longer log in', response.status === 401);

  console.log(`E2E PASS: ${passed.length} checks`);
  passed.forEach((name, index) => console.log(`${index + 1}. ${name}`));
}

main().catch((error) => {
  console.error(`E2E FAIL: ${error.message}`);
  process.exitCode = 1;
});
