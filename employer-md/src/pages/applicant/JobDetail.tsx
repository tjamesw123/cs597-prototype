import { useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Alert, ButtonLink, Card, PageHeader } from '../../components/ui';
import { FeedbackParticipant, JobMeta } from './BrowseJobs';
import { fmtDate, isPastDeadline } from '../../lib/format';
import NotFound from '../NotFound';

export default function JobDetail() {
  const { jobId } = useParams();
  const { state, currentUser } = useStore();
  const job = sel.job(state, jobId ?? '');
  if (!job) return <NotFound />;
  const existing = state.applications.find((a) => a.jobId === job.id && a.applicantId === currentUser!.id);
  const closed = isPastDeadline(job.deadline);

  return (
    <>
      <ButtonLink to="/applicant/jobs" variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-3">All jobs</ButtonLink>
      <PageHeader eyebrow={job.company} title={job.title} description={<span className="mt-2 block"><JobMeta job={job} /></span>}
        actions={existing
          ? <ButtonLink to="/applicant/applications" variant="secondary" icon={CheckCircle2}>Applied {fmtDate(existing.submittedAt)} — view</ButtonLink>
          : closed ? null : <ButtonLink to={`/applicant/jobs/${job.id}/apply`} icon={Send} size="lg">Apply</ButtonLink>} />
      {closed && !existing && <Alert tone="warning" className="mb-5">The application deadline for this job has passed.</Alert>}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink">About the role</h2>
          <p className="mt-2 leading-7 text-slate-700">{job.description}</p>
          <h2 className="mt-6 text-base font-semibold text-ink">Key qualifications</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-700">{job.qualifications.map((q) => <li key={q}>{q}</li>)}</ul>
        </Card>
        <Card className="h-fit p-5">
          <h2 className="text-sm font-semibold text-ink">Feedback commitment</h2>
          <div className="mt-2"><FeedbackParticipant job={job} /></div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {job.company} reviews applications in Employer.MD. Reviewers can highlight parts of your resume, explain what worked and what to improve, and share an overall evaluation.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Posted</dt><dd className="text-ink">{fmtDate(job.postedAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Deadline</dt><dd className="text-ink">{job.deadline ? fmtDate(job.deadline) : 'Rolling'}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">Sample posting for demonstration. Submissions are simulated in this browser.</p>
        </Card>
      </div>
    </>
  );
}
