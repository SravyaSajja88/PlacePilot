import prisma from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// Get current student profile
export async function getMyProfile(req, res, next) {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: { select: { email: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!student) throw new AppError('Profile not found', 404);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}
