// Shared demo data store (the "mock service layer").
// All portals read and write through these actions, so employer changes are
// immediately visible in the applicant portal. State is persisted to
// localStorage and synced across browser tabs. Replace the action bodies with
// API calls to connect a real backend.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  AppState, Application, Decision, DocumentKind, DocumentVersion, EmployerEvaluation,
  FeedbackAnnotation, FeedbackSentiment, FileSource, TextRange, User,
} from '../types';
import { createSeedState, SCHEMA_VERSION } from '../data/seed';
import { DECISION_META } from '../lib/labels';
import { uid } from '../lib/format';
import { clearFiles, deleteFile } from '../services/fileStore';

const KEY = 'employer-md:state';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.schemaVersion === SCHEMA_VERSION) return parsed;
    }
  } catch { /* corrupted or unavailable storage — fall back to seed */ }
  return createSeedState();
}

export class ActionError extends Error {}

export interface NewVersionInput {
  kind: DocumentKind;
  name: string;
  existingDocumentId?: string;
  fileName: string;
  fileSize: number;
  lines: string[];
  source: FileSource;
  makeCurrent: boolean;
}

export interface DraftInput {
  applicationId: string;
  documentVersionId: string;
  range: TextRange;
  quote: string;
  sentiment: FeedbackSentiment;
  reason: string;
  comment?: string;
}

