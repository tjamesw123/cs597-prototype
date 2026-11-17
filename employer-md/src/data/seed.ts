// Realistic sample data for the class demonstration.
// Every person, company and piece of feedback here is fictional.
import type {
  ActivityItem,
  AppState,
  Application,
  Document,
  DocumentVersion,
  EmployerEvaluation,
  FeedbackAnnotation,
  FeedbackSentiment,
  Job,
  User,
} from '../types';
import sampleDocs from './sampleDocuments.json';
import { rangeForQuote } from '../lib/textRange';

export const SCHEMA_VERSION = 3;

type SampleKey = keyof typeof sampleDocs;
const lines = (k: SampleKey) => [...sampleDocs[k].lines];
export const DEMO_UPLOAD = {
  url: `samples/${sampleDocs['demo-upload-maya-office'].fileName}`,
  fileName: sampleDocs['demo-upload-maya-office'].fileName,
};

export const DEFAULT_REASONS = {
  positive: ['Relevant experience', 'Strong technical skills', 'Clear accomplishments', 'Good project description'],
  improvement: ['Too vague', 'Missing measurable outcomes', 'Unclear responsibilities', 'Missing relevant skills', 'Needs more detail'],
};

const users: User[] = [
  { id: 'u-maya', name: 'Maya Shah', firstName: 'Maya', role: 'applicant', email: 'maya.shah@example.edu', title: 'Graduate student, Information Systems', isDemo: true },
  { id: 'u-dana', name: 'Dana Miller', firstName: 'Dana', role: 'employer', email: 'dana.miller@northbridge.example', title: 'Hiring Manager', company: 'Northbridge Partners', isDemo: true },
  { id: 'u-jordan', name: 'Jordan Lee', firstName: 'Jordan', role: 'applicant', email: 'jordan.lee@example.edu', title: 'Undergraduate, Communication', isDemo: true },
  { id: 'u-priya', name: 'Priya Raman', firstName: 'Priya', role: 'applicant', email: 'priya.raman@example.edu', title: 'Undergraduate, Business Analytics', isDemo: true },
  { id: 'u-marcus', name: 'Marcus Bell', firstName: 'Marcus', role: 'applicant', email: 'marcus.bell@example.edu', title: 'Graduate student, Marketing Analytics', isDemo: true },
  { id: 'u-elena', name: 'Elena Ortiz', firstName: 'Elena', role: 'applicant', email: 'elena.ortiz@example.edu', title: 'Recent graduate, Statistics', isDemo: true },
  { id: 'u-sam', name: 'Sam Okafor', firstName: 'Sam', role: 'applicant', email: 'sam.okafor@example.edu', title: 'Recent graduate, English', isDemo: true },
];

