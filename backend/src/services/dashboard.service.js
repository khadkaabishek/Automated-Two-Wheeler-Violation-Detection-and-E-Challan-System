import prisma from '../config/database.js';
import challanRepository from '../repositories/challan.repository.js';
import paymentRepository from '../repositories/payment.repository.js';
import violationRepository from '../repositories/violation.repository.js';

export const getSummary = async () => {
  const [totalUsers, totalVehicles, totalChallans, pendingChallans, paidChallans, revenueAgg] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.vehicle.count({ where: { deletedAt: null } }),
      prisma.challan.count({ where: { deletedAt: null } }),
      challanRepository.countByStatus('PENDING'),
      challanRepository.countByStatus('PAID'),
      paymentRepository.sumByStatus('SUCCESS'),
    ]);

  return {
    totalUsers,
    totalVehicles,
    totalChallans,
    pendingChallans,
    paidChallans,
    totalRevenue: Number(revenueAgg._sum.amount || 0),
  };
};

export const getMonthlyRevenue = async (year) => {
  const targetYear = year || new Date().getFullYear();
  const rows = await paymentRepository.monthlyRevenue(targetYear);
  // Normalize into 12 months, filling gaps with 0
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));
  rows.forEach((row) => {
    const idx = Number(row.month) - 1;
    if (months[idx]) months[idx].total = Number(row.total);
  });
  return { year: targetYear, months };
};

export const getDailyChallans = async (days = 30) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  const rows = await prisma.$queryRaw`
    SELECT DATE("created_at") AS date, COUNT(*) AS count
    FROM challans
    WHERE "created_at" BETWEEN ${start} AND ${end} AND "deleted_at" IS NULL
    GROUP BY DATE("created_at")
    ORDER BY date ASC
  `;

  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
};

export const getTopViolations = async () => {
  const grouped = await challanRepository.topViolations();
  const violationIds = grouped.map((g) => g.violationId);
  const violations = await violationRepository.findByIds(violationIds);
  const violationMap = new Map(violations.map((v) => [v.id, v]));

  return grouped.map((g) => ({
    violation: violationMap.get(g.violationId) || null,
    count: g._count._all,
  }));
};

export const getChallansByOfficer = async () => {
  const grouped = await challanRepository.groupByOfficer();
  const officerIds = grouped.map((g) => g.officerId);
  const officers = await prisma.user.findMany({
    where: { id: { in: officerIds } },
    select: { id: true, fullName: true, email: true },
  });
  const officerMap = new Map(officers.map((o) => [o.id, o]));

  return grouped
    .map((g) => ({
      officer: officerMap.get(g.officerId) || null,
      challanCount: g._count._all,
    }))
    .sort((a, b) => b.challanCount - a.challanCount);
};
