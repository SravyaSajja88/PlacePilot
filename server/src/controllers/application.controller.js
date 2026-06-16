import prisma from '../utils/prisma.js';
import { checkEligibility } from '../services/eligibility.service.js';
import { advanceApplication } from '../services/pipeline.service.js';
import { AppError } from '../utils/AppError.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Student: Apply to a drive
// Student: Apply to a drive
export const apply = async (req, res, next) => {
  try {
    const { driveId } = req.body;
    const userId = req.user.userId;

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) return next(new AppError('Student profile not found', 404));

    // 1. Check Placement Policy (One-Offer Lock)
    const policy = await prisma.placementPolicy.findFirst();
    if (policy?.oneOfferLock && student.isPlaced) {
      return next(new AppError('Policy Violation: One-offer lock is enabled and you are already placed.', 403));
    }

    // 2. Drive existence & status
    const drive = await prisma.drive.findUnique({ where: { id: driveId } });
    if (!drive || drive.status !== 'ACTIVE') {
      return next(new AppError('Drive is not active or found', 400));
    }

    // 3. Eligibility check
    const eligibility = checkEligibility(student, drive);
    if (!eligibility.eligible) {
      return next(new AppError(`Eligibility Failed: ${eligibility.reason}`, 400));
    }

    // 4. Duplicate check
    const existing = await prisma.application.findFirst({
      where: { studentId: student.id, driveId }
    });
    if (existing) return next(new AppError('You have already applied for this drive', 400));

    // 5. Resume Upload
    if (!req.file) return next(new AppError('Please provide a resume for this application', 400));
    if (req.file.mimetype !== 'application/pdf') {
      return next(new AppError('Only PDF files are allowed', 400));
    }

    const finalResumeUrl = await uploadToCloudinary(req.file.buffer);
    if (!finalResumeUrl || typeof finalResumeUrl !== 'string' || !finalResumeUrl.startsWith('https')) {
      return next(new AppError('Failed to upload resume', 500));
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        driveId,
        currentStatus: 'APPLIED',
        resumeUrl: finalResumeUrl,
        events: {
          create: { 
            fromStatus: 'APPLIED', 
            toStatus: 'APPLIED', 
            note: 'Initial application',
            changedById: userId 
          }
        }
      }
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// Student: Get my applications
export async function getMyApplications(req, res, next) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) throw new AppError('Student profile not found', 404);

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        drive: {
          select: {
            companyName: true,
            roleName: true,
            location: true,
            ctcMin: true,
            ctcMax: true,
            jobType: true,
          },
        },
        events: {
          orderBy: { changedAt: 'asc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

// Student: Withdraw application
export async function withdrawApplication(req, res, next) {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const student = await prisma.student.findUnique({ where: { userId } });

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppError('Application not found', 404);
    if (application.studentId !== student.id) throw new AppError('Forbidden', 403);

    await advanceApplication(applicationId, 'WITHDRAWN', userId, 'Student withdrew');
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    next(err);
  }
}

// Student: Accept or Reject Offer
export async function respondToOffer(req, res, next) {
  try {
    const { applicationId } = req.params;
    const { response } = req.body; // 'OFFER_ACCEPTED' or 'REJECTED'
    const userId = req.user.userId;

    if (!['OFFER_ACCEPTED', 'REJECTED'].includes(response)) {
      throw new AppError('Invalid response choice', 400);
    }

    const student = await prisma.student.findUnique({ where: { userId } });
    const application = await prisma.application.findUnique({ where: { id: applicationId } });

    if (!application) throw new AppError('Application not found', 404);
    if (application.studentId !== student.id) throw new AppError('Forbidden', 403);
    if (application.currentStatus !== 'OFFER_MADE') {
      throw new AppError('No offer to respond to', 400);
    }

    const result = await advanceApplication(applicationId, response, userId, `Student ${response.toLowerCase()}`);
    
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

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

// Officer: Advance application status
export async function advanceStatus(req, res, next) {
  try {
    const { applicationId } = req.params;
    const { toStatus, note } = req.body;

    const result = await advanceApplication(applicationId, toStatus, req.user.userId, note);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// Officer: Get single application with full event history
export async function getApplicationWithHistory(req, res, next) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.applicationId },
      include: {
        student: true,
        drive: true,
        events: {
          orderBy: { changedAt: 'asc' },
          include: {
            changedBy: { select: { email: true, role: true } },
          },
        },
      },
    });
    if (!application) throw new AppError('Application not found', 404);
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}