const jobs: Job[] = [
  {
    id: 'j-nb-office', company: 'Northbridge Partners', title: 'Office Intern', location: 'Jersey City, NJ', workplace: 'Hybrid',
    employmentType: 'Internship', postedAt: '2026-10-28', deadline: '2026-12-15', feedbackParticipant: true, feedbackWindowDays: 10, employerId: 'u-dana',
    description: 'Support a 40-person consulting office with scheduling, records management, vendor coordination and front-desk coverage. Spring semester, 15–20 hours per week.',
    qualifications: ['Comfortable with Microsoft Office or Google Workspace', 'Organized, dependable communicator', 'Experience in an office, campus job or customer-facing role', 'Currently enrolled or graduated within the last year'],
  },
  {
    id: 'j-nb-marketing', company: 'Northbridge Partners', title: 'Marketing Analyst Intern', location: 'Jersey City, NJ', workplace: 'Hybrid',
    employmentType: 'Internship', postedAt: '2026-10-01', deadline: '2026-12-01', feedbackParticipant: true, feedbackWindowDays: 10, employerId: 'u-dana',
    description: 'Measure campaign performance, maintain dashboards and help the marketing team turn engagement data into weekly recommendations.',
    qualifications: ['Coursework or experience in marketing analytics', 'Excel; SQL or R/Python is a plus', 'Clear written communication'],
  },
  {
    id: 'j-nb-data', company: 'Northbridge Partners', title: 'Junior Data Analyst', location: 'New York, NY', workplace: 'Hybrid',
    employmentType: 'Full-time', postedAt: '2026-11-02', deadline: '2027-01-10', feedbackParticipant: true, feedbackWindowDays: 14, employerId: 'u-dana',
    description: 'Join the client insights team to clean, analyze and report on operational data for consulting engagements.',
    qualifications: ['Bachelor’s degree in a quantitative field', 'SQL and one of Python or R', 'Experience presenting findings to non-technical audiences'],
  },
  {
    id: 'j-brightline', company: 'Brightline Analytics', title: 'Data Analyst Intern', location: 'Hoboken, NJ', workplace: 'On-site',
    employmentType: 'Internship', postedAt: '2026-06-01', deadline: '2026-07-31', feedbackParticipant: true, feedbackWindowDays: 14,
    description: 'Summer analytics internship supporting retail clients with weekly sales reporting.',
    qualifications: ['SQL', 'A visualization tool such as Tableau or Power BI', 'Statistics coursework'],
  },
  {
    id: 'j-harbor', company: 'Harbor Health', title: 'Operations Intern', location: 'Newark, NJ', workplace: 'On-site',
    employmentType: 'Internship', postedAt: '2026-08-15', deadline: '2026-09-30', feedbackParticipant: true, feedbackWindowDays: 10,
    description: 'Help clinic operations managers track supplies, schedules and patient-flow metrics across three locations.',
    qualifications: ['Excel', 'Detail-oriented', 'Interest in healthcare operations'],
  },
  {
    id: 'j-atlas', company: 'Atlas Robotics', title: 'Product Intern', location: 'Remote (US)', workplace: 'Remote',
    employmentType: 'Internship', postedAt: '2026-09-15', deadline: '2026-10-15', feedbackParticipant: true, feedbackWindowDays: 7,
    description: 'Work with product managers to synthesize customer feedback and maintain the product roadmap tracker.',
    qualifications: ['Strong written communication', 'Comfort with spreadsheets and dashboards', 'Curiosity about hardware products'],
  },
  {
    id: 'j-lumen', company: 'Lumen Labs', title: 'Research Assistant (Data)', location: 'Princeton, NJ', workplace: 'Hybrid',
    employmentType: 'Part-time', postedAt: '2026-10-05', deadline: '2026-11-30', feedbackParticipant: true, feedbackWindowDays: 21,
    description: 'Assist a user-research team with survey data cleaning, coding open-ended responses and preparing charts for reports.',
    qualifications: ['Python or R', 'Survey or research experience', 'Careful documentation habits'],
  },
  {
    id: 'j-civic', company: 'Civic Commons', title: 'Program Coordinator Intern', location: 'Trenton, NJ', workplace: 'On-site',
    employmentType: 'Internship', postedAt: '2026-02-01', deadline: '2026-03-15', feedbackParticipant: true, feedbackWindowDays: 14,
    description: 'Coordinate volunteer schedules and event logistics for community programs.',
    qualifications: ['Event or volunteer coordination experience', 'Google Workspace'],
  },
  {
    id: 'j-riverstone', company: 'Riverstone Bank', title: 'Finance Operations Intern', location: 'Morristown, NJ', workplace: 'On-site',
    employmentType: 'Internship', postedAt: '2026-11-08', feedbackParticipant: true, feedbackWindowDays: 14,
    description: 'Reconcile daily transaction reports and help document process improvements for the operations team. Rolling applications.',
    qualifications: ['Excel (pivot tables, lookups)', 'Accounting or finance coursework', 'High attention to detail'],
  },
  {
    id: 'j-greenway', company: 'Greenway Transit', title: 'UX Research Intern', location: 'Newark, NJ', workplace: 'Hybrid',
    employmentType: 'Internship', postedAt: '2026-11-01', deadline: '2026-12-20', feedbackParticipant: true, feedbackWindowDays: 10,
    description: 'Plan and run rider interviews and usability tests for the trip-planning app; synthesize findings for the design team.',
    qualifications: ['HCI or UX coursework', 'Interviewing or usability testing experience', 'Clear synthesis and presentation skills'],
  },
];

