import { Router } from 'express';
import multer from 'multer';
import * as appController from '../controllers/application.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { advanceApplicationValidator } from '../validators/application.validators.js';
import { validate } from '../middleware/validate.middleware.js';
import { body } from 'express-validator';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

const router = Router();

// Student: Apply to a drive
router.post(
  '/',
  authenticate,
  authorizeRoles('STUDENT'),
  upload.single('resume'),
  [body('driveId').isUUID().withMessage('Invalid drive ID')],
  validate,
  appController.apply
);

// Student: Withdraw application
router.patch(
  '/:applicationId/withdraw',
  authenticate,
  authorizeRoles('STUDENT'),
  appController.withdrawApplication
);

// Student: Respond to offer
router.patch(
  '/:applicationId/respond',
  authenticate,
  authorizeRoles('STUDENT'),
  appController.respondToOffer
);

// Officer: Advance application status
router.patch(
  '/:applicationId/advance',
  authenticate,
  authorizeRoles('OFFICER'),
  advanceApplicationValidator,
  validate,
  appController.advanceStatus
);

// Officer: Get single application with history
router.get(
  '/:applicationId',
  authenticate,
  authorizeRoles('OFFICER'),
  appController.getApplicationWithHistory
);

export default router;
