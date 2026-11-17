import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, FileText, FileUp, Mail, Send } from 'lucide-react';
import { ActionError, sel, useStore } from '../../state/store';
import { Alert, Badge, Button, ButtonLink, Card, EmptyState, Modal, PageHeader, cx, inputCls } from '../../components/ui';
import { DocumentViewer } from '../../components/DocumentViewer';
import { useToast } from '../../components/Toast';
import { fmtDate, isPastDeadline } from '../../lib/format';
import NotFound from '../NotFound';
import type { DocumentVersion } from '../../types';

export default function Apply() {
  const { jobId } = useParams();
  const { state, actions, currentUser } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const me = currentUser!;
  const job = sel.job(state, jobId ?? '');

  const resumes = state.documents.filter((d) => d.ownerId === me.id && d.kind === 'resume');
  const covers = state.documents.filter((d) => d.ownerId === me.id && d.kind === 'cover_letter');
  // Default to the resume whose current version was uploaded most recently.
  const defaultResume = useMemo(() => [...resumes].sort((a, b) =>
    (sel.version(state, b.currentVersionId)?.uploadedAt ?? '').localeCompare(sel.version(state, a.currentVersionId)?.uploadedAt ?? ''))[0], [resumes, state]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [resumeDocId, setResumeDocId] = useState(defaultResume?.id ?? '');
  const [resumeVerId, setResumeVerId] = useState(defaultResume?.currentVersionId ?? '');
  const [coverDocId, setCoverDocId] = useState('');
  const [coverVerId, setCoverVerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newAppId, setNewAppId] = useState<string | null>(null);
  const [preview, setPreview] = useState<DocumentVersion | null>(null);

  if (!job) return <NotFound />;
  const existing = state.applications.find((a) => a.jobId === job.id && a.applicantId === me.id);
  if (existing && step !== 3) {
    return (
      <Card className="mx-auto max-w-xl">
        <EmptyState icon={CheckCircle2} title="You already applied to this job" description={`Submitted ${fmtDate(existing.submittedAt)}. Each job accepts one application per applicant.`}
          action={<ButtonLink to="/applicant/applications">View My Applications</ButtonLink>} />
      </Card>
    );
  }
  if (isPastDeadline(job.deadline) && step !== 3) {
    return <Card className="mx-auto max-w-xl"><EmptyState icon={FileText} title="Applications are closed" description="The deadline for this job has passed." action={<ButtonLink to="/applicant/jobs" variant="secondary">Browse open jobs</ButtonLink>} /></Card>;
  }

  const resumeVer = sel.version(state, resumeVerId);
  const coverVer = sel.version(state, coverVerId);

  const next = () => {
    if (!resumeVer) { setError('Select a resume to continue.'); return; }
    if (coverDocId && !coverVer) { setError('Select a cover letter version, or choose “No cover letter”.'); return; }
    setError(null); setStep(2);
  };

  const submit = async () => {
    if (submitting || newAppId) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 450)); // simulate network latency
      const id = actions.submitApplication({ jobId: job.id, resumeVersionId: resumeVerId, coverLetterVersionId: coverVerId || undefined });
      setNewAppId(id); setStep(3);
      toast({ tone: 'success', title: 'Application submitted', body: `${job.title} at ${job.company}` });
    } catch (e) {
      setError(e instanceof ActionError ? e.message : 'The application could not be submitted. Please try again.');
    } finally { setSubmitting(false); }
  };

  const stepper = (
    <ol className="mb-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Application steps">
      {['Choose documents', 'Review', 'Submitted'].map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        return (
          <li key={l} className="flex items-center gap-2" aria-current={step === n ? 'step' : undefined}>
            <span className={cx('grid size-6 place-items-center rounded-full text-xs font-semibold', step > n ? 'bg-ok text-white' : step === n ? 'bg-brand text-white' : 'bg-slate-200 text-slate-600')}>
              {step > n ? <CheckCircle2 className="size-4" aria-label="completed" /> : n}
            </span>
            <span className={step === n ? 'font-semibold text-ink' : 'text-slate-500'}>{l}</span>
            {i < 2 && <span className="mx-1 h-px w-8 bg-slate-300" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );

  const DocRow = ({ label, icon: Icon, ver }: { label: string; icon: typeof FileText; ver?: DocumentVersion }) => (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-navy-50 text-navy"><Icon className="size-5" aria-hidden /></span>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
          {ver ? <div className="font-medium text-ink">{sel.docOfVersion(state, ver.id)?.name} — Version {ver.versionNumber}</div> : <div className="text-slate-500">None</div>}
          {ver && <div className="text-xs text-slate-500">{ver.fileName} · uploaded {fmtDate(ver.uploadedAt)}</div>}
        </div>
      </div>
      {ver && <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreview(ver)}>Preview</Button>}
    </div>
  );

  return (
    <>
      <ButtonLink to={`/applicant/jobs/${job.id}`} variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-3">Job details</ButtonLink>
      <PageHeader eyebrow={job.company} title={`Apply: ${job.title}`} />
      {stepper}

      {step === 1 && (
        <Card className="max-w-3xl p-6">
          {resumes.length === 0 ? (
            <EmptyState icon={FileUp} title="Upload a resume first" description="You need at least one resume PDF to apply." action={<ButtonLink to="/applicant/documents" icon={FileUp}>Upload Resume</ButtonLink>} />
          ) : (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-base font-semibold text-ink">Resume <span className="text-bad">*</span></legend>
                <p className="mb-3 text-sm text-slate-500">The employer will see exactly the version you choose.</p>
                <div className="space-y-2">
                  {resumes.map((d) => {
                    const vers = sel.versionsOf(state, d.id);
                    const on = resumeDocId === d.id;
                    return (
                      <div key={d.id} className={cx('rounded-lg border p-3', on ? 'border-brand bg-brand-50/40 ring-1 ring-brand/30' : 'border-slate-200')}>
                        <label className="flex cursor-pointer items-center gap-3">
                          <input type="radio" name="resume" className="size-4 accent-brand" checked={on} onChange={() => { setResumeDocId(d.id); setResumeVerId(d.currentVersionId); }} />
                          <span className="flex-1"><span className="font-medium text-ink">{d.name}</span> <span className="text-sm text-slate-500">· current: v{sel.version(state, d.currentVersionId)?.versionNumber}, {fmtDate(sel.version(state, d.currentVersionId)?.uploadedAt)}</span></span>
                        </label>
                        {on && vers.length > 1 && (
                          <div className="mt-2 pl-7">
                            <label htmlFor="resume-ver" className="mr-2 text-sm text-slate-600">Version</label>
                            <select id="resume-ver" className={inputCls + ' inline-block w-auto'} value={resumeVerId} onChange={(e) => setResumeVerId(e.target.value)}>
                              {vers.map((v) => <option key={v.id} value={v.id}>Version {v.versionNumber}{v.id === d.currentVersionId ? ' (current)' : ''} — {fmtDate(v.uploadedAt)}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold text-ink">Cover letter <span className="text-sm font-normal text-slate-500">(optional)</span></legend>
                <div className="mt-3 space-y-2">
                  <label className={cx('flex cursor-pointer items-center gap-3 rounded-lg border p-3', !coverDocId ? 'border-brand bg-brand-50/40' : 'border-slate-200')}>
                    <input type="radio" name="cover" className="size-4 accent-brand" checked={!coverDocId} onChange={() => { setCoverDocId(''); setCoverVerId(''); }} />No cover letter
                  </label>
                  {covers.map((d) => (
                    <label key={d.id} className={cx('flex cursor-pointer items-center gap-3 rounded-lg border p-3', coverDocId === d.id ? 'border-brand bg-brand-50/40' : 'border-slate-200')}>
                      <input type="radio" name="cover" className="size-4 accent-brand" checked={coverDocId === d.id} onChange={() => { setCoverDocId(d.id); setCoverVerId(d.currentVersionId); }} />
                      <span><span className="font-medium text-ink">{d.name}</span> <span className="text-sm text-slate-500">· v{sel.version(state, d.currentVersionId)?.versionNumber} (current)</span></span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-slate-500">Need a different document? <Link to="/applicant/documents" className="font-medium text-brand hover:underline">Upload it first</Link>.</p>
              </fieldset>
              {error && <Alert tone="error">{error}</Alert>}
              <div className="flex justify-end"><Button onClick={next}>Review application<ArrowRight className="size-4" aria-hidden /></Button></div>
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-3xl p-6">
          <h2 className="text-base font-semibold text-ink">Review before submitting</h2>
          <p className="mt-1 text-sm text-slate-500">Check that these are the right documents. You can’t change them after submitting.</p>
          <dl className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Company</dt><dd className="font-medium text-ink">{job.company}</dd></div>
            <div><dt className="text-slate-500">Position</dt><dd className="font-medium text-ink">{job.title}</dd></div>
            <div><dt className="text-slate-500">Applicant</dt><dd className="font-medium text-ink">{me.name}</dd></div>
          </dl>
          <div className="mt-4 space-y-3">
            <DocRow label="Resume" icon={FileText} ver={resumeVer} />
            <DocRow label="Cover letter" icon={Mail} ver={coverVer} />
          </div>
          <Alert tone="info" className="mt-4">This is a prototype: submission is simulated and saved only in this browser. {job.company} participates in Employer.MD feedback{job.feedbackWindowDays ? ` (typically within ${job.feedbackWindowDays} days)` : ''}.</Alert>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep(1)} disabled={submitting}>Back</Button>
            <Button icon={Send} onClick={submit} loading={submitting} size="lg">Submit application</Button>
          </div>
        </Card>
      )}

      {step === 3 && newAppId && (
        <Card className="max-w-2xl p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-ok"><CheckCircle2 className="size-8" aria-hidden /></div>
          <h2 className="mt-4 text-xl font-semibold text-ink" tabIndex={-1} ref={(el) => el?.focus()}>Application submitted</h2>
          <p className="mt-1 text-slate-600">{job.title} at {job.company}</p>
          <div className="mx-auto mt-5 max-w-md space-y-1 rounded-lg bg-slate-50 p-4 text-left text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Status</span><Badge tone="neutral">Submitted</Badge></div>
            <div className="flex justify-between"><span className="text-slate-500">Employer review</span><Badge tone="warning">Awaiting review</Badge></div>
            <div className="flex justify-between gap-4"><span className="text-slate-500">Resume</span><span className="text-right font-medium text-ink">{sel.docOfVersion(state, resumeVerId)?.name} v{resumeVer?.versionNumber}</span></div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate('/applicant/applications')}>View My Applications</Button>
            <ButtonLink to="/applicant/jobs" variant="secondary">Browse more jobs</ButtonLink>
          </div>
        </Card>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} size="lg" title={preview ? `${sel.docOfVersion(state, preview.id)?.name} — Version ${preview.versionNumber}` : ''}>
        {preview && <div className="h-[65vh]"><DocumentViewer version={preview} compact /></div>}
      </Modal>
    </>
  );
}
