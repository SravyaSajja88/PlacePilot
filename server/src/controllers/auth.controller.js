import * as authService from '../services/auth.service.js';
import prisma from '../utils/prisma.js';
import jwt from 'jsonwebtoken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax', 
  maxAge: 24 * 60 * 60 * 1000, 
};

export async function login (req,res,next) {
    try {
        const {email, password} = req.body;
        const result = await authService.loginUser(email, password);
        res.cookie('token', result.token, COOKIE_OPTIONS);
        res.json({
            success: true,
            data: {
                accessToken: result.token,
                requiresPasswordChange: result.user.mustChangePassword,
                user: result.user,
            },
            });
    }
    catch(err) {
        next(err);
    }
}

export async function changePassword(req, res, next) {
  try {
    const { newPassword } = req.body;
    await authService.changePassword(req.user.userId, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out' });
}


export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { student: true, officer: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userOut = {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    if (user.student) {
      userOut.student = {
        id: user.student.id,
        name: user.student.name,
        rollNo: user.student.rollNo,
        branch: user.student.branch,
        year: user.student.year,
        cgpa: user.student.cgpa,
        isPlaced: user.student.isPlaced,
      };
    }

    if (user.officer) {
      userOut.officer = {
        id: user.officer.id,
        name: user.officer.name,
        employeeId: user.officer.employeeId,
      };
    }

    res.json({
      success: true,
      data: {
        user: userOut,
      },
    });
  } catch (err) {
    next(err);
  }
}

