import prisma from "../utils/prisma.js";    
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '24h' });
}

export async function loginUser(email,password) {
    const user = await prisma.user.findUnique({ 
        where : {email},
        include : {student : true, officer: true}})
    if(!user) {
        throw new AppError('Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if(!match) {
        throw new AppError('Invalid credentials', 401);
    }

    if (user.student && !user.student.isActive) {
        throw new AppError('Account is deactivated. Contact the placement officer.', 403);
    }

    const payload = { userId: user.id, role: user.role };
    const token = generateToken(payload);

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

    return { token, user: userOut };
}


export async function changePassword(userId, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const hashed = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
      mustChangePassword: false,
    },
  });
}