const sample = (id: SampleKey, documentId: string, versionNumber: number, uploadedAt: string): DocumentVersion => ({
  id, documentId, versionNumber, uploadedAt,
  fileName: sampleDocs[id].fileName,
  lines: lines(id),
  source: { type: 'sample', url: `samples/${id}.pdf` },
});

const versions: DocumentVersion[] = [
  sample('ver-maya-gen-1', 'doc-maya-general', 1, '2026-02-10T15:20:00Z'),
  sample('ver-maya-gen-2', 'doc-maya-general', 2, '2026-06-14T18:05:00Z'),
  sample('ver-maya-gen-3', 'doc-maya-general', 3, '2026-09-02T13:40:00Z'),
  sample('ver-maya-data-1', 'doc-maya-data', 1, '2026-08-20T20:10:00Z'),
  sample('ver-maya-cover-1', 'doc-maya-cover', 1, '2026-03-01T16:00:00Z'),
  sample('ver-maya-cover-2', 'doc-maya-cover', 2, '2026-09-03T14:30:00Z'),
  sample('ver-jordan-1', 'doc-jordan', 1, '2026-11-04T22:00:00Z'),
  sample('ver-priya-1', 'doc-priya', 1, '2026-11-02T17:00:00Z'),
  sample('ver-marcus-1', 'doc-marcus', 1, '2026-10-19T15:00:00Z'),
  sample('ver-elena-1', 'doc-elena', 1, '2026-11-09T19:00:00Z'),
  sample('ver-sam-1', 'doc-sam', 1, '2026-10-17T14:00:00Z'),
];

const documents: Document[] = [
  { id: 'doc-maya-general', ownerId: 'u-maya', kind: 'resume', name: 'General Resume', currentVersionId: 'ver-maya-gen-3', createdAt: '2026-02-10T15:20:00Z' },
  { id: 'doc-maya-data', ownerId: 'u-maya', kind: 'resume', name: 'Data Analyst Resume', currentVersionId: 'ver-maya-data-1', createdAt: '2026-08-20T20:10:00Z' },
  { id: 'doc-maya-cover', ownerId: 'u-maya', kind: 'cover_letter', name: 'Cover Letter — General', currentVersionId: 'ver-maya-cover-2', createdAt: '2026-03-01T16:00:00Z' },
  { id: 'doc-jordan', ownerId: 'u-jordan', kind: 'resume', name: 'Resume', currentVersionId: 'ver-jordan-1', createdAt: '2026-11-04T22:00:00Z' },
  { id: 'doc-priya', ownerId: 'u-priya', kind: 'resume', name: 'Resume', currentVersionId: 'ver-priya-1', createdAt: '2026-11-02T17:00:00Z' },
  { id: 'doc-marcus', ownerId: 'u-marcus', kind: 'resume', name: 'Resume', currentVersionId: 'ver-marcus-1', createdAt: '2026-10-19T15:00:00Z' },
  { id: 'doc-elena', ownerId: 'u-elena', kind: 'resume', name: 'Resume', currentVersionId: 'ver-elena-1', createdAt: '2026-11-09T19:00:00Z' },
  { id: 'doc-sam', ownerId: 'u-sam', kind: 'resume', name: 'Resume', currentVersionId: 'ver-sam-1', createdAt: '2026-10-17T14:00:00Z' },
];