function useStoreValue() {
  const [state, setState] = useState<AppState>(load);
  const ref = useRef(state);
  ref.current = state;
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); setStorageOk(true); } catch { setStorageOk(false); }
  }, [state]);

  // Keep multiple tabs (e.g. Maya in one, Dana in another) in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const next = JSON.parse(e.newValue) as AppState;
        // Each tab keeps its own signed-in user.
        setState((prev) => ({ ...next, currentUserId: prev.currentUserId }));
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (s: AppState) => AppState) => setState((prev) => fn(prev)), []);

  const log = (s: AppState, userId: string, text: string, link?: string): AppState => ({
    ...s, activity: [{ id: uid('act'), userId, at: new Date().toISOString(), text, link }, ...s.activity].slice(0, 60),
  });

  const actions = useMemo(() => ({
    loginAs(userId: string) { update((s) => ({ ...s, currentUserId: userId })); },
    logout() { update((s) => ({ ...s, currentUserId: null })); },

    addDocumentVersion(input: NewVersionInput): { documentId: string; versionId: string; versionNumber: number } {
      const s = ref.current;
      const userId = s.currentUserId!;
      const now = new Date().toISOString();
      const versionId = uid('ver');
      let documentId = input.existingDocumentId;
      let versionNumber = 1;
      if (documentId) {
        const doc = s.documents.find((d) => d.id === documentId);
        if (!doc) throw new ActionError('That document no longer exists.');
        versionNumber = Math.max(0, ...s.versions.filter((v) => v.documentId === documentId).map((v) => v.versionNumber)) + 1;
      } else {
        documentId = uid('doc');
      }
      const version: DocumentVersion = {
        id: versionId, documentId, versionNumber, uploadedAt: now, fileName: input.fileName,
        fileSize: input.fileSize, lines: input.lines, source: input.source,
      };
      const docId = documentId;
      update((st) => {
        const exists = st.documents.some((d) => d.id === docId);
        const documents = exists
          ? st.documents.map((d) => (d.id === docId ? { ...d, currentVersionId: input.makeCurrent ? versionId : d.currentVersionId } : d))
          : [...st.documents, { id: docId, ownerId: userId, kind: input.kind, name: input.name.trim(), currentVersionId: versionId, createdAt: now }];
        const name = exists ? st.documents.find((d) => d.id === docId)!.name : input.name.trim();
        return log({ ...st, documents, versions: [...st.versions, version] }, userId, `Uploaded ${name} (version ${versionNumber})`, `/applicant/history?doc=${docId}&version=${versionId}`);
      });
      return { documentId: docId, versionId, versionNumber };
    },

    setCurrentVersion(documentId: string, versionId: string) {
      update((s) => ({ ...s, documents: s.documents.map((d) => (d.id === documentId ? { ...d, currentVersionId: versionId } : d)) }));
    },

    renameDocument(documentId: string, name: string) {
      update((s) => ({ ...s, documents: s.documents.map((d) => (d.id === documentId ? { ...d, name: name.trim() } : d)) }));
    },

    /** Deletes a version that was never submitted. Removes the document if it was the last version. */
    deleteVersion(versionId: string) {
      const s = ref.current;
      if (s.applications.some((a) => a.resumeVersionId === versionId || a.coverLetterVersionId === versionId)) {
        throw new ActionError('This version was submitted with an application and is kept for your history.');
      }
      const v = s.versions.find((x) => x.id === versionId);
      if (!v) return;
      if (v.source.type === 'upload') void deleteFile(v.source.blobKey);
      update((st) => {
        const versions = st.versions.filter((x) => x.id !== versionId);
        const remaining = versions.filter((x) => x.documentId === v.documentId).sort((a, b) => b.versionNumber - a.versionNumber);
        const documents = remaining.length
          ? st.documents.map((d) => (d.id === v.documentId && d.currentVersionId === versionId ? { ...d, currentVersionId: remaining[0].id } : d))
          : st.documents.filter((d) => d.id !== v.documentId);
        return { ...st, versions, documents };
      });
    },

    submitApplication(input: { jobId: string; resumeVersionId: string; coverLetterVersionId?: string }): string {
      const s = ref.current;
      const userId = s.currentUserId!;
      if (s.applications.some((a) => a.jobId === input.jobId && a.applicantId === userId)) {
        throw new ActionError('You have already applied to this job.');
      }
      const job = s.jobs.find((j) => j.id === input.jobId)!;
      const app: Application = {
        id: uid('app'), jobId: input.jobId, applicantId: userId, resumeVersionId: input.resumeVersionId,
        coverLetterVersionId: input.coverLetterVersionId, submittedAt: new Date().toISOString(), status: 'submitted', reviewStatus: 'pending',
      };
      // Write to the ref immediately too, so a rapid double-click is still caught.
      ref.current = { ...s, applications: [...s.applications, app] };
      update((st) => log({ ...st, applications: [...st.applications, app] }, userId, `Applied to ${job.title} at ${job.company}`, '/applicant/applications'));
      if (job.employerId) {
        const applicant = s.users.find((u) => u.id === userId)!;
        update((st) => log(st, job.employerId!, `New application from ${applicant.name} for ${job.title}`, `/employer/review/${app.id}`));
      }
      return app.id;
    },

    markFeedbackViewed(applicationId: string) {
      update((s) => ({
        ...s,
        applications: s.applications.map((a) => (a.id === applicationId && a.evaluationId && !a.feedbackViewedAt ? { ...a, feedbackViewedAt: new Date().toISOString() } : a)),
      }));
    },

    saveDraft(input: DraftInput): string {
      const s = ref.current;
      const app = s.applications.find((a) => a.id === input.applicationId);
      if (!app) throw new ActionError('Application not found.');
      if (app.reviewStatus === 'reviewed') throw new ActionError('Feedback for this application was already sent.');
      const now = new Date().toISOString();
      const a: FeedbackAnnotation = { ...input, comment: input.comment?.trim() || undefined, id: uid('ann'), state: 'draft', authorId: s.currentUserId!, createdAt: now, updatedAt: now };
      update((st) => ({
        ...st,
        annotations: [...st.annotations, a],
        applications: st.applications.map((x) => (x.id === app.id
          ? { ...x, reviewStatus: 'in_progress', status: x.status === 'submitted' ? 'under_review' : x.status }
          : x)),
      }));
      return a.id;
    },

    updateDraft(id: string, patch: Partial<Pick<FeedbackAnnotation, 'sentiment' | 'reason' | 'comment'>>) {
      update((s) => ({
        ...s,
        annotations: s.annotations.map((a) => (a.id === id && a.state === 'draft'
          ? { ...a, ...patch, comment: patch.comment !== undefined ? patch.comment.trim() || undefined : a.comment, updatedAt: new Date().toISOString() }
          : a)),
      }));
    },

    deleteDraft(id: string) {
      update((s) => ({ ...s, annotations: s.annotations.filter((a) => !(a.id === id && a.state === 'draft')) }));
    },

    sendEvaluation(applicationId: string, decision: Decision, summary?: string): EmployerEvaluation {
      const s = ref.current;
      const app = s.applications.find((a) => a.id === applicationId);
      if (!app) throw new ActionError('Application not found.');
      if (app.reviewStatus === 'reviewed' || app.evaluationId) throw new ActionError('Feedback for this application was already sent.');
      const me = s.users.find((u) => u.id === s.currentUserId)!;
      const applicant = s.users.find((u) => u.id === app.applicantId)!;
      const drafts = s.annotations.filter((a) => a.applicationId === applicationId && a.state === 'draft');
      const now = new Date().toISOString();
      const ev: EmployerEvaluation = {
        id: uid('ev'), applicationId, employerId: me.id, reviewerName: me.name, reviewerCompany: me.company ?? '',
        decision, summary: summary?.trim() || undefined, sentAt: now,
        commentCount: drafts.length,
        positiveCount: drafts.filter((a) => a.sentiment === 'positive').length,
        improvementCount: drafts.filter((a) => a.sentiment === 'improvement').length,
      };
      const job = s.jobs.find((j) => j.id === app.jobId)!;
      const draftIds = new Set(drafts.map((d) => d.id));
      ref.current = { ...s, applications: s.applications.map((a) => (a.id === applicationId ? { ...a, evaluationId: ev.id, reviewStatus: 'reviewed' } : a)) };
      update((st) => {
        let next: AppState = {
          ...st,
          evaluations: [...st.evaluations, ev],
          annotations: st.annotations.map((a) => (draftIds.has(a.id) ? { ...a, state: 'sent', sentAt: now } : a)),
          applications: st.applications.map((a) => (a.id === applicationId
            ? { ...a, evaluationId: ev.id, reviewStatus: 'reviewed', status: DECISION_META[decision].resultingStatus, feedbackViewedAt: undefined }
            : a)),
        };
        next = log(next, me.id, `Sent feedback to ${applicant.name} — ${DECISION_META[decision].label}`, `/employer/review/${applicationId}/sent`);
        next = log(next, applicant.id, `${me.company} sent feedback on your ${job.title} application`, `/applicant/feedback/${applicationId}`);
        return next;
      });
      return ev;
    },

    addReason(sentiment: FeedbackSentiment, text: string) {
      const t = text.trim();
      if (!t) return;
      update((s) => (s.feedbackReasons[sentiment].some((r) => r.toLowerCase() === t.toLowerCase())
        ? s
        : { ...s, feedbackReasons: { ...s.feedbackReasons, [sentiment]: [...s.feedbackReasons[sentiment], t] } }));
    },

    removeReason(sentiment: FeedbackSentiment, text: string) {
      update((s) => ({ ...s, feedbackReasons: { ...s.feedbackReasons, [sentiment]: s.feedbackReasons[sentiment].filter((r) => r !== text) } }));
    },

    async resetDemo() {
      await clearFiles();
      const keepUser = ref.current.currentUserId;
      const fresh = { ...createSeedState(), currentUserId: keepUser };
      ref.current = fresh;
      setState(fresh);
    },
  }), [update]);

  const currentUser: User | null = state.users.find((u) => u.id === state.currentUserId) ?? null;
  return { state, actions, currentUser, storageOk };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

