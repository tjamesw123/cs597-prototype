import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Briefcase, Clock, FileUp, MessageSquareText, Search, Activity, Inbox } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, ButtonLink, Card, CardHeader, EmptyState, PageHeader, StatCard } from '../../components/ui';
import { DECISION_META, STATUS_META, needsAttention, nextAction } from '../../lib/labels';
import { fmtDate, plural, relativeTime } from '../../lib/format';

export default function ApplicantDashboard() {
  const { state, currentUser } = useStore();
  const me = currentUser!;
  const apps = state.applications.filter((a) => a.applicantId === me.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const awaiting = apps.filter((a) => !a.evaluationId && a.status !== 'closed');
  const withFeedback = apps.filter((a) => a.evaluationId);
  const attention = apps.filter(needsAttention);
  const recentFeedback = withFeedback
    .map((a) => ({ a, ev: sel.evaluation(state, a.evaluationId)!, job: sel.job(state, a.jobId)! }))
    .sort((x, y) => y.ev.sentAt.localeCompare(x.ev.sentAt)).slice(0, 4);
  const activity = state.activity.filter((x) => x.userId === me.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return (
    <>
      <PageHeader title={`Welcome back, ${me.firstName}`} description="Here’s where your applications stand and what to do next."
        actions={<>
          <ButtonLink to="/applicant/documents" variant="secondary" icon={FileUp}>Upload Resume</ButtonLink>
          <ButtonLink to="/applicant/jobs" variant="secondary" icon={Search}>Browse Jobs</ButtonLink>
          <ButtonLink to="/applicant/feedback" icon={MessageSquareText}>View Feedback</ButtonLink>
        </>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications submitted" value={apps.length} icon={Briefcase} to="/applicant/applications" hint="All time" />
        <StatCard label="Awaiting review" value={awaiting.length} icon={Clock} tone="warn" to="/applicant/applications?review=awaiting" hint="No employer feedback yet" />
        <StatCard label="With employer feedback" value={withFeedback.length} icon={MessageSquareText} tone="ok" to="/applicant/applications?review=feedback" hint="Evaluation and comments sent" />
        <StatCard label="Requires your attention" value={attention.length} icon={AlertTriangle} tone="brand" to="/applicant/applications?review=attention" hint="Unread feedback or interview invites" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="What to do next" description="Applications that need you, most important first." />
          {attention.length === 0 ? (
            <EmptyState icon={Inbox} title="You’re all caught up" description="No unread feedback or interview invitations right now." action={<ButtonLink to="/applicant/jobs" variant="secondary">Find more jobs</ButtonLink>} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {attention.map((a) => {
                const job = sel.job(state, a.jobId)!;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink">{job.title} <span className="text-slate-500">· {job.company}</span></div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge>
                        <span>{nextAction(a)}</span>
                      </div>
                    </div>
                    <ButtonLink size="sm" variant="secondary" to={`/applicant/feedback/${a.id}`}>Open<ArrowRight className="size-3.5" aria-hidden /></ButtonLink>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          {activity.length === 0 ? <EmptyState icon={Activity} title="No activity yet" /> : (
            <ol className="space-y-0 px-5 py-3">
              {activity.map((x) => (
                <li key={x.id} className="relative border-l border-slate-200 py-2.5 pl-4">
                  <span className="absolute -left-[4.5px] top-4 size-2 rounded-full bg-brand" aria-hidden />
                  {x.link ? <Link to={x.link} className="text-sm text-ink hover:text-brand hover:underline">{x.text}</Link> : <span className="text-sm text-ink">{x.text}</span>}
                  <div className="text-xs text-slate-500"><time dateTime={x.at}>{relativeTime(x.at)}</time></div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recently received feedback" action={<Link to="/applicant/feedback" className="text-sm font-medium text-brand hover:underline">All feedback</Link>} />
        {recentFeedback.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No feedback yet" description="When an employer sends feedback on an application, it will appear here." />
        ) : (
          <ul className="grid gap-4 p-5 md:grid-cols-2">
            {recentFeedback.map(({ a, ev, job }) => (
              <li key={a.id}>
                <Link to={`/applicant/feedback/${a.id}`} className="block rounded-xl border border-slate-200 p-4 transition hover:border-brand/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-ink">{job.title}</div>
                      <div className="text-sm text-slate-500">{job.company} · sent {fmtDate(ev.sentAt)}</div>
                    </div>
                    {!a.feedbackViewedAt && <Badge tone="indigo">New</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-slate-600">Evaluation:</span>
                    <Badge tone={DECISION_META[ev.decision].tone}>{DECISION_META[ev.decision].label}</Badge>
                    <span className="text-slate-500">· {plural(ev.positiveCount, 'positive')}, {plural(ev.improvementCount, 'improvement')}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
