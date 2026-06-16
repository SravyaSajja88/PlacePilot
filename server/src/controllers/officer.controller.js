import prisma from '../utils/prisma.js';
import { getAnalytics } from '../services/analytics.service.js';
import { AppError } from '../utils/AppError.js';

// Officer analytics dashboard
export async function getOfficerAnalytics(req, res, next) {
  try {
    const analytics = await getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
}

import bcrypt from 'bcryptjs';

// Create a new student (manual seeding)
export async function createStudent(req, res, next) {
  try {
    const { email, name, rollNo, branch, year, cgpa, activeBacklogs, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError('Email already registered', 409);

    const existingRoll = await prisma.student.findUnique({ where: { rollNo } });
    if (existingRoll) throw new AppError('Roll number already registered', 409);

    // Default password is roll number
    const hashed = await bcrypt.hash(rollNo, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'STUDENT',
        mustChangePassword: true,
        student: {
          create: {
            name,
            rollNo,
            branch,
            year: parseInt(year),
            cgpa: parseFloat(cgpa),
            activeBacklogs: parseInt(activeBacklogs) || 0,
            phone: phone || null,
          },
        },
      },
      include: { student: true },
    });

    res.status(201).json({ success: true, data: user.student });
  } catch (err) {
    next(err);
  }
}

// Get all students (with search + pagination)
export async function getAllStudents(req, res, next) {
  try {
    const { search, isPlaced, isActive = 'true', page = 1, limit = 20 } = req.query;
    const where = {};

    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isPlaced !== undefined) where.isPlaced = isPlaced === 'true';

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { rollNo: { contains: search, mode: 'insensitive' } },
        { branch: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { email: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      success: true,
      data: students,
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
// Deactivate / activate student
export async function toggleStudentActive(req, res, next) {
  try {
    const { studentId } = req.params;
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new AppError('Student not found', 404);

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { isActive: !student.isActive },
    });

    res.json({ success: true, data: { id: updated.id, isActive: updated.isActive } });
  } catch (err) {
    next(err);
  }
}

// Get single student with application history
export async function getStudentDetail(req, res, next) {
  try {
    const { studentId } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true, createdAt: true } },
        applications: {
          include: {
            drive: { select: { companyName: true, roleName: true } },
          },
          orderBy: { appliedAt: 'desc' },
        },
      },
    });
    if (!student) throw new AppError('Student not found', 404);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// Get / update placement policy
export async function getPolicy(req, res, next) {
  try {
    const policy = await prisma.placementPolicy.findFirst();
    res.json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
}

export async function updatePolicy(req, res, next) {
  try {
    const { oneOfferLock } = req.body;
    const policy = await prisma.placementPolicy.findFirst();
    if (!policy) throw new AppError('Policy not found', 404);

    const updated = await prisma.placementPolicy.update({
      where: { id: policy.id },
      data: { oneOfferLock: Boolean(oneOfferLock) },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
