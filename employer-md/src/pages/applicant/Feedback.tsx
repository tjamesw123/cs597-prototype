import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ClipboardList, FileClock, FileText, Info, MessageSquareText, Quote } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, ButtonLink, Card, CardHeader, DemoTag, EmptyState, PageHeader, Segmented, inputCls } from '../../components/ui';
import { DocumentViewer } from '../../components/DocumentViewer';
import { FeedbackCard } from '../../components/FeedbackCard';
import { DECISION_META, STATUS_META } from '../../lib/labels';
import { fmtDate } from '../../lib/format';
import type { FeedbackAnnotation } from '../../types';
import NotFound from '../NotFound';

export const byPosition = (a: FeedbackAnnotation, b: FeedbackAnnotation) =>
  a.range.startLine - b.range.startLine || a.range.startOffset - b.range.startOffset;

export default function Feedback() {
  const { appId } = useParams();
  const { state, actions, currentUser } = useStore();
  const navigate = useNavigate();
  const me = currentUser!;
  const mine = state.applications.filter((a) => a.applicantId === me.id);
  const withFeedback = mine.filter((a) => a.evaluationId)
    .sort((a, b) => (sel.evaluation(state, b.evaluationId)?.sentAt ?? '').localeCompare(sel.evaluation(state, a.evaluationId)?.sentAt ?? ''));

  const app = appId ? mine.find((a) => a.id === appId) : undefined;
  const [filter, setFilter] = useState<'all' | 'positive' | 'improvement'>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [signal, setSignal] = useState(0);

  const anns = useMemo(() => (app ? sel.sentAnnotations(state, app.id).sort(byPosition) : []), [app, state]);
  const numbers = useMemo(() => Object.fromEntries(anns.map((a, i) => [a.id, i + 1])), [anns]);
  const shown = anns.filter((a) => filter === 'all' || a.sentiment === filter);

  useEffect(() => { if (app?.evaluationId && !app.feedbackViewedAt) actions.markFeedbackViewed(app.id); }, [app, actions]);
  useEffect(() => { setActiveId(null); setFilter('all'); }, [appId]);

  if (!appId) {
    if (withFeedback.length) return <Navigate to={`/applicant/feedback/${(withFeedback.find((a) => !a.feedbackViewedAt) ?? withFeedback[0]).id}`} replace />;
    return (
      <>
        <PageHeader title="Employer Feedback" />
        <Card><EmptyState icon={MessageSquareText} title="No feedback yet" description="When an employer reviews one of your applications and sends feedback, you’ll be able to read it here." action={<ButtonLink to="/applicant/applications" variant="secondary">View My Applications</ButtonLink>} /></Card>
      </>
    );
  }
  if (!app) return <NotFound />;

  const job = sel.job(state, app.jobId)!;
  const ev = sel.evaluation(state, app.evaluationId);
  const resume = sel.version(state, app.resumeVersionId);
  const resumeDoc = resume ? sel.docOfVersion(state, resume.id) : undefined;
  const status = STATUS_META[app.status];

  const select = (id: string) => {
    const a = anns.find((x) => x.id === id);
    if (a && filter !== 'all' && a.sentiment !== filter) setFilter('all');
    setActiveId(id); setSignal((s) => s + 1);
    requestAnimationFrame(() => document.getElementById(`fb-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  return (
    <>
      <PageHeader eyebrow="Employer Feedback" title={<>{job.title} <span className="font-normal text-slate-500">· {job.company}</span></>}
        actions={
          <div className="w-full sm:w-80">
            <label htmlFor="fb-app" className="sr-only">Choose application</label>
            <select id="fb-app" className={inputCls} value={app.id} onChange={(e) => navigate(`/applicant/feedback/${e.target.value}`)}>
              {!app.evaluationId && <option value={app.id}>{job.company} — {job.title} (no feedback yet)</option>}
              {withFeedback.map((a) => { const j = sel.job(state, a.jobId)!; return <option key={a.id} value={a.id}>{j.company} — {j.title}{!a.feedbackViewedAt ? ' • new' : ''}</option>; })}
            </select>
          </div>
        } />

      <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-slate-400" aria-hidden />Applied {fmtDate(app.submittedAt)}</span>
        {resume && <Link to={`/applicant/history?doc=${resume.documentId}&version=${resume.id}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><FileText className="size-4" aria-hidden />{resumeDoc?.name} — Version {resume.versionNumber}</Link>}
        {ev && <span>Reviewed by {ev.reviewerName}, {ev.reviewerCompany} · {fmtDate(ev.sentAt)}</span>}
      </div>

      {/* Application status explanation */}
      <Card className="mb-6" aria-labelledby="status-h">
        <CardHeader id="status-h" title="Application status" description="What the employer’s response means and whether you need to do anything." />
        <div className="grid gap-5 p-5 md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hiring status</div>
            <div className="mt-1.5"><Badge tone={status.tone}>{status.label}</Badge></div>
            <p className="mt-2 text-sm text-slate-600">{status.description}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employer evaluation</div>
            {ev ? (<>
              <div className="mt-1.5"><Badge tone={DECISION_META[ev.decision].tone}>{DECISION_META[ev.decision].label}</Badge></div>
              <p className="mt-2 text-sm text-slate-600">{DECISION_META[ev.decision].applicantMeaning}</p>
            </>) : <p className="mt-1.5 text-sm text-slate-600">{app.status === 'closed' ? 'No evaluation was recorded for this application.' : 'Not reviewed yet. The employer hasn’t sent an evaluation.'}</p>}
          </div>
          <div className="rounded-lg bg-brand-50/60 p-4 ring-1 ring-indigo-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-600"><ClipboardList className="size-4" aria-hidden />Action required?</div>
            <p className="mt-1.5 text-sm text-ink">
              {app.status === 'interview_invited' ? 'Yes — prepare for your interview. The employer will contact you to schedule it.'
                : ev ? DECISION_META[ev.decision].applicantAction
                : app.status === 'closed' ? 'No action needed.' : 'No action needed. You’ll be notified here when feedback arrives.'}
            </p>
          </div>
        </div>
        {(app.statusNote || ev?.summary) && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4">
            {ev?.summary && <p className="flex gap-2 text-sm text-slate-700"><Quote className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden /><span><span className="font-medium text-ink">Message from the employer:</span> {ev.summary}</span></p>}
            {app.statusNote && <p className="flex gap-2 text-sm text-slate-700"><Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />{app.statusNote}</p>}
          </div>
        )}
      </Card>

      {!ev ? (
        <Card><EmptyState icon={MessageSquareText} title="No feedback for this application yet" description="Draft comments are private to the employer until they send their final evaluation." /></Card>
      ) : !resume ? (
        <Card><EmptyState icon={FileText} title="Resume unavailable" description="The submitted resume version could not be found." /></Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,1fr)]">
          <section aria-labelledby="resume-h" className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 id="resume-h" className="text-base font-semibold text-ink">Submitted resume</h2>
              <span className="text-xs text-slate-500"><span className="mr-2 inline-block h-2 w-5 rounded-sm border-b-2 border-green-600 bg-green-100 align-middle" aria-hidden />Positive <span className="ml-3 mr-2 inline-block h-2 w-5 rounded-sm border-b-2 border-dashed border-amber-500 bg-amber-100 align-middle" aria-hidden />Improvement</span>
            </div>
            <div className="h-[70vh] min-h-[30rem]">
              <DocumentViewer version={resume} annotations={shown} numbers={numbers} activeId={activeId} focusSignal={signal} onAnnotationClick={select}
                label={`Submitted resume: ${resumeDoc?.name} version ${resume.versionNumber}. Highlighted sections have employer feedback.`} />
            </div>
          </section>

          <section aria-labelledby="fb-h" className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 id="fb-h" className="text-base font-semibold text-ink">Feedback <span className="font-normal text-slate-500">({anns.length})</span></h2>
              <DemoTag />
            </div>
            <div className="mb-3">
              <Segmented label="Filter feedback" value={filter} onChange={(v) => { setFilter(v); setActiveId(null); }} options={[
                { value: 'all', label: 'All Feedback', count: anns.length },
                { value: 'positive', label: 'Positive', count: anns.filter((a) => a.sentiment === 'positive').length },
                { value: 'improvement', label: 'Areas for Improvement', count: anns.filter((a) => a.sentiment === 'improvement').length },
              ]} />
            </div>
            {shown.length === 0 ? (
              <Card><EmptyState icon={MessageSquareText} title="No comments in this category" /></Card>
            ) : (
              <ul className="max-h-[calc(70vh-48px)] space-y-3 overflow-y-auto pr-1" aria-label="Feedback comments">
                {shown.map((a) => (
                  <FeedbackCard key={a.id} domId={`fb-${a.id}`} a={a} n={numbers[a.id]} active={activeId === a.id} onSelect={() => select(a.id)}
                    context={<>Application: {job.title} · {job.company} · {resumeDoc?.name} v{resume.versionNumber}</>} />
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-slate-500">Tip: select a comment to jump to its highlight, or select a highlight (or numbered marker) on the resume to open its comment.</p>
            <ButtonLink to={`/applicant/history?doc=${resume.documentId}&version=${resume.id}`} variant="secondary" icon={FileClock} className="mt-4">Open in Document History</ButtonLink>
          </section>
        </div>
      )}
    </>
  );
}
