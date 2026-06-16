import { body, param } from 'express-validator';

export const advanceApplicationValidator = [
  param('applicationId').isUUID().withMessage('Invalid application ID'),
  body('toStatus')
    .isIn([
      'SHORTLISTED',
      'TECHNICAL',
      'HR',
      'OFFER_MADE',
      'REJECTED',
    ])
    .withMessage('Invalid target status'),
  body('note').optional().isString().trim(),
];
