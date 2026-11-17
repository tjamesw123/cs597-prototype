import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send, ThumbsUp, TrendingUp } from 'lucide-react';
import { ActionError, sel, useStore } from '../../state/store';
import { Alert, Badge, Button, ButtonLink, Card, CardHeader, ConfirmDialog, Field, PageHeader, cx, inputCls } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { DECISIONS, DECISION_META, STATUS_META } from '../../lib/labels';
import { plural } from '../../lib/format';
import { byPosition } from '../applicant/Feedback';
import type { Decision } from '../../types';
import NotFound from '../NotFound';

export default function OverallDecision() {
  const { appId } = useParams();
  const { state, actions, currentUser } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const app = sel.employerApps(state, currentUser!.id).find((a) => a.id === appId);
  if (!app) return <NotFound />;
  if (app.reviewStatus === 'reviewed' && !sending) return <Navigate to={`/employer/review/${app.id}/sent`} replace />;

  const applicant = sel.user(state, app.applicantId)!;
  const job = sel.job(state, app.jobId)!;
  const drafts = state.annotations.filter((a) => a.applicationId === app.id && a.state === 'draft').sort(byPosition);
  const pos = drafts.filter((a) => a.sentiment === 'positive');
  const imp = drafts.filter((a) => a.sentiment === 'improvement');

  const openConfirm = () => {
    if (!decision) { setError('Select an overall evaluation before sending.'); document.getElementById('decision-group')?.focus(); return; }
    setError(null); setConfirm(true);
  };

  const send = async () => {
    if (!decision || sending) return;
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 500)); // simulate network latency
      actions.sendEvaluation(app.id, decision, summary);
      toast({ tone: 'success', title: 'Feedback successfully sent', body: `${applicant.name} — ${DECISION_META[decision].label}` });
      navigate(`/employer/review/${app.id}/sent`, { replace: true });
    } catch (e) {
      setError(e instanceof ActionError ? e.message : 'Feedback could not be sent. Please try again.');
      setSending(false); setConfirm(false);
    }
  };

  return (
    <>
      <ButtonLink to={`/employer/review/${app.id}`} variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-3">Back to resume review</ButtonLink>
      <PageHeader eyebrow="Candidate review · Step 2 of 2" title="Overall Decision" description="Choose an evaluation and confirm. Nothing is sent to the applicant until you confirm." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Overall evaluation" description="Employer evaluation categories — not automatic interview or hiring outcomes." />
            <div id="decision-group" role="radiogroup" aria-label="Overall evaluation" aria-required="true" tabIndex={-1} className="grid gap-3 p-5 sm:grid-cols-2 focus:outline-none">
              {DECISIONS.map((d) => {
                const m = DECISION_META[d]; const on = decision === d;
                return (
                  <label key={d} className={cx('relative cursor-pointer rounded-xl border p-4 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
                    on ? 'border-brand bg-brand-50/50 ring-2 ring-brand/25' : 'border-slate-200 hover:border-slate-300')}>
                    <input type="radio" name="decision" className="sr-only" checked={on} onChange={() => { setDecision(d); setError(null); }} />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink">{m.label}</span>
                      {on ? <CheckCircle2 className="size-5 text-brand" aria-label="Selected" /> : <span className="size-5 rounded-full border-2 border-slate-300" aria-hidden />}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{m.employerHint}</p>
                    <p className="mt-2 text-xs text-slate-500">Applicant status: <strong className="text-slate-700">{STATUS_META[m.resultingStatus].label}</strong></p>
                  </label>
                );
              })}
            </div>
            <div className="px-5 pb-5">
              <Field label="Message to applicant (optional)" htmlFor="summary" hint={`${summary.length}/400 — a short, respectful note shown with your decision.`}>
                <textarea id="summary" rows={3} maxLength={400} className={inputCls} value={summary} onChange={(e) => setSummary(e.target.value)} aria-describedby="summary-hint" />
              </Field>
            </div>
          </Card>
          {decision && (
            <Alert tone="info" title={`What ${applicant.firstName} will see`}>
              {DECISION_META[decision].applicantMeaning} <span className="font-medium">{DECISION_META[decision].applicantAction}</span>
            </Alert>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Summary" />
            <dl className="divide-y divide-slate-100 text-sm">
              {[
                ['Applicant', applicant.name],
                ['Job position', `${job.title} · ${job.company}`],
                ['Number of comments', String(drafts.length)],
                ['Positive feedback', String(pos.length)],
                ['Areas for improvement', String(imp.length)],
              ].map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-5 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="text-right font-medium text-ink">{v}</dd></div>)}
              <div className="flex items-center justify-between gap-4 px-5 py-2.5">
                <dt className="text-slate-500">Selected evaluation</dt>
                <dd>{decision ? <Badge tone={DECISION_META[decision].tone}>{DECISION_META[decision].label}</Badge> : <span className="font-medium text-bad">Not selected</span>}</dd>
              </div>
            </dl>
            {drafts.length > 0 && (
              <ul className="space-y-2 border-t border-slate-100 px-5 py-4">
                {drafts.map((a) => (
                  <li key={a.id} className="flex gap-2 text-sm">
                    {a.sentiment === 'positive' ? <ThumbsUp className="mt-0.5 size-4 shrink-0 text-ok" aria-label="Positive" /> : <TrendingUp className="mt-0.5 size-4 shrink-0 text-warn" aria-label="Improvement" />}
                    <span><span className="font-medium text-ink">{a.reason}:</span> <span className="text-slate-600">“{a.quote.length > 70 ? a.quote.slice(0, 70) + '…' : a.quote}”</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {drafts.length === 0 && <Alert tone="warning">You haven’t added any comments. You can still send a decision, but highlighted feedback is what makes Employer.MD useful to applicants.</Alert>}
          {error && <Alert tone="error">{error}</Alert>}
          <Button size="lg" className="w-full" icon={Send} onClick={openConfirm} disabled={sending}>Send Feedback and Decision</Button>
          <p className="text-center text-xs text-slate-500">You’ll be asked to confirm. After sending, comments can’t be edited.</p>
        </aside>
      </div>

      <ConfirmDialog open={confirm} onClose={() => !sending && setConfirm(false)} onConfirm={send} loading={sending} title="Send feedback and decision?" confirmLabel="Yes, send to applicant">
        {decision && (
          <div className="space-y-3">
            <p>You’re about to send <strong className="text-ink">{plural(drafts.length, 'comment')}</strong> and the evaluation <strong className="text-ink">{DECISION_META[decision].label}</strong> to <strong className="text-ink">{applicant.name}</strong> for {job.title}.</p>
            <p>Their application status will be <strong className="text-ink">{STATUS_META[DECISION_META[decision].resultingStatus].label}</strong>. Sent feedback can’t be edited or withdrawn.</p>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
