import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardCheck, FilePen, Hourglass, Inbox, UserRound } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, ButtonLink, Card, CardHeader, EmptyState, PageHeader, StatCard } from '../../components/ui';
import { DECISION_META, REVIEW_META } from '../../lib/labels';
import { fmtDate, plural, relativeTime } from '../../lib/format';

export default function EmployerDashboard() {
  const { state, currentUser } = useStore();
  const me = currentUser!;
  const apps = sel.employerApps(state, me.id);
  const pending = apps.filter((a) => a.reviewStatus === 'pending');
  const inProgress = apps.filter((a) => a.reviewStatus === 'in_progress');
  const reviewed = apps.filter((a) => a.reviewStatus === 'reviewed');
  const drafts = state.annotations.filter((a) => a.state === 'draft' && a.authorId === me.id);
  const attention = [...inProgress, ...pending].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const recent = state.evaluations.filter((e) => e.employerId === me.id).sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, 5);
  const activity = state.activity.filter((x) => x.userId === me.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);

  return (
    <>
      <PageHeader title={`Welcome back, ${me.firstName}`} description={`${me.title} · ${me.company}. Review applications, highlight resumes and send clear decisions.`}
        actions={<ButtonLink to="/employer/applications?review=pending" icon={ClipboardCheck} size="lg">Review Pending Applications{pending.length > 0 && <span className="ml-1 rounded-full bg-white/20 px-2 text-sm">{pending.length}</span>}</ButtonLink>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications received" value={apps.length} icon={Inbox} to="/employer/applications" hint={`Across ${plural(new Set(apps.map((a) => a.jobId)).size, 'open role')}`} />
        <StatCard label="Pending review" value={pending.length} icon={Hourglass} tone="warn" to="/employer/applications?review=pending" hint="Not started yet" />
        <StatCard label="Reviewed" value={reviewed.length} icon={CheckCircle2} tone="ok" to="/employer/history" hint="Feedback and decision sent" />
        <StatCard label="Feedback drafts" value={drafts.length} icon={FilePen} tone="brand" to="/employer/applications?review=in_progress" hint={`${plural(inProgress.length, 'application')} in progress — not sent`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Needs your attention" description="In-progress reviews first, then pending applications (oldest first)." action={<Link to="/employer/applications" className="text-sm font-medium text-brand hover:underline">All applications</Link>} />
          {attention.length === 0 ? <EmptyState icon={CheckCircle2} title="Inbox zero" description="Every application has been reviewed." /> : (
            <ul className="divide-y divide-slate-100">
              {attention.slice(0, 6).map((a) => {
                const u = sel.user(state, a.applicantId)!; const j = sel.job(state, a.jobId)!;
                const nDrafts = state.annotations.filter((x) => x.applicationId === a.id && x.state === 'draft').length;
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span className="grid size-9 place-items-center rounded-full bg-navy-50 text-sm font-semibold text-navy" aria-hidden>{u.name.split(' ').map((p) => p[0]).join('')}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink">{u.name}</div>
                      <div className="text-sm text-slate-500">{j.title} · submitted {fmtDate(a.submittedAt)}</div>
                    </div>
                    <Badge tone={REVIEW_META[a.reviewStatus].tone}>{REVIEW_META[a.reviewStatus].label}{nDrafts > 0 && ` · ${plural(nDrafts, 'draft')}`}</Badge>
                    <ButtonLink size="sm" variant={a.reviewStatus === 'pending' ? 'primary' : 'secondary'} to={`/employer/review/${a.id}`} aria-label={`${a.reviewStatus === 'pending' ? 'Start review' : 'Continue review'} for ${u.name}`}>
                      {a.reviewStatus === 'pending' ? 'Start review' : 'Continue'}<ArrowRight className="size-3.5" aria-hidden />
                    </ButtonLink>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader title="Recent activity" />
          <ol className="px-5 py-3">
            {activity.map((x) => (
              <li key={x.id} className="relative border-l border-slate-200 py-2.5 pl-4">
                <span className="absolute -left-[4.5px] top-4 size-2 rounded-full bg-brand" aria-hidden />
                {x.link ? <Link to={x.link} className="text-sm text-ink hover:text-brand hover:underline">{x.text}</Link> : <span className="text-sm">{x.text}</span>}
                <div className="text-xs text-slate-500">{relativeTime(x.at)}</div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recently reviewed candidates" action={<Link to="/employer/history" className="text-sm font-medium text-brand hover:underline">Review history</Link>} />
        {recent.length === 0 ? <EmptyState icon={UserRound} title="No reviews sent yet" /> : (
          <ul className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((e) => {
              const app = state.applications.find((a) => a.id === e.applicationId)!; const u = sel.user(state, app.applicantId)!; const j = sel.job(state, app.jobId)!;
              return (
                <li key={e.id}>
                  <Link to={`/employer/review/${app.id}`} className="block rounded-xl border border-slate-200 p-4 transition hover:border-brand/40 hover:shadow-sm">
                    <div className="font-medium text-ink">{u.name}</div>
                    <div className="text-sm text-slate-500">{j.title}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <Badge tone={DECISION_META[e.decision].tone}>{DECISION_META[e.decision].label}</Badge>
                      <span className="text-slate-500">{plural(e.commentCount, 'comment')} · {fmtDate(e.sentAt)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
