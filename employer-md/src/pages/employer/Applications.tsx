import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, FileText, Inbox, Mail, Search, SearchX } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, Button, ButtonLink, Card, EmptyState, PageHeader, Segmented, cx, inputCls } from '../../components/ui';
import { REVIEW_META } from '../../lib/labels';
import { fmtDate, plural } from '../../lib/format';
import type { ReviewStatus } from '../../types';

export default function EmployerApplications() {
  const { state, currentUser } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const review = (params.get('review') ?? 'all') as ReviewStatus | 'all';
  const job = params.get('job') ?? 'all';
  const all = sel.employerApps(state, currentUser!.id);
  const myJobs = state.jobs.filter((j) => j.employerId === currentUser!.id);
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v === 'all') p.delete(k); else p.set(k, v); setParams(p, { replace: true }); };

  const rank: Record<ReviewStatus, number> = { pending: 0, in_progress: 1, reviewed: 2 };
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all
      .filter((a) => review === 'all' || a.reviewStatus === review)
      .filter((a) => job === 'all' || a.jobId === job)
      .filter((a) => !t || sel.user(state, a.applicantId)!.name.toLowerCase().includes(t) || sel.job(state, a.jobId)!.title.toLowerCase().includes(t))
      .sort((a, b) => rank[a.reviewStatus] - rank[b.reviewStatus] || b.submittedAt.localeCompare(a.submittedAt));
  }, [all, review, job, q, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const count = (s: ReviewStatus) => all.filter((a) => a.reviewStatus === s && (job === 'all' || a.jobId === job)).length;

  return (
    <>
      <PageHeader title="Applications" description="Pending applications are listed first. Select an applicant to open their review workspace." />
      <Card className="mb-5 space-y-3 p-4">
        <Segmented label="Filter by review status" value={review} onChange={(v) => set('review', v)} options={[
          { value: 'all', label: 'All', count: all.filter((a) => job === 'all' || a.jobId === job).length },
          { value: 'pending', label: 'Pending Review', count: count('pending') },
          { value: 'in_progress', label: 'In Progress', count: count('in_progress') },
          { value: 'reviewed', label: 'Reviewed', count: count('reviewed') },
        ]} />
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <div className="relative">
            <label htmlFor="emp-q" className="sr-only">Search applicants</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="emp-q" className={inputCls + ' pl-9'} placeholder="Search applicant or position" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div><label htmlFor="emp-job" className="sr-only">Filter by position</label>
            <select id="emp-job" className={inputCls} value={job} onChange={(e) => set('job', e.target.value)}>
              <option value="all">All positions</option>{myJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select></div>
        </div>
      </Card>

      {all.length === 0 ? <Card><EmptyState icon={Inbox} title="No applications yet" /></Card>
        : rows.length === 0 ? <Card><EmptyState icon={SearchX} title="No applications match these filters" action={<Button variant="secondary" onClick={() => { setQ(''); setParams({}, { replace: true }); }}>Clear filters</Button>} /></Card>
        : (
          <ul className="space-y-3" aria-label={`${plural(rows.length, 'application')}`}>
            {rows.map((a) => {
              const u = sel.user(state, a.applicantId)!; const j = sel.job(state, a.jobId)!;
              const resume = sel.version(state, a.resumeVersionId); const cover = sel.version(state, a.coverLetterVersionId);
              const drafts = state.annotations.filter((x) => x.applicationId === a.id && x.state === 'draft').length;
              const pending = a.reviewStatus === 'pending';
              return (
                <li key={a.id}>
                  <Card as="article" className={cx('flex flex-wrap items-center gap-4 p-4 transition hover:shadow-md', pending && 'border-l-4 border-l-warn')}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-navy-50 font-semibold text-navy" aria-hidden>{u.name.split(' ').map((p) => p[0]).join('')}</span>
                    <div className="min-w-[200px] flex-1">
                      <h2 className="font-semibold text-ink"><Link to={`/employer/review/${a.id}`} className="hover:text-brand hover:underline">{u.name}</Link></h2>
                      <div className="text-sm text-slate-600">{j.title} · submitted {fmtDate(a.submittedAt)}</div>
                      <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><FileText className="size-3.5" aria-hidden />{resume?.fileName ?? 'Resume'}</span>
                        {cover && <span className="inline-flex items-center gap-1"><Mail className="size-3.5" aria-hidden />{cover.fileName}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={REVIEW_META[a.reviewStatus].tone}>{REVIEW_META[a.reviewStatus].label}</Badge>
                      {drafts > 0 && <Badge tone="neutral">{plural(drafts, 'draft')} not sent</Badge>}
                    </div>
                    <ButtonLink to={`/employer/review/${a.id}`} size="sm" variant={pending ? 'primary' : 'secondary'} aria-label={`${pending ? 'Review' : a.reviewStatus === 'in_progress' ? 'Continue reviewing' : 'View review for'} ${u.name}`}>
                      {pending ? 'Review' : a.reviewStatus === 'in_progress' ? 'Continue' : 'View'}<ArrowRight className="size-3.5" aria-hidden />
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
    </>
  );
}
