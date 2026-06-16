import { body } from 'express-validator';

export const createDriveValidator = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('roleName').trim().notEmpty().withMessage('Role name is required'),
  body('ctcMin').isFloat({ min: 0 }).withMessage('CTC min must be a positive number'),
  body('ctcMax')
    .isFloat({ min: 0 })
    .withMessage('CTC max must be a positive number')
    .custom((val, { req }) => {
      if (parseFloat(val) < parseFloat(req.body.ctcMin)) {
        throw new Error('CTC max must be >= CTC min');
      }
      return true;
    }),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType')
    .isIn(['ON_SITE', 'REMOTE', 'HYBRID'])
    .withMessage('jobType must be ON_SITE, REMOTE, or HYBRID'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('minCgpa').isFloat({ min: 0, max: 10 }).withMessage('Min CGPA must be 0–10'),
  body('allowedBranches')
    .isArray({ min: 1 })
    .withMessage('allowedBranches must be a non-empty array'),
  body('maxBacklogs').isInt({ min: 0 }).withMessage('Max backlogs cannot be negative'),
  body('allowedYears')
    .isArray({ min: 1 })
    .withMessage('allowedYears must be a non-empty array'),
];

export const updateDriveValidator = [
  body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('roleName').optional().trim().notEmpty().withMessage('Role name cannot be empty'),
  body('ctcMin').optional().isFloat({ min: 0 }).withMessage('CTC min must be a positive number'),
  body('ctcMax').optional().isFloat({ min: 0 }).withMessage('CTC max must be a positive number'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('jobType')
    .optional()
    .isIn(['ON_SITE', 'REMOTE', 'HYBRID'])
    .withMessage('jobType must be ON_SITE, REMOTE, or HYBRID'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'CLOSED'])
    .withMessage('Status must be ACTIVE or CLOSED'),
  body('minCgpa').optional().isFloat({ min: 0, max: 10 }).withMessage('Min CGPA must be 0–10'),
  body('allowedBranches')
    .optional()
    .isArray({ min: 1 })
    .withMessage('allowedBranches must be a non-empty array'),
  body('maxBacklogs').optional().isInt({ min: 0 }).withMessage('Max backlogs cannot be negative'),
  body('allowedYears')
    .optional()
    .isArray({ min: 1 })
    .withMessage('allowedYears must be a non-empty array'),
];
