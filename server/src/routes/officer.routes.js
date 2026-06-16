import { Router } from 'express';
import * as officerController from '../controllers/officer.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

const guard = [authenticate, authorizeRoles('OFFICER')];

router.get('/analytics', ...guard, officerController.getOfficerAnalytics);
router.get('/students', ...guard, officerController.getAllStudents);
router.post('/students', ...guard, officerController.createStudent);
router.get('/students/:studentId', ...guard, officerController.getStudentDetail);
router.patch('/students/:studentId/toggle-active', ...guard, officerController.toggleStudentActive);
router.get('/policy', ...guard, officerController.getPolicy);
router.patch('/policy', ...guard, officerController.updatePolicy);

export default router;
