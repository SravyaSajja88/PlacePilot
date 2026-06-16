import prisma from '../utils/prisma.js';
import { AppError } from '../utils/AppError.js';

// State machine — defines all legal transitions
export const VALID_TRANSITIONS = {
  APPLIED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['TECHNICAL', 'REJECTED', 'WITHDRAWN'],
  TECHNICAL: ['HR', 'REJECTED', 'WITHDRAWN'],
  HR: ['OFFER_MADE', 'REJECTED', 'WITHDRAWN'],
  OFFER_MADE: ['OFFER_ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  OFFER_ACCEPTED: [], // terminal
  REJECTED: [],       // terminal
  WITHDRAWN: [],      // terminal
};

/**
 * Advance an application through the hiring pipeline.
 * Wraps DB operations in a single Prisma transaction:
 *   1. Update application status
 *   2. Mark student as placed (if OFFER_ACCEPTED)
 *   3. AUTO-CLEANUP: Withdraw all other applications if OFFER_ACCEPTED
 *   4. Insert append-only audit event
 */
export async function advanceApplication(applicationId, toStatus, changedById, note = null) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { student: true },
  });

  if (!application) throw new AppError('Application not found', 404);

  // Validate transition
  const allowed = VALID_TRANSITIONS[application.currentStatus];
  if (!allowed.includes(toStatus)) {
    throw new AppError(
      `Invalid transition: ${application.currentStatus} → ${toStatus}. Allowed: [${allowed.join(', ')}]`,
      400
    );
  }

  // Atomic transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update the target application
    await tx.application.update({
      where: { id: applicationId },
      data: { currentStatus: toStatus },
    });

    // 2. Handle placements and cleanup
    if (toStatus === 'OFFER_ACCEPTED') {
      // Mark student as placed
      await tx.student.update({
        where: { id: application.studentId },
        data: { isPlaced: true },
      });

      // Find all OTHER active applications
      const otherApps = await tx.application.findMany({
        where: {
          studentId: application.studentId,
          id: { not: applicationId },
          currentStatus: { notIn: ['REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED'] },
        },
      });

      // Withdraw them all
      if (otherApps.length > 0) {
        const cleanupNote = 'System: Automatically withdrawn due to acceptance of another offer.';
        
        await tx.application.updateMany({
          where: { id: { in: otherApps.map((a) => a.id) } },
          data: { currentStatus: 'WITHDRAWN' },
        });

        // Add history events for the cleaned up apps
        await tx.applicationEvent.createMany({
          data: otherApps.map((a) => ({
            applicationId: a.id,
            fromStatus: a.currentStatus,
            toStatus: 'WITHDRAWN',
            changedById,
            note: cleanupNote,
          })),
        });
      }
    }

    // 3. Insert audit event for the main transition
    await tx.applicationEvent.create({
      data: {
        applicationId,
        fromStatus: application.currentStatus,
        toStatus,
        changedById,
        note,
      },
    });
  });

  return { success: true, from: application.currentStatus, to: toStatus };
}
