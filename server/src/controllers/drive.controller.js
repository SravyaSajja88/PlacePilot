import prisma from '../utils/prisma.js';
import { checkEligibility } from '../services/eligibility.service.js';
import { AppError } from '../utils/AppError.js';

// Officer: Create drive
export async function createDrive(req, res, next) {
  try {
    const { companyName, roleName, ctcMin, ctcMax, location, jobType, description, minCgpa, allowedBranches, maxBacklogs, allowedYears } = req.body;
    const drive = await prisma.drive.create({
      data: {
        companyName,
        roleName,
        ctcMin,
        ctcMax,
        location,
        jobType,
        description,
        minCgpa,
        allowedBranches,
        maxBacklogs,
        allowedYears,
      },
    });
    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
}

// Officer: Get all drives (with search + filter)
export async function getAllDrives(req,res,next) {
    try{
        const { search, jobType, status, page = 1, limit = 10 } = req.query;
        const where = {};
        if(search) {
            where.OR = [
                {companyName: { contains: search, mode: 'insensitive' }},
                {roleName: { contains: search, mode: 'insensitive' }},
            ]
        }
        if(jobType) {
            where.jobType = jobType;
        }
        if(status) {
            where.status = status;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [drives, total] = await Promise.all([
        prisma.drive.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { applications: true } } },
        }),
        prisma.drive.count({ where }),
        ]);

        res.json({
        success: true,
        data: drives,
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


// Officer: Get single drive
export async function getDrive(req, res, next) {
  try {
    const drive = await prisma.drive.findUnique({
      where: { id: req.params.driveId },
      include: { _count: { select: { applications: true } } },
    });
    if (!drive) throw new AppError('Drive not found', 404);
    res.json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
}

// Officer: Update drive
export async function updateDrive(req, res, next) {
  try {
    const { id, _count, createdAt, updatedAt, ...updateData } = req.body;
    const drive = await prisma.drive.update({
      where: { id: req.params.driveId },
      data: updateData,
    });
    res.json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
}

// Officer: Delete drive
export async function deleteDrive(req, res, next) {
  try {
    await prisma.drive.delete({ where: { id: req.params.driveId } });
    res.json({ success: true, message: 'Drive deleted' });
  } catch (err) {
    next(err);
  }
}

// Student: Get eligible + ineligible drives
export async function getDrivesForStudent(req,res,next) {
  try {
    // get student record
    const student = await prisma.student.findUnique({
      where: {userId:req.user.userId},
    });
    if(!student) throw new AppError('Student profile not found',404);

    // get all drives
    const drives = await prisma.drive.findMany({
      where: {status:'ACTIVE'},
      orderBy: { createdAt:'desc'},
    });

    // Get student's already-applied drive IDs
    const applications = await prisma.application.findMany({
      where: {studentId: student.id},
      select: {driveId: true, currentStatus: true},
    });
    const appMap = Object.fromEntries(applications.map((a) => [a.driveId, a.currentStatus]));

    // Check Placement Policy
    const policy = await prisma.placementPolicy.findFirst();
    const isLocked = policy?.oneOfferLock && student.isPlaced;

    // Check eligibility for each drive
    const eligible = [];
    const ineligible = [];

    for(const drive of drives) {
      // If policy lock is on, everything is ineligible
      if(isLocked) {
        ineligible.push({ 
          ...drive, 
          reason: 'Policy Violation: One-offer lock is active and you are already placed.' 
        });
        continue;
      }
      //check elegibility with student record and drive criteria
      const check = checkEligibility(student, drive);
      if (check.eligible) {
        eligible.push({ ...drive, appliedStatus: appMap[drive.id] || null });
      } else {
        ineligible.push({ ...drive, reason: check.reason });
      }
    }
    res.json({ success: true, data: { eligible, ineligible } });

  }
  catch(err) {
    next(err);
  }
}