const applications: Application[] = [
  { id: 'a-maya-brightline', jobId: 'j-brightline', applicantId: 'u-maya', resumeVersionId: 'ver-maya-gen-2', submittedAt: '2026-07-08T14:00:00Z', status: 'rejected', reviewStatus: 'reviewed', evaluationId: 'ev-brightline', feedbackViewedAt: '2026-07-25T12:00:00Z' },
  { id: 'a-maya-harbor', jobId: 'j-harbor', applicantId: 'u-maya', resumeVersionId: 'ver-maya-gen-3', coverLetterVersionId: 'ver-maya-cover-2', submittedAt: '2026-09-10T15:30:00Z', status: 'under_review', reviewStatus: 'reviewed', evaluationId: 'ev-harbor' },
  { id: 'a-maya-atlas', jobId: 'j-atlas', applicantId: 'u-maya', resumeVersionId: 'ver-maya-gen-3', submittedAt: '2026-10-02T16:10:00Z', status: 'interview_invited', reviewStatus: 'reviewed', evaluationId: 'ev-atlas', feedbackViewedAt: '2026-10-12T10:00:00Z', statusNote: 'Atlas Robotics marked this application as Interview Invited on Oct 14. In a live deployment the employer would contact you directly to schedule; this prototype does not send email.' },
  { id: 'a-maya-lumen', jobId: 'j-lumen', applicantId: 'u-maya', resumeVersionId: 'ver-maya-data-1', submittedAt: '2026-10-21T19:45:00Z', status: 'submitted', reviewStatus: 'pending' },
  { id: 'a-maya-civic', jobId: 'j-civic', applicantId: 'u-maya', resumeVersionId: 'ver-maya-gen-1', coverLetterVersionId: 'ver-maya-cover-1', submittedAt: '2026-03-05T13:00:00Z', status: 'closed', reviewStatus: 'pending', statusNote: 'The employer closed this posting after the position was filled. No evaluation was recorded.' },
  { id: 'a-jordan-office', jobId: 'j-nb-office', applicantId: 'u-jordan', resumeVersionId: 'ver-jordan-1', submittedAt: '2026-11-05T15:00:00Z', status: 'submitted', reviewStatus: 'pending' },
  { id: 'a-priya-office', jobId: 'j-nb-office', applicantId: 'u-priya', resumeVersionId: 'ver-priya-1', submittedAt: '2026-11-03T18:20:00Z', status: 'under_review', reviewStatus: 'in_progress' },
  { id: 'a-elena-data', jobId: 'j-nb-data', applicantId: 'u-elena', resumeVersionId: 'ver-elena-1', submittedAt: '2026-11-10T14:15:00Z', status: 'submitted', reviewStatus: 'pending' },
  { id: 'a-marcus-marketing', jobId: 'j-nb-marketing', applicantId: 'u-marcus', resumeVersionId: 'ver-marcus-1', submittedAt: '2026-10-20T16:00:00Z', status: 'under_review', reviewStatus: 'reviewed', evaluationId: 'ev-marcus' },
  { id: 'a-sam-marketing', jobId: 'j-nb-marketing', applicantId: 'u-sam', resumeVersionId: 'ver-sam-1', submittedAt: '2026-10-18T13:30:00Z', status: 'rejected', reviewStatus: 'reviewed', evaluationId: 'ev-sam' },
];

let annCounter = 0;
function ann(
  applicationId: string, versionId: string, quote: string, sentiment: FeedbackSentiment, reason: string,
  comment: string | undefined, state: 'draft' | 'sent', authorId: string, at: string,
): FeedbackAnnotation {
  const v = versions.find((x) => x.id === versionId)!;
  const range = rangeForQuote(v.lines, quote);
  if (!range) throw new Error(`Seed quote not found in ${versionId}: ${quote}`);
  annCounter += 1;
  return {
    id: `ann-seed-${annCounter}`, applicationId, documentVersionId: versionId, range, quote, sentiment, reason,
    comment, state, authorId, createdAt: at, updatedAt: at, sentAt: state === 'sent' ? at : undefined,
  };
}

