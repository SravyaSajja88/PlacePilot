/**
 * Eligibility engine — server-side only. Zero frontend filtering.
 * Returns { eligible: boolean, reason: string | null }
 */
export function checkEligibility(student, drive) {
  if (student.cgpa < drive.minCgpa) {
    return {
      eligible: false,
      reason: `CGPA ${student.cgpa} is below the required ${drive.minCgpa}`,
    };
  }

  if (!drive.allowedBranches.includes(student.branch)) {
    return {
      eligible: false,
      reason: `Branch "${student.branch}" is not eligible. Allowed: ${drive.allowedBranches.join(', ')}`,
    };
  }

  if (student.activeBacklogs > drive.maxBacklogs) {
    return {
      eligible: false,
      reason: `You have ${student.activeBacklogs} active backlog(s). Max allowed: ${drive.maxBacklogs}`,
    };
  }

  if (!drive.allowedYears.includes(student.year)) {
    return {
      eligible: false,
      reason: `Year ${student.year} is not eligible. Allowed: ${drive.allowedYears.join(', ')}`,
    };
  }

  return { eligible: true, reason: null };
}
