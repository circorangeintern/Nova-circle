const prisma = require('../config/db');
const {
  createReportSchema,
  updateReportSchema,
  updateStatusSchema,
} = require('../utils/validation');

// Valid forward transitions for the status flow:
// Reported → Acknowledged → In Progress → Resolved
const VALID_TRANSITIONS = {
  REPORTED: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
};

const statusHistoryInclude = {
  orderBy: { createdAt: 'asc' },
  include: {
    changedBy: {
      select: { id: true, name: true, jurisdiction: true },
    },
  },
};

const publicReportSelect = {
  id: true,
  title: true,
  category: true,
  severity: true,
  description: true,
  photoUrl: true,
  latitude: true,
  longitude: true,
  lga: true,
  state: true,
  address: true,
  confirmations: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

// ── Citizen ─────────────────────────────────────────────

// POST /api/reports  (multipart/form-data: photo + fields)
async function createReport(req, res, next) {
  try {
    const data = createReportSchema.parse(req.body);
    if (!req.file) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Photo is required' });
    }

    const report = await prisma.report.create({
      data: {
        ...data,
        photoUrl: `/uploads/${req.file.filename}`,
        citizenId: req.user.id,
      },
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/mine
async function myReports(req, res, next) {
  try {
    const reports = await prisma.report.findMany({
      where: { citizenId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/:id (owner only)
async function getMyReport(req, res, next) {
  try {
    const report = await prisma.report.findFirst({
      where: { id: req.params.id, citizenId: req.user.id },
      include: { statusHistory: statusHistoryInclude },
    });
    if (!report) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Report not found' });
    }
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reports/:id (owner only, while still REPORTED)
async function updateReport(req, res, next) {
  try {
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Report not found' });
    }
    if (existing.citizenId !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You can only edit your own reports' });
    }
    if (existing.status !== 'REPORTED') {
      return res.status(400).json({
        error: 'REPORT_LOCKED',
        message: 'This report can no longer be edited because an official has responded',
      });
    }

    const data = updateReportSchema.parse(req.body);
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(req.file && { photoUrl: `/uploads/${req.file.filename}` }),
      },
      include: { statusHistory: statusHistoryInclude },
    });
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/reports/:id (owner only, while still REPORTED)
async function deleteReport(req, res, next) {
  try {
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Report not found' });
    }
    if (existing.citizenId !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'You can only delete your own reports' });
    }
    if (existing.status !== 'REPORTED') {
      return res.status(400).json({
        error: 'REPORT_LOCKED',
        message: 'This report can no longer be deleted because an official has responded',
      });
    }

    await prisma.report.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Public ─────────────────────────────────────────────

// GET /api/public/reports?category=&status=&page=&limit=
async function listPublicReports(req, res, next) {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    const where = {
      ...(category && { category }),
      ...(status && { status }),
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: publicReportSelect,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.report.count({ where }),
    ]);

    res.status(200).json({ reports, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/public/reports/:id
async function getPublicReport(req, res, next) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      select: {
        ...publicReportSelect,
        statusHistory: statusHistoryInclude,
      },
    });
    if (!report) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Report not found' });
    }
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

// ── Government ─────────────────────────────────────────────

// GET /api/government/reports?jurisdiction=&status=&category=
async function listAssignedReports(req, res, next) {
  try {
    const { status, category } = req.query;
    const reports = await prisma.report.findMany({
      where: { ...(status && { status }), ...(category && { category }) },
      include: { citizen: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json({ reports });
  } catch (err) {
    next(err);
  }
}

// GET /api/government/reports/:id
async function getAssignedReport(req, res, next) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        citizen: { select: { id: true, name: true, email: true } },
        statusHistory: statusHistoryInclude,
      },
    });
    if (!report) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Report not found' });
    }
    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/government/reports/:id/status
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note } = updateStatusSchema.parse(req.body);

    const existing = await prisma.report.findUniqueOrThrow({ where: { id } });

    if (!VALID_TRANSITIONS[existing.status].includes(status)) {
      return res.status(400).json({
        error: 'INVALID_STATUS_TRANSITION',
        message: `Cannot move a report from ${existing.status} to ${status}`,
      });
    }

    const [report] = await prisma.$transaction([
      prisma.report.update({ where: { id }, data: { status } }),
      prisma.statusHistory.create({
        data: { reportId: id, status, note, changedById: req.user.id },
      }),
    ]);

    const statusHistory = await prisma.statusHistory.findMany({
      where: { reportId: id },
      ...statusHistoryInclude,
    });
    res.status(200).json({ report: { ...report, statusHistory } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReport,
  myReports,
  getMyReport,
  updateReport,
  deleteReport,
  listPublicReports,
  getPublicReport,
  listAssignedReports,
  getAssignedReport,
  updateReportStatus,
};