const EXT = 'sample-reviewer';
const annotations: FeedbackAnnotation[] = [
  ann('a-maya-brightline', 'ver-maya-gen-2', 'Built a Google Sheets dashboard summarizing responses from a student survey.', 'improvement', 'Missing measurable outcomes', 'How many responses did it cover, and who used the dashboard? Scale and impact would make this project stand out for an analyst role.', 'sent', EXT, '2026-07-22T15:00:00Z'),
  ann('a-maya-brightline', 'ver-maya-gen-2', 'Coordinated weekend donation intake with a team of 6 volunteers.', 'positive', 'Relevant experience', 'Shows you can coordinate people and keep a process running reliably.', 'sent', EXT, '2026-07-22T15:00:00Z'),
  ann('a-maya-brightline', 'ver-maya-gen-2', 'Excel (pivot tables), Google Sheets, SQL basics, Microsoft Office, scheduling', 'improvement', 'Missing relevant skills', 'For this internship we required a visualization tool such as Tableau or Power BI.', 'sent', EXT, '2026-07-22T15:00:00Z'),
  ann('a-maya-harbor', 'ver-maya-gen-3', 'Responsible for handling various administrative tasks for the department.', 'improvement', 'Unclear responsibilities', 'Which tasks? Name two or three specific responsibilities (for example scheduling, records or purchasing).', 'sent', EXT, '2026-10-01T14:00:00Z'),
  ann('a-maya-harbor', 'ver-maya-gen-3', 'Reduced catalog backlog by 30% by verifying 1,200 records over one semester.', 'positive', 'Clear accomplishments', 'Specific and measurable — exactly the kind of detail we look for.', 'sent', EXT, '2026-10-01T14:00:00Z'),
  ann('a-maya-harbor', 'ver-maya-gen-3', 'Coordinated weekend donation intake with 6 volunteers, serving ~150 families monthly.', 'positive', 'Relevant experience', undefined, 'sent', EXT, '2026-10-01T14:00:00Z'),
  ann('a-maya-atlas', 'ver-maya-gen-3', 'Built a Google Sheets dashboard summarizing 600+ student survey responses.', 'positive', 'Good project description', 'Clear scope and scale; relevant to synthesizing customer feedback.', 'sent', EXT, '2026-10-11T17:00:00Z'),
  ann('a-maya-atlas', 'ver-maya-gen-3', 'Prepare weekly enrollment reports for 3 faculty members using Excel.', 'improvement', 'Needs more detail', 'Mention what decisions these reports supported — that shows product thinking.', 'sent', EXT, '2026-10-11T17:00:00Z'),
  ann('a-priya-office', 'ver-priya-1', 'Managed patient scheduling for 3 dentists using Dentrix.', 'positive', 'Relevant experience', 'Directly relevant to our front-office scheduling work.', 'draft', 'u-dana', '2026-11-12T15:30:00Z'),
  ann('a-priya-office', 'ver-priya-1', 'Worked on many different projects across the office.', 'improvement', 'Too vague', 'Name one or two of the projects and what you delivered.', 'draft', 'u-dana', '2026-11-12T15:35:00Z'),
  ann('a-marcus-marketing', 'ver-marcus-1', 'Grew Instagram engagement 45% in six months with a weekly content calendar.', 'positive', 'Clear accomplishments', undefined, 'sent', 'u-dana', '2026-11-04T16:00:00Z'),
  ann('a-marcus-marketing', 'ver-marcus-1', 'Ran A/B tests on 12 email campaigns; best variant lifted open rate by 8 points.', 'positive', 'Strong technical skills', 'Experimentation experience is a strong match for this role.', 'sent', 'u-dana', '2026-11-04T16:00:00Z'),
  ann('a-marcus-marketing', 'ver-marcus-1', 'Google Analytics, HubSpot, R, Excel, Canva', 'improvement', 'Missing relevant skills', 'SQL would help with our campaign data warehouse — worth adding if you have used it.', 'sent', 'u-dana', '2026-11-04T16:00:00Z'),
  ann('a-sam-marketing', 'ver-sam-1', 'Tutor students on essays and research papers.', 'improvement', 'Missing measurable outcomes', 'How many students per week, and what changed for them?', 'sent', 'u-dana', '2026-11-03T13:00:00Z'),
  ann('a-sam-marketing', 'ver-sam-1', 'Writing, editing, social media', 'improvement', 'Missing relevant skills', 'This role needs analytics tools (Excel, Google Analytics). Coursework or a small project would help.', 'sent', 'u-dana', '2026-11-03T13:00:00Z'),
];

