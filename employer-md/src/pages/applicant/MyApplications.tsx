import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, FileText, Mail, MessageSquareText, Search, SearchX } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, Button, ButtonLink, Card, EmptyState, PageHeader, inputCls } from '../../components/ui';
import { STATUS_META, applicantReviewLabel, needsAttention, nextAction } from '../../lib/labels';
import { fmtDate } from '../../lib/format';
import type { Application, ApplicationStatus } from '../../types';

export default function MyApplications() {
  const { state, currentUser } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [sort, setSort] = useState<'new' | 'old'>('new');
  const review = params.get('review') ?? 'all';

  const all = state.applications.filter((a) => a.applicantId === currentUser!.id);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((a) => {
        const j = sel.job(state, a.jobId)!;
        return !term || `${j.company} ${j.title}`.toLowerCase().includes(term);
      })
      .filter((a) => status === 'all' || a.status === status)
      .filter((a) => review === 'all'
        || (review === 'awaiting' && !a.evaluationId && a.status !== 'closed')
        || (review === 'feedback' && !!a.evaluationId)
        || (review === 'attention' && needsAttention(a)))
      .sort((a, b) => (sort === 'new' ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt)));
  }, [all, q, status, review, sort, state]);

  const setReview = (v: string) => { const p = new URLSearchParams(params); if (v === 'all') p.delete('review'); else p.set('review', v); setParams(p, { replace: true }); };
  const clear = () => { setQ(''); setStatus('all'); setReview('all'); };

  return (
    <>
      <PageHeader title="My Applications" description="Application status (where you are in the hiring process) is shown separately from the employer’s review and feedback."
        actions={<ButtonLink to="/applicant/jobs" icon={Briefcase}>Browse Jobs</ButtonLink>} />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_190px_170px]">
          <div className="relative">
            <label htmlFor="app-q" className="sr-only">Search applications</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="app-q" className={inputCls + ' pl-9'} placeholder="Search company or position" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div><label htmlFor="app-status" className="sr-only">Filter by status</label>
            <select id="app-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus | 'all')}>
              <option value="all">All statuses</option>
              {(Object.keys(STATUS_META) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select></div>
          <div><label htmlFor="app-review" className="sr-only">Filter by employer review</label>
            <select id="app-review" className={inputCls} value={review} onChange={(e) => setReview(e.target.value)}>
              <option value="all">Any review state</option><option value="awaiting">Awaiting review</option><option value="feedback">Has feedback</option><option value="attention">Needs attention</option>
            </select></div>
          <div><label htmlFor="app-sort" className="sr-only">Sort by date</label>
            <select id="app-sort" className={inputCls} value={sort} onChange={(e) => setSort(e.target.value as 'new' | 'old')}>
              <option value="new">Newest first</option><option value="old">Oldest first</option>
            </select></div>
        </div>
      </Card>

      {all.length === 0 ? (
        <Card><EmptyState icon={Briefcase} title="No applications yet" description="Find a job and apply with one of your uploaded resumes." action={<ButtonLink to="/applicant/jobs">Browse Jobs</ButtonLink>} /></Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={SearchX} title="No applications match" description="Try clearing the search or filters." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} /></Card>
      ) : (
        <>
          <p className="mb-2 text-sm text-slate-600" aria-live="polite">Showing {rows.length} of {all.length}</p>
          {/* Desktop table */}
          <Card className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Your applications</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>{['Company & position', 'Applied', 'Documents', 'Status', 'Employer review', 'Feedback', 'Next action'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((a) => <Row key={a.id} a={a} />)}
              </tbody>
            </table>
          </Card>
          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">{rows.map((a) => <MobileCard key={a.id} a={a} />)}</ul>
        </>
      )}
    </>
  );
}

function useAppInfo(a: Application) {
  const { state } = useStore();
  const job = sel.job(state, a.jobId)!;
  const resume = sel.version(state, a.resumeVersionId);
  const cover = sel.version(state, a.coverLetterVersionId);
  const comments = sel.sentAnnotations(state, a.id).length;
  return {
    job, comments,
    resumeLabel: resume ? `${sel.docOfVersion(state, resume.id)?.name} v${resume.versionNumber}` : 'Unavailable',
    coverLabel: cover ? `${sel.docOfVersion(state, cover.id)?.name} v${cover.versionNumber}` : null,
    resumeLink: resume ? `/applicant/history?doc=${resume.documentId}&version=${resume.id}` : undefined,
  };
}

function FeedbackLink({ a, comments }: { a: Application; comments: number }) {
  if (!a.evaluationId) return <span className="text-slate-400">—<span className="sr-only">No feedback yet</span></span>;
  return (
    <Link to={`/applicant/feedback/${a.id}`} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
      <MessageSquareText className="size-4" aria-hidden />View feedback ({comments})
    </Link>
  );
}

function Row({ a }: { a: Application }) {
  const i = useAppInfo(a);
  const rv = applicantReviewLabel(a);
  return (
    <tr className="align-top hover:bg-slate-50/60">
      <td className="px-4 py-3"><div className="font-medium text-ink">{i.job.company}</div><div className="text-slate-600">{i.job.title}</div></td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{fmtDate(a.submittedAt)}</td>
      <td className="px-4 py-3">
        <Link to={i.resumeLink ?? '#'} className="flex items-center gap-1 text-slate-700 hover:text-brand hover:underline"><FileText className="size-3.5 shrink-0" aria-hidden />{i.resumeLabel}</Link>
        {i.coverLabel && <div className="mt-0.5 flex items-center gap-1 text-slate-500"><Mail className="size-3.5 shrink-0" aria-hidden />{i.coverLabel}</div>}
      </td>
      <td className="px-4 py-3"><Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge></td>
      <td className="px-4 py-3"><Badge tone={rv.tone}>{rv.label}</Badge></td>
      <td className="whitespace-nowrap px-4 py-3"><FeedbackLink a={a} comments={i.comments} /></td>
      <td className="px-4 py-3 text-slate-700">{nextAction(a)}</td>
    </tr>
  );
}

function MobileCard({ a }: { a: Application }) {
  const i = useAppInfo(a);
  const rv = applicantReviewLabel(a);
  return (
    <li>
      <Card as="article" className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div><div className="font-semibold text-ink">{i.job.title}</div><div className="text-sm text-slate-600">{i.job.company} · {fmtDate(a.submittedAt)}</div></div>
          <Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge>
        </div>
        <dl className="mt-3 grid grid-cols-[124px_1fr] gap-y-1.5 text-sm">
          <dt className="text-slate-500">Employer review</dt><dd><Badge tone={rv.tone}>{rv.label}</Badge></dd>
          <dt className="text-slate-500">Resume</dt><dd className="text-slate-700">{i.resumeLabel}</dd>
          {i.coverLabel && <><dt className="text-slate-500">Cover letter</dt><dd className="text-slate-700">{i.coverLabel}</dd></>}
          <dt className="text-slate-500">Next action</dt><dd className="text-slate-700">{nextAction(a)}</dd>
        </dl>
        {a.evaluationId && <div className="mt-3 border-t border-slate-100 pt-3"><FeedbackLink a={a} comments={i.comments} /></div>}
      </Card>
    </li>
  );
}
