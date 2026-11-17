import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarClock, CheckCircle2, MapPin, MessageSquareText, Search, SearchX } from 'lucide-react';
import { useStore } from '../../state/store';
import { Badge, Button, Card, EmptyState, PageHeader, inputCls } from '../../components/ui';
import { fmtDate, isPastDeadline } from '../../lib/format';
import type { Job } from '../../types';

export function JobMeta({ job }: { job: Job }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
      <span className="inline-flex items-center gap-1"><MapPin className="size-4 text-slate-400" aria-hidden />{job.location} · {job.workplace}</span>
      <span className="inline-flex items-center gap-1"><Building2 className="size-4 text-slate-400" aria-hidden />{job.employmentType}</span>
      {job.deadline && (
        <span className="inline-flex items-center gap-1"><CalendarClock className="size-4 text-slate-400" aria-hidden />
          {isPastDeadline(job.deadline) ? <>Closed {fmtDate(job.deadline)}</> : <>Apply by {fmtDate(job.deadline)}</>}
        </span>
      )}
    </div>
  );
}

export function FeedbackParticipant({ job }: { job: Job }) {
  return job.feedbackParticipant
    ? <Badge tone="indigo" icon={MessageSquareText}>Employer.MD feedback{job.feedbackWindowDays ? ` · within ${job.feedbackWindowDays} days` : ''}</Badge>
    : <Badge tone="neutral">No structured feedback</Badge>;
}

export default function BrowseJobs() {
  const { state, currentUser } = useStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [workplace, setWorkplace] = useState('all');
  const [openOnly, setOpenOnly] = useState(true);
  const applied = new Set(state.applications.filter((a) => a.applicantId === currentUser!.id).map((a) => a.jobId));

  const jobs = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.jobs
      .filter((j) => !term || [j.title, j.company, j.location, j.description, ...j.qualifications].join(' ').toLowerCase().includes(term))
      .filter((j) => type === 'all' || j.employmentType === type)
      .filter((j) => workplace === 'all' || j.workplace === workplace)
      .filter((j) => !openOnly || !isPastDeadline(j.deadline))
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }, [state.jobs, q, type, workplace, openOnly]);

  const reset = () => { setQ(''); setType('all'); setWorkplace('all'); setOpenOnly(false); };

  return (
    <>
      <PageHeader title="Browse Jobs" description="Sample openings from employers that participate in Employer.MD and commit to sending structured resume feedback." />
      <Card className="mb-5 p-4">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-center">
          <div className="relative">
            <label htmlFor="job-q" className="sr-only">Search jobs</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input id="job-q" className={inputCls + ' pl-9'} placeholder="Search title, company, skill…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div><label htmlFor="job-type" className="sr-only">Employment type</label>
            <select id="job-type" className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option><option>Internship</option><option>Full-time</option><option>Part-time</option>
            </select></div>
          <div><label htmlFor="job-wp" className="sr-only">Workplace</label>
            <select id="job-wp" className={inputCls} value={workplace} onChange={(e) => setWorkplace(e.target.value)}>
              <option value="all">Any workplace</option><option>On-site</option><option>Hybrid</option><option>Remote</option>
            </select></div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" className="size-4 accent-brand" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />Open only</label>
        </form>
      </Card>
      <p className="mb-3 text-sm text-slate-600" aria-live="polite">{jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found</p>
      {jobs.length === 0 ? (
        <Card><EmptyState icon={SearchX} title="No jobs match your filters" description="Try a different keyword or clear the filters." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} /></Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {jobs.map((j) => (
            <li key={j.id}>
              <Card as="article" className="flex h-full flex-col p-5 transition hover:border-brand/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-500">{j.company}</div>
                    <h2 className="text-lg font-semibold text-ink"><Link to={`/applicant/jobs/${j.id}`} className="hover:text-brand hover:underline">{j.title}</Link></h2>
                  </div>
                  {applied.has(j.id) && <Badge tone="success" icon={CheckCircle2}>Applied</Badge>}
                </div>
                <div className="mt-2"><JobMeta job={j} /></div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-700">{j.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Key qualifications">
                  {j.qualifications.slice(0, 3).map((q) => <li key={q} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{q}</li>)}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                  <FeedbackParticipant job={j} />
                  <Link to={`/applicant/jobs/${j.id}`} className="text-sm font-semibold text-brand hover:underline" aria-label={`View details for ${j.title} at ${j.company}`}>View details →</Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
