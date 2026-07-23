const prisma = require('../config/db');
const { createReportSchema, updateStatusSchema } = require('../utils/validation');

// Valid forward transitions for the status flow:
// Reported → Acknowledged → In Progress → Resolved
const VALID_TRANSITIONS = {
  REPORTED: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
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
        select: {
          id: true, category: true, description: true, photoUrl: true,
          latitude: true, longitude: true, status: true, createdAt: true,
        },
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

// PATCH /api/government/reports/:id/status
async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

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
        data: { reportId: id, status, changedById: req.user.id },
      }),
    ]);

    res.status(200).json({ report });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReport,
  myReports,
  listPublicReports,
  listAssignedReports,
  updateReportStatus,
};
