import prisma from '../utils/prisma.js';
import { checkEligibility } from '../services/eligibility.service.js';
import { AppError } from '../utils/AppError.js';


// Officer: Get all applicants for a drive
export async function getDriveApplicants(req, res, next) {
  try {
    const { driveId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const where = { driveId };
    if (status) where.currentStatus = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          student: {
            select: {
              name: true,
              rollNo: true,
              branch: true,
              year: true,
              cgpa: true,
              activeBacklogs: true,
              phone: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}