// ---------- Selectors ----------
export const sel = {
  job: (s: AppState, id: string) => s.jobs.find((j) => j.id === id),
  user: (s: AppState, id: string) => s.users.find((u) => u.id === id),
  version: (s: AppState, id?: string) => (id ? s.versions.find((v) => v.id === id) : undefined),
  document: (s: AppState, id: string) => s.documents.find((d) => d.id === id),
  docOfVersion: (s: AppState, versionId: string) => {
    const v = s.versions.find((x) => x.id === versionId);
    return v ? s.documents.find((d) => d.id === v.documentId) : undefined;
  },
  versionsOf: (s: AppState, documentId: string) =>
    s.versions.filter((v) => v.documentId === documentId).sort((a, b) => b.versionNumber - a.versionNumber),
  evaluation: (s: AppState, id?: string) => (id ? s.evaluations.find((e) => e.id === id) : undefined),
  /** Applicant-visible annotations: only those that were sent. */
  sentAnnotations: (s: AppState, applicationId: string) =>
    s.annotations.filter((a) => a.applicationId === applicationId && a.state === 'sent'),
  appsUsingVersion: (s: AppState, versionId: string) =>
    s.applications.filter((a) => a.resumeVersionId === versionId || a.coverLetterVersionId === versionId),
  employerApps: (s: AppState, employerId: string) => {
    const jobIds = new Set(s.jobs.filter((j) => j.employerId === employerId).map((j) => j.id));
    return s.applications.filter((a) => jobIds.has(a.jobId));
  },
};