function evalFor(id: string, applicationId: string, decision: EmployerEvaluation['decision'], reviewerName: string, reviewerCompany: string, employerId: string, sentAt: string, summary?: string): EmployerEvaluation {
  const sent = annotations.filter((a) => a.applicationId === applicationId && a.state === 'sent');
  return {
    id, applicationId, decision, reviewerName, reviewerCompany, employerId, sentAt, summary,
    commentCount: sent.length,
    positiveCount: sent.filter((a) => a.sentiment === 'positive').length,
    improvementCount: sent.filter((a) => a.sentiment === 'improvement').length,
  };
}

const evaluations: EmployerEvaluation[] = [
  evalFor('ev-brightline', 'a-maya-brightline', 'reject', 'Hiring team (sample)', 'Brightline Analytics', EXT, '2026-07-22T15:00:00Z', 'Thank you for applying. We moved forward with candidates who had visualization tool experience.'),
  evalFor('ev-harbor', 'a-maya-harbor', 'consider', 'Hiring team (sample)', 'Harbor Health', EXT, '2026-10-01T14:00:00Z'),
  evalFor('ev-atlas', 'a-maya-atlas', 'strongly_consider', 'Hiring team (sample)', 'Atlas Robotics', EXT, '2026-10-11T17:00:00Z', 'Great fit for the role — strong, concrete examples.'),
  evalFor('ev-marcus', 'a-marcus-marketing', 'strongly_consider', 'Dana Miller', 'Northbridge Partners', 'u-dana', '2026-11-04T16:00:00Z'),
  evalFor('ev-sam', 'a-sam-marketing', 'reject', 'Dana Miller', 'Northbridge Partners', 'u-dana', '2026-11-03T13:00:00Z', 'Thank you for applying. Your writing background is strong, but this role needs analytics experience.'),
];

const activity: ActivityItem[] = [
  { id: 'act-1', userId: 'u-maya', at: '2026-10-21T19:45:00Z', text: 'Applied to Research Assistant (Data) at Lumen Labs', link: '/applicant/applications' },
  { id: 'act-2', userId: 'u-maya', at: '2026-10-14T13:00:00Z', text: 'Atlas Robotics changed your status to Interview Invited', link: '/applicant/feedback/a-maya-atlas' },
  { id: 'act-3', userId: 'u-maya', at: '2026-10-11T17:00:00Z', text: 'Atlas Robotics sent feedback on your application', link: '/applicant/feedback/a-maya-atlas' },
  { id: 'act-4', userId: 'u-maya', at: '2026-10-01T14:00:00Z', text: 'Harbor Health sent feedback on your application', link: '/applicant/feedback/a-maya-harbor' },
  { id: 'act-5', userId: 'u-dana', at: '2026-11-12T15:35:00Z', text: 'Saved 2 draft comments on Priya Raman’s application', link: '/employer/review/a-priya-office' },
  { id: 'act-6', userId: 'u-dana', at: '2026-11-04T16:00:00Z', text: 'Sent feedback to Marcus Bell — Strongly Consider', link: '/employer/history' },
  { id: 'act-7', userId: 'u-dana', at: '2026-11-03T13:00:00Z', text: 'Sent feedback to Sam Okafor — Reject', link: '/employer/history' },
];

export function createSeedState(): AppState {
  // Deep clone so callers can never mutate the module-level seed.
  return structuredClone({
    schemaVersion: SCHEMA_VERSION,
    currentUserId: null,
    users, jobs, documents, versions, applications, annotations, evaluations, activity,
    feedbackReasons: DEFAULT_REASONS,
  });
}
