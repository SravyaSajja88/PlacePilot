import prisma from '../utils/prisma.js';

export async function getAnalytics() {
  const [
    totalStudents,
    placedStudents,
    totalDrives,
    activeDrives,
    totalApplications,
    ctcStats,
    applicationsByStatus,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.student.count({ where: { isPlaced: true } }),
    prisma.drive.count(),
    prisma.drive.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    // Average CTC from placed drives
    prisma.drive.aggregate({
      _avg: { ctcMin: true, ctcMax: true },
      where: {
        applications: {
          some: { currentStatus: 'OFFER_ACCEPTED' },
        },
      },
    }),
    // Applications grouped by status
    prisma.application.groupBy({
      by: ['currentStatus'],
      _count: { _all: true },
    }),
  ]);

  const placementRate =
    totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const avgCTC =
    ctcStats._avg.ctcMin && ctcStats._avg.ctcMax
      ? ((ctcStats._avg.ctcMin + ctcStats._avg.ctcMax) / 2).toFixed(2)
      : 0;

  const statusBreakdown = applicationsByStatus.reduce((acc, item) => {
    acc[item.currentStatus] = item._count._all;
    return acc;
  }, {});

  return {
    totalStudents,
    placedStudents,
    placementRate,
    totalDrives,
    activeDrives,
    totalApplications,
    avgCTC: parseFloat(avgCTC),
    statusBreakdown,
  };
}
