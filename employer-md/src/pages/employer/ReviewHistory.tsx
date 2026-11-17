import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePen, History, SearchX, Send } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader, inputCls } from '../../components/ui';
import { DECISIONS, DECISION_META } from '../../lib/labels';
import { fmtDate, plural } from '../../lib/format';
import type { Decision } from '../../types';

export default function ReviewHistory() {
  const { state, currentUser } = useStore();
  const me = currentUser!;
  const [applicant, setApplicant] = useState('');
  const [job, setJob] = useState('all');
  const [decision, setDecision] = useState<Decision | 'all'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const myJobs = state.jobs.filter((j) => j.employerId === me.id);

  const sent = useMemo(() => state.evaluations.filter((e) => e.employerId === me.id).map((e) => {
    const app = state.applications.find((a) => a.id === e.applicationId)!;
    return { e, app, u: sel.user(state, app.applicantId)!, j: sel.job(state, app.jobId)! };
  }).sort((a, b) => b.e.sentAt.localeCompare(a.e.sentAt)), [state, me.id]);

  const rows = sent.filter(({ e, u, j }) =>
    (!applicant.trim() || u.name.toLowerCase().includes(applicant.trim().toLowerCase()))
    && (job === 'all' || j.id === job)
    && (decision === 'all' || e.decision === decision)
    && (!from || e.sentAt.slice(0, 10) >= from)
    && (!to || e.sentAt.slice(0, 10) <= to));

  const inProgress = sel.employerApps(state, me.id).filter((a) => a.reviewStatus === 'in_progress');
  const dateError = from && to && from > to ? 'The “from” date must be before the “to” date.' : null;
  const clear = () => { setApplicant(''); setJob('all'); setDecision('all'); setFrom(''); setTo(''); };

  return (
    <>
      <PageHeader title="Review History" description="Completed evaluations you’ve sent. Drafts that haven’t been sent are listed separately below." />
      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div><label htmlFor="rh-app" className="mb-1 block text-xs font-medium text-slate-600">Applicant</label><input id="rh-app" className={inputCls} placeholder="Search name" value={applicant} onChange={(e) => setApplicant(e.target.value)} /></div>
          <div><label htmlFor="rh-job" className="mb-1 block text-xs font-medium text-slate-600">Job</label>
            <select id="rh-job" className={inputCls} value={job} onChange={(e) => setJob(e.target.value)}><option value="all">All jobs</option>{myJobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div>
          <div><label htmlFor="rh-dec" className="mb-1 block text-xs font-medium text-slate-600">Evaluation</label>
            <select id="rh-dec" className={inputCls} value={decision} onChange={(e) => setDecision(e.target.value as Decision | 'all')}><option value="all">All evaluations</option>{DECISIONS.map((d) => <option key={d} value={d}>{DECISION_META[d].label}</option>)}</select></div>
          <div><label htmlFor="rh-from" className="mb-1 block text-xs font-medium text-slate-600">Sent from</label><input id="rh-from" type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} aria-invalid={!!dateError} /></div>
          <div><label htmlFor="rh-to" className="mb-1 block text-xs font-medium text-slate-600">Sent to</label><input id="rh-to" type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} aria-invalid={!!dateError} /></div>
        </div>
        {dateError && <p role="alert" className="mt-2 text-xs font-medium text-bad">{dateError}</p>}
      </Card>

      <Card className="mb-6">
        <CardHeader title={<span className="inline-flex items-center gap-2"><Send className="size-4 text-ok" aria-hidden />Sent evaluations ({rows.length})</span>} />
        {sent.length === 0 ? <EmptyState icon={History} title="No evaluations sent yet" description="Completed reviews will appear here." />
          : rows.length === 0 ? <EmptyState icon={SearchX} title="No evaluations match these filters" action={<Button variant="secondary" onClick={clear}>Clear filters</Button>} />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Sent evaluations</caption>
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>{['Applicant', 'Job', 'Sent', 'Evaluation', 'Comments', 'State', ''].map((h, i) => <th key={i} scope="col" className="px-4 py-3 font-semibold">{h || <span className="sr-only">Actions</span>}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map(({ e, app, u, j }) => (
                    <tr key={e.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-slate-700">{j.title}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{fmtDate(e.sentAt)}</td>
                      <td className="px-4 py-3"><Badge tone={DECISION_META[e.decision].tone}>{DECISION_META[e.decision].label}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{e.commentCount} <span className="text-slate-500">({e.positiveCount} positive, {e.improvementCount} improvement)</span></td>
                      <td className="px-4 py-3"><Badge tone="success" icon={Send}>Sent</Badge></td>
                      <td className="px-4 py-3 text-right"><Link to={`/employer/review/${app.id}`} className="font-medium text-brand hover:underline" aria-label={`View sent feedback for ${u.name}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      <Card>
        <CardHeader title={<span className="inline-flex items-center gap-2"><FilePen className="size-4 text-slate-500" aria-hidden />Drafts — not sent ({inProgress.length})</span>} description="Applicants cannot see these comments yet." />
        {inProgress.length === 0 ? <EmptyState icon={FilePen} title="No drafts in progress" /> : (
          <ul className="divide-y divide-slate-100">
            {inProgress.map((a) => {
              const u = sel.user(state, a.applicantId)!; const j = sel.job(state, a.jobId)!;
              const n = state.annotations.filter((x) => x.applicationId === a.id && x.state === 'draft').length;
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="flex-1"><div className="font-medium text-ink">{u.name}</div><div className="text-sm text-slate-500">{j.title}</div></div>
                  <Badge tone="neutral" icon={FilePen}>{plural(n, 'draft comment')} · not sent</Badge>
                  <Link to={`/employer/review/${a.id}`} className="text-sm font-medium text-brand hover:underline">Continue review</Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
