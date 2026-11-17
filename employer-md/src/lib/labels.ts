import type { Application, ApplicationStatus, Decision, ReviewStatus } from '../types';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'indigo';

export const STATUS_META: Record<ApplicationStatus, { label: string; tone: Tone; description: string }> = {
  submitted: { label: 'Submitted', tone: 'neutral', description: 'Received by the employer; review has not started.' },
  under_review: { label: 'Under Review', tone: 'info', description: 'The employer is considering your application.' },
  interview_invited: { label: 'Interview Invited', tone: 'success', description: 'The employer has invited you to interview.' },
  rejected: { label: 'Rejected', tone: 'error', description: 'The employer is not moving forward with this application.' },
  closed: { label: 'Closed', tone: 'neutral', description: 'The posting was closed.' },
};

export const REVIEW_META: Record<ReviewStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Pending Review', tone: 'warning' },
  in_progress: { label: 'In Progress', tone: 'indigo' },
  reviewed: { label: 'Reviewed', tone: 'success' },
};

export const DECISIONS: Decision[] = ['strongly_consider', 'consider', 'unlikely', 'reject'];

export const DECISION_META: Record<Decision, {
  label: string; tone: Tone; employerHint: string; applicantMeaning: string; applicantAction: string; resultingStatus: ApplicationStatus;
}> = {
  strongly_consider: {
    label: 'Strongly Consider', tone: 'success',
    employerHint: 'Among the strongest applicants for this role. Does not schedule an interview.',
    applicantMeaning: 'The employer rated your application among the strongest for this role. This is an internal evaluation — it is not an interview invitation or a job offer.',
    applicantAction: 'No action required right now. If the employer invites you to interview, your status will change to “Interview Invited.”',
    resultingStatus: 'under_review',
  },
  consider: {
    label: 'Consider', tone: 'info',
    employerHint: 'A reasonable fit; keep in the pool for comparison.',
    applicantMeaning: 'The employer considers your application a reasonable fit and is keeping it in the candidate pool while they compare applicants. This is not an interview invitation.',
    applicantAction: 'No action required. You may review the improvement feedback to strengthen future applications.',
    resultingStatus: 'under_review',
  },
  unlikely: {
    label: 'Unlikely', tone: 'warning',
    employerHint: 'Probably not moving forward, but the application stays open.',
    applicantMeaning: 'The employer thinks your application is unlikely to advance for this role, but it has not been formally rejected.',
    applicantAction: 'Recommended: review the improvement feedback before applying to similar roles. Keep exploring other openings.',
    resultingStatus: 'under_review',
  },
  reject: {
    label: 'Reject', tone: 'error',
    employerHint: 'Not moving forward. Applicant status becomes Rejected.',
    applicantMeaning: 'The employer has decided not to move forward with your application for this role.',
    applicantAction: 'Recommended: read the feedback below and consider updating your resume before your next application.',
    resultingStatus: 'rejected',
  },
};

/** Applicant-facing "employer review" column, separate from the application status. */
export function applicantReviewLabel(app: Application): { label: string; tone: Tone } {
  if (app.status === 'closed' && !app.evaluationId) return { label: 'Not reviewed', tone: 'neutral' };
  if (app.evaluationId) return app.feedbackViewedAt ? { label: 'Feedback received', tone: 'success' } : { label: 'New feedback', tone: 'indigo' };
  return { label: 'Awaiting review', tone: 'warning' };
}

export function nextAction(app: Application): string {
  if (app.status === 'interview_invited') return 'Prepare for your interview';
  if (app.evaluationId && !app.feedbackViewedAt) return 'Read new employer feedback';
  if (app.status === 'rejected' && app.evaluationId) return 'Use feedback to update your resume';
  if (app.status === 'closed') return 'No action needed';
  if (app.evaluationId) return 'No action needed — wait for employer';
  return 'Wait for employer review';
}

export const needsAttention = (app: Application) =>
  app.status === 'interview_invited' || (!!app.evaluationId && !app.feedbackViewedAt);
