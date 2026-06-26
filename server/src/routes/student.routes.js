import { Router } from 'express';
import * as studentController from '../controllers/student.controller.js';
import * as driveController from '../controllers/drive.controller.js';
import * as appController from '../controllers/application.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Student: Get my profile
router.get(
  '/me',
  authenticate,
  authorizeRoles('STUDENT'),
  studentController.getMyProfile
);

// Student: Get eligible/ineligible drives
router.get(
  '/me/drives',
  authenticate,
  authorizeRoles('STUDENT'),
  driveController.getDrivesForStudent
);

// Student: Get my applications
router.get(
  '/me/applications',
  authenticate,
  authorizeRoles('STUDENT'),
  appController.getMyApplications
);

export default router;
