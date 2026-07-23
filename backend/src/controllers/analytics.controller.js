const prisma = require('../config/db');

// GET /api/analytics/summary
async function getSummary(req, res, next) {
  try {
    const [total, byCategory, byStatus, activeLgas] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({ by: ['category'], _count: true }),
      prisma.report.groupBy({ by: ['status'], _count: true }),
      prisma.report.findMany({
        where: { lga: { not: null } },
        distinct: ['lga'],
        select: { lga: true },
      }),
    ]);

    const mostReportedCategory = byCategory.sort((a, b) => b._count - a._count)[0]?.category || null;
    const responded = byStatus
      .filter((entry) => entry.status !== 'REPORTED')
      .reduce((sum, entry) => sum + entry._count, 0);

    res.status(200).json({
      totalReports: total,
      activeLgas: activeLgas.length,
      responseRate: total === 0 ? 0 : Math.round((responded / total) * 100),
      reportsByCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
      reportsByStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      mostReportedCategory,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/monthly?year=2026
async function getMonthlySummary(req, res, next) {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const reports = await prisma.report.findMany({
      where: { createdAt: { gte: start, lt: end } },
      select: { createdAt: true, status: true },
    });

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0, resolved: 0 }));
    reports.forEach((r) => {
      const m = r.createdAt.getUTCMonth();
      months[m].count += 1;
      if (r.status === 'RESOLVED') months[m].resolved += 1;
    });

    res.status(200).json({ year, months });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSummary, getMonthlySummary };
