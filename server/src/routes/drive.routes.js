import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { createDriveValidator, updateDriveValidator } from '../validators/drive.validators.js';
import { validate } from '../middleware/validate.middleware.js';
import * as driveController from '../controllers/drive.controller.js';
import * as appController from '../controllers/application.controller.js';
const router = express.Router();
// Officer: CRUD operations
router.post(
  '/',
  authenticate,
  authorizeRoles('OFFICER'),
  createDriveValidator,
  validate,
  driveController.createDrive
);

router.get(
  '/',
  authenticate,
  authorizeRoles('OFFICER'),
  driveController.getAllDrives
);

router.get(
  '/:driveId',
  authenticate,
  authorizeRoles('OFFICER'),
  driveController.getDrive
);

router.patch(
  '/:driveId',
  authenticate,
  authorizeRoles('OFFICER'),
  updateDriveValidator,
  validate,
  driveController.updateDrive
);

// Officer: Get applicants for a drive
router.get(
  '/:driveId/applications',
  authenticate,
  authorizeRoles('OFFICER'),
  appController.getDriveApplicants
);

export default router;
