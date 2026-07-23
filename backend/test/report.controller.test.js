const test = require('node:test');
const assert = require('node:assert/strict');
const { invoke, mockCommonJsModule } = require('./helpers/controller');

const prisma = {
  report: {},
  statusHistory: {},
  $transaction: async (operations) => Promise.all(operations),
};

mockCommonJsModule(require.resolve('../src/config/db'), prisma);
const {
  createReport,
  updateReport,
  updateReportStatus,
} = require('../src/controllers/report.controller');

test('citizen report creation validates and persists the submitted business fields', async () => {
  let createInput;
  prisma.report.create = async ({ data }) => {
    createInput = data;
    return { id: 'report-1', status: 'REPORTED', ...data };
  };

  const res = await invoke(createReport, {
    user: { id: 'citizen-1', role: 'CITIZEN' },
    file: { filename: 'evidence.jpg' },
    body: {
      title: 'Flooded access road',
      category: 'ROAD',
      severity: 'HIGH',
      description: 'The road floods after every rainfall.',
      latitude: '6.5008',
      longitude: '3.3486',
      lga: 'Surulere',
      state: 'Lagos',
    },
  });

  assert.equal(res.statusCode, 201);
  assert.equal(createInput.citizenId, 'citizen-1');
  assert.equal(createInput.photoUrl, '/uploads/evidence.jpg');
  assert.equal(createInput.latitude, 6.5008);
  assert.equal(createInput.longitude, 3.3486);
  assert.equal(createInput.severity, 'HIGH');
});

test('official status updates allow only the next workflow state and save the audit note', async () => {
  let updateCalled = false;
  prisma.report.findUniqueOrThrow = async () => ({ id: 'report-1', status: 'REPORTED' });
  prisma.report.update = async ({ data }) => {
    updateCalled = true;
    return { id: 'report-1', status: data.status };
  };
  prisma.statusHistory.create = async ({ data }) => ({ id: 'history-1', ...data });
  prisma.statusHistory.findMany = async () => [{
    id: 'history-1',
    status: 'ACKNOWLEDGED',
    note: 'Inspection scheduled',
    changedBy: { id: 'official-1', name: 'Works Officer', jurisdiction: 'Surulere' },
  }];

  const invalid = await invoke(updateReportStatus, {
    params: { id: 'report-1' },
    user: { id: 'official-1', role: 'GOVERNMENT_OFFICIAL' },
    body: { status: 'RESOLVED' },
  });
  assert.equal(invalid.statusCode, 400);
  assert.equal(invalid.body.error, 'INVALID_STATUS_TRANSITION');
  assert.equal(updateCalled, false);

  const valid = await invoke(updateReportStatus, {
    params: { id: 'report-1' },
    user: { id: 'official-1', role: 'GOVERNMENT_OFFICIAL' },
    body: { status: 'ACKNOWLEDGED', note: 'Inspection scheduled' },
  });
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.body.report.status, 'ACKNOWLEDGED');
  assert.equal(valid.body.report.statusHistory[0].note, 'Inspection scheduled');
});

test('citizen edits are rejected after an official has responded', async () => {
  prisma.report.findUnique = async () => ({
    id: 'report-1',
    citizenId: 'citizen-1',
    status: 'ACKNOWLEDGED',
  });
  prisma.report.update = async () => {
    throw new Error('Locked reports must not be updated');
  };

  const res = await invoke(updateReport, {
    params: { id: 'report-1' },
    user: { id: 'citizen-1', role: 'CITIZEN' },
    body: { description: 'Attempted edit after acknowledgement' },
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'REPORT_LOCKED');
});
