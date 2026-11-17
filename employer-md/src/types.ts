// Core domain model for Employer.MD.
// The mock service layer (src/services) reads/writes these shapes; swap it for a
// real API later without touching UI components.

export type Role = 'applicant' | 'employer';

export interface User {
  id: string;
  name: string;
  firstName: string;
  role: Role;
  email: string;
  title: string;
  company?: string;
  /** Demo users are seeded sample accounts, never real people. */
  isDemo: boolean;
}

export type EmploymentType = 'Internship' | 'Full-time' | 'Part-time' | 'Contract';

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  workplace: 'On-site' | 'Hybrid' | 'Remote';
  employmentType: EmploymentType;
  description: string;
  qualifications: string[];
  deadline?: string; // ISO date
  postedAt: string;
  /** Employer has opted in to Employer.MD structured feedback. */
  feedbackParticipant: boolean;
  feedbackWindowDays?: number;
  /** Employer user who reviews applications for this job (if any in the demo). */
  employerId?: string;
}

export type DocumentKind = 'resume' | 'cover_letter';

export interface Document {
  id: string;
  ownerId: string;
  kind: DocumentKind;
  name: string;
  currentVersionId: string;
  createdAt: string;
}

export type FileSource =
  | { type: 'sample'; url: string }
  | { type: 'upload'; blobKey: string; persisted: boolean };

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  uploadedAt: string;
  fileName: string;
  fileSize?: number;
  /** Text lines extracted from the PDF. Highlights reference these lines. */
  lines: string[];
  source: FileSource;
  note?: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'interview_invited'
  | 'rejected'
  | 'closed';

export type ReviewStatus = 'pending' | 'in_progress' | 'reviewed';

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  /** Exact resume version submitted — never "latest". */
  resumeVersionId: string;
  coverLetterVersionId?: string;
  submittedAt: string;
  status: ApplicationStatus;
  reviewStatus: ReviewStatus;
  evaluationId?: string;
  /** When the applicant last opened their feedback; undefined = unread. */
  feedbackViewedAt?: string;
  statusNote?: string;
}

/** A character range inside a document version's extracted text lines. */
export interface TextRange {
  startLine: number;
  startOffset: number;
  endLine: number;
  endOffset: number; // exclusive
}

export type FeedbackSentiment = 'positive' | 'improvement';

export interface FeedbackAnnotation {
  id: string;
  applicationId: string;
  documentVersionId: string;
  range: TextRange;
  quote: string;
  sentiment: FeedbackSentiment;
  reason: string;
  comment?: string;
  state: 'draft' | 'sent';
  authorId: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

export type Decision = 'strongly_consider' | 'consider' | 'unlikely' | 'reject';

export interface EmployerEvaluation {
  id: string;
  applicationId: string;
  employerId: string;
  reviewerName: string;
  reviewerCompany: string;
  decision: Decision;
  summary?: string;
  commentCount: number;
  positiveCount: number;
  improvementCount: number;
  sentAt: string;
}

export interface FeedbackReasons {
  positive: string[];
  improvement: string[];
}

export interface AppState {
  schemaVersion: number;
  currentUserId: string | null;
  users: User[];
  jobs: Job[];
  documents: Document[];
  versions: DocumentVersion[];
  applications: Application[];
  annotations: FeedbackAnnotation[];
  evaluations: EmployerEvaluation[];
  feedbackReasons: FeedbackReasons;
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  userId: string;
  at: string;
  text: string;
  link?: string;
}
