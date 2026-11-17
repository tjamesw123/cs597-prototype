import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Eye, LayoutDashboard, SkipForward } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, Button, ButtonLink, Card, EmptyState } from '../../components/ui';
import { DECISION_META, REVIEW_META } from '../../lib/labels';
import { fmtDateTime } from '../../lib/format';
import NotFound from '../NotFound';

export default function FeedbackSent() {
  const { appId } = useParams();
  const { state, currentUser } = useStore();
  const navigate = useNavigate();
  const apps = sel.employerApps(state, currentUser!.id);
  const app = apps.find((a) => a.id === appId);
  if (!app) return <NotFound />;
  const ev = sel.evaluation(state, app.evaluationId);
  if (!ev) {
    // Never render a confirmation with missing decision data.
    return app.reviewStatus === 'reviewed'
      ? <Card className="mx-auto max-w-xl"><EmptyState icon={CheckCircle2} title="Evaluation record not found" description="This application is marked reviewed, but its evaluation could not be loaded." action={<ButtonLink to="/employer">Return to Dashboard</ButtonLink>} /></Card>
      : <Navigate to={`/employer/review/${app.id}`} replace />;
  }
  const applicant = sel.user(state, app.applicantId)!;
  const job = sel.job(state, app.jobId)!;
  const nextPending = apps.filter((a) => a.reviewStatus !== 'reviewed').sort((a, b) => (a.reviewStatus === 'in_progress' ? -1 : 0) - (b.reviewStatus === 'in_progress' ? -1 : 0) || a.submittedAt.localeCompare(b.submittedAt))[0];

  return (
    <Card className="mx-auto mt-4 max-w-xl p-8 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-ok"><CheckCircle2 className="size-9" aria-hidden /></div>
      <h1 className="mt-4 text-2xl font-semibold text-ink" tabIndex={-1} ref={(el) => el?.focus()}>Feedback successfully sent</h1>
      <p className="mt-1 text-sm text-slate-500">Sent {fmtDateTime(ev.sentAt)} · simulated in this browser</p>
      <dl className="mx-auto mt-6 max-w-sm divide-y divide-slate-100 rounded-xl border border-slate-200 text-left text-sm">
        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-500">Applicant</dt><dd className="font-semibold text-ink">{applicant.name}</dd></div>
        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-500">Position</dt><dd className="text-right font-medium text-ink">{job.title}</dd></div>
        <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-slate-500">Decision</dt><dd><Badge tone={DECISION_META[ev.decision].tone}>{DECISION_META[ev.decision].label}</Badge></dd></div>
        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-500">Comments sent</dt><dd className="font-semibold text-ink">{ev.commentCount}</dd></div>
        <div className="flex items-center justify-between gap-4 px-4 py-3"><dt className="text-slate-500">Status</dt><dd><Badge tone={REVIEW_META.reviewed.tone}>{REVIEW_META.reviewed.label}</Badge></dd></div>
      </dl>
      <p className="mt-4 text-sm text-slate-600">{applicant.firstName} can now see your highlights, comments and decision in their Employer.MD account.</p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row sm:flex-wrap">
        <ButtonLink to={`/employer/review/${app.id}`} variant="secondary" icon={Eye}>View Sent Feedback</ButtonLink>
        <Button icon={SkipForward} disabled={!nextPending} onClick={() => nextPending && navigate(`/employer/review/${nextPending.id}`)} title={nextPending ? undefined : 'No applications left to review'}>
          {nextPending ? 'Review Next Application' : 'No applications left'}
        </Button>
        <ButtonLink to="/employer" variant="ghost" icon={LayoutDashboard}>Return to Dashboard</ButtonLink>
      </div>
    </Card>
  );
}
