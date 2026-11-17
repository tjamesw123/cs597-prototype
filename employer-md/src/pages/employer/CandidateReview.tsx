import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Highlighter, MousePointerClick, Pencil, Plus, Settings2, ThumbsUp, Trash2, TrendingUp, X } from 'lucide-react';
import { ActionError, sel, useStore } from '../../state/store';
import { Alert, Badge, Button, ButtonLink, Card, CardHeader, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Segmented, cx, inputCls } from '../../components/ui';
import { DocumentViewer } from '../../components/DocumentViewer';
import { FeedbackCard } from '../../components/FeedbackCard';
import { useToast } from '../../components/Toast';
import { DECISION_META, REVIEW_META } from '../../lib/labels';
import { fmtDate, plural } from '../../lib/format';
import { quoteFromRange } from '../../lib/textRange';
import { byPosition } from '../applicant/Feedback';
import type { FeedbackSentiment, TextRange } from '../../types';
import NotFound from '../NotFound';

const MAX_COMMENT = 500;

export default function CandidateReview() {
  const { appId } = useParams();
  const { state, actions, currentUser } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const app = sel.employerApps(state, currentUser!.id).find((a) => a.id === appId);

  const [docTab, setDocTab] = useState<'resume' | 'cover'>('resume');
  const [range, setRange] = useState<TextRange | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<FeedbackSentiment | null>(null);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [signal, setSignal] = useState(0);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [manageReasons, setManageReasons] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const resume = app ? sel.version(state, app.resumeVersionId) : undefined;
  const cover = app ? sel.version(state, app.coverLetterVersionId) : undefined;
  const anns = useMemo(() => (app ? state.annotations.filter((a) => a.applicationId === app.id).sort(byPosition) : []), [app, state.annotations]);
  const numbers = useMemo(() => Object.fromEntries(anns.map((a, i) => [a.id, i + 1])), [anns]);

  useEffect(() => { setRange(null); setEditingId(null); setSavedNotice(null); }, [appId]);

  if (!app || !resume) return <NotFound />;
  const applicant = sel.user(state, app.applicantId)!;
  const job = sel.job(state, app.jobId)!;
  const ev = sel.evaluation(state, app.evaluationId);
  const readOnly = app.reviewStatus === 'reviewed';
  const drafts = anns.filter((a) => a.state === 'draft');
  const editorOpen = !readOnly && (range !== null || editingId !== null);
  const editing = editingId ? anns.find((a) => a.id === editingId) : undefined;
  const quote = editing ? editing.quote : range ? quoteFromRange(resume.lines, range) : '';

  const resetEditor = () => { setRange(null); setEditingId(null); setSentiment(null); setReason(''); setComment(''); setFormError(null); window.getSelection()?.removeAllRanges(); };

  const onSelectRange = (r: TextRange) => {
    if (readOnly) return;
    setEditingId(null); setRange(r); setSavedNotice(null); setFormError(null);
    setSentiment(null); setReason(''); setComment('');
    requestAnimationFrame(() => document.getElementById('editor')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  const startEdit = (id: string) => {
    const a = anns.find((x) => x.id === id); if (!a) return;
    setRange(null); setEditingId(id); setSentiment(a.sentiment); setReason(a.reason); setComment(a.comment ?? ''); setSavedNotice(null); setFormError(null);
    setActiveId(id); setSignal((s) => s + 1);
    requestAnimationFrame(() => document.getElementById('editor')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!sentiment) { setFormError('Choose a feedback category: Positive feedback or Areas for improvement.'); return; }
    if (!reason) { setFormError('Choose a feedback reason.'); return; }
    if (comment.length > MAX_COMMENT) { setFormError(`Keep the explanation under ${MAX_COMMENT} characters.`); return; }
    try {
      if (editingId) {
        actions.updateDraft(editingId, { sentiment, reason, comment });
        setSavedNotice('Changes saved — not sent yet.');
        setActiveId(editingId);
      } else if (range) {
        const id = actions.saveDraft({ applicationId: app.id, documentVersionId: resume.id, range, quote, sentiment, reason, comment });
        setSavedNotice('Comment saved — not sent yet.');
        setActiveId(id);
      }
      resetEditor();
    } catch (err) {
      setFormError(err instanceof ActionError ? err.message : 'Could not save this comment.');
    }
  };

  const selectAnn = (id: string) => { setActiveId(id); setSignal((s) => s + 1); document.getElementById(`dr-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
  const reasons = sentiment ? state.feedbackReasons[sentiment] : [];

  return (
    <>
      <ButtonLink to="/employer/applications" variant="ghost" size="sm" icon={ArrowLeft} className="-ml-2 mb-3">Applications</ButtonLink>
      <PageHeader eyebrow="Candidate review" title={applicant.name}
        description={<span className="inline-flex flex-wrap items-center gap-2">{job.title} · {job.company} <Badge tone={REVIEW_META[app.reviewStatus].tone}>{REVIEW_META[app.reviewStatus].label}</Badge></span>}
        actions={!readOnly && (
          <Button size="lg" onClick={() => navigate(`/employer/review/${app.id}/decision`)}>Continue to Overall Decision<ArrowRight className="size-4" aria-hidden /></Button>
        )} />

      {/* 1. Candidate information and job details */}
      <Card className="mb-6">
        <dl className="grid gap-4 p-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Candidate</dt><dd className="mt-1 font-medium text-ink">{applicant.name}</dd><dd className="text-slate-600">{applicant.title}</dd><dd className="text-slate-500">{applicant.email}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Position</dt><dd className="mt-1 font-medium text-ink">{job.title}</dd><dd className="text-slate-600">{job.location} · {job.employmentType}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted</dt><dd className="mt-1 font-medium text-ink">{fmtDate(app.submittedAt)}</dd><dd className="text-slate-600">{resume.fileName}{cover ? ' + cover letter' : ''}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Key qualifications</dt><dd className="mt-1"><ul className="list-disc space-y-0.5 pl-4 text-slate-600">{job.qualifications.slice(0, 3).map((q) => <li key={q}>{q}</li>)}</ul></dd></div>
        </dl>
      </Card>

      {readOnly && ev && (
        <Alert tone="success" className="mb-6" title={`Feedback sent ${fmtDate(ev.sentAt)} — ${DECISION_META[ev.decision].label}`}>
          This review is complete and read-only. {plural(ev.commentCount, 'comment')} {ev.commentCount === 1 ? 'was' : 'were'} sent to {applicant.firstName}. <Link to={`/employer/review/${app.id}/sent`} className="font-semibold underline">View sent summary</Link>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,1fr)]">
        {/* 2 + 3. Resume preview and highlighting */}
        <section aria-labelledby="doc-h" className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 id="doc-h" className="text-base font-semibold text-ink">Submitted documents</h2>
            {cover && <Segmented size="sm" label="Document" value={docTab} onChange={setDocTab} options={[{ value: 'resume', label: 'Resume' }, { value: 'cover', label: 'Cover letter' }]} />}
          </div>
          {!readOnly && docTab === 'resume' && (
            <p className="mb-3 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-600">
              <MousePointerClick className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span><strong>Select text</strong> on the resume to attach feedback. Keyboard: Tab to a line and press <kbd className="rounded border border-indigo-200 bg-white px-1 text-xs">Enter</kbd> to select the whole line.</span>
            </p>
          )}
          <div className="h-[72vh] min-h-[31rem]">
            {docTab === 'resume' || !cover ? (
              <DocumentViewer version={resume} annotations={anns} numbers={numbers} activeId={activeId} focusSignal={signal}
                onAnnotationClick={selectAnn} selectable={!readOnly} pendingRange={range} onSelectRange={onSelectRange}
                label={`${applicant.name}'s resume`} />
            ) : (
              <DocumentViewer version={cover} label={`${applicant.name}'s cover letter`} />
            )}
          </div>
          {docTab === 'cover' && <p className="mt-2 text-xs text-slate-500">Highlights and comments are attached to the resume in this prototype.</p>}
        </section>

        {/* 4–6. Feedback editor, saved feedback list, overall evaluation action */}
        <aside className="min-w-0 space-y-5" aria-label="Feedback">
          {savedNotice && (
            <Alert tone="success" title={savedNotice} onClose={() => setSavedNotice(null)}>
              Draft comments stay private until you click <strong>Send Feedback and Decision</strong>.
            </Alert>
          )}

          {editorOpen ? (
            <Card id="editor" className="scroll-mt-4 ring-2 ring-brand/20">
              <CardHeader title={editing ? `Edit comment ${numbers[editing.id]}` : 'Add feedback'} description="Draft — not visible to the applicant yet."
                action={<button type="button" onClick={resetEditor} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Cancel and close editor"><X className="size-4" /></button>} />
              <form noValidate onSubmit={save} className="space-y-4 p-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected resume text</div>
                  <blockquote className="mt-1.5 rounded-lg border-l-[3px] border-brand bg-slate-50 px-3 py-2 text-sm italic text-ink">“{quote}”</blockquote>
                </div>
                <fieldset>
                  <legend className="mb-1.5 text-sm font-medium text-slate-800">Feedback category <span className="text-bad" aria-hidden>*</span></legend>
                  <div className="grid grid-cols-2 gap-2">
                    {([['positive', 'Positive feedback', ThumbsUp], ['improvement', 'Areas for Improvement', TrendingUp]] as const).map(([v, l, Icon]) => (
                      <label key={v} className={cx('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
                        sentiment === v ? (v === 'positive' ? 'border-green-600 bg-green-50 text-ok' : 'border-amber-500 bg-amber-50 text-amber-800') : 'border-slate-300 text-slate-700 hover:border-slate-400')}>
                        <input type="radio" name="sentiment" className="sr-only" checked={sentiment === v} onChange={() => { setSentiment(v); if (!state.feedbackReasons[v].includes(reason)) setReason(''); setFormError(null); }} />
                        <Icon className="size-4" aria-hidden />{l}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {sentiment && (
                  <fieldset>
                    <div className="mb-1.5 flex items-center justify-between">
                      <legend className="text-sm font-medium text-slate-800">Reason <span className="text-bad" aria-hidden>*</span></legend>
                      <button type="button" onClick={() => setManageReasons(true)} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><Settings2 className="size-3.5" aria-hidden />Edit reasons</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((r) => (
                        <label key={r} className={cx('cursor-pointer rounded-full border px-3 py-1.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
                          reason === r ? 'border-brand bg-brand text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400')}>
                          <input type="radio" name="reason" className="sr-only" checked={reason === r} onChange={() => { setReason(r); setFormError(null); }} />
                          {reason === r && <CheckCircle2 className="-ml-0.5 mr-1 inline size-3.5 align-[-2px]" aria-hidden />}{r}
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <label htmlFor="custom-reason" className="sr-only">Add a custom reason</label>
                      <input id="custom-reason" className={inputCls + ' h-8 py-1'} placeholder="Add a custom reason…" value={customReason} maxLength={40} onChange={(e) => setCustomReason(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (customReason.trim()) { actions.addReason(sentiment, customReason); setReason(customReason.trim()); setCustomReason(''); } } }} />
                      <Button size="sm" variant="secondary" icon={Plus} disabled={!customReason.trim()} onClick={() => { actions.addReason(sentiment, customReason); setReason(customReason.trim()); setCustomReason(''); }}>Add</Button>
                    </div>
                  </fieldset>
                )}
                <Field label="Written explanation (optional)" htmlFor="comment" hint={`${comment.length}/${MAX_COMMENT} — specific suggestions are most helpful.`}>
                  <textarea id="comment" rows={4} className={inputCls} value={comment} maxLength={MAX_COMMENT} onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Add measurable details — how many people, how often, and what improved?" aria-describedby="comment-hint" />
                </Field>
                {formError && <Alert tone="error">{formError}</Alert>}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={resetEditor}>Cancel</Button>
                  <Button type="submit" icon={CheckCircle2}>{editing ? 'Save changes' : 'Save comment'}</Button>
                </div>
              </form>
            </Card>
          ) : !readOnly && (
            <Card className="border-dashed p-5 text-center">
              <Highlighter className="mx-auto size-6 text-brand" aria-hidden />
              <p className="mt-2 text-sm font-medium text-ink">Highlight resume text to add feedback</p>
              <p className="mt-1 text-sm text-slate-500">Choose a category and reason, then add an optional explanation.</p>
            </Card>
          )}

          <Card>
            <CardHeader title={readOnly ? `Sent feedback (${anns.length})` : `Draft comments (${drafts.length})`}
              description={readOnly ? `Visible to ${applicant.firstName}.` : 'Saved but not sent. Edit or delete before sending.'} />
            {anns.length === 0 ? <EmptyState icon={Highlighter} title={readOnly ? 'No comments were sent' : 'No comments yet'} description={readOnly ? undefined : 'Your saved comments will appear here.'} /> : (
              <ul className="max-h-[52vh] space-y-3 overflow-y-auto p-4">
                {anns.map((a) => (
                  <FeedbackCard key={a.id} domId={`dr-${a.id}`} a={a} n={numbers[a.id]} active={activeId === a.id} onSelect={() => selectAnn(a.id)} showDraftState
                    actions={a.state === 'draft' ? (<>
                      <Button size="sm" variant="secondary" icon={Pencil} onClick={() => startEdit(a.id)} aria-label={`Edit comment ${numbers[a.id]}`}>Edit</Button>
                      <Button size="sm" variant="ghost" icon={Trash2} className="text-bad hover:bg-red-50" onClick={() => setToDelete(a.id)} aria-label={`Delete comment ${numbers[a.id]}`}>Delete</Button>
                    </>) : undefined} />
                ))}
              </ul>
            )}
          </Card>

          {!readOnly && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Ready to decide?</h2>
              <p className="mt-1 text-sm text-slate-600">Next you’ll choose an overall evaluation and confirm before anything is sent to {applicant.firstName}.</p>
              <Button className="mt-3 w-full" onClick={() => navigate(`/employer/review/${app.id}/decision`)}>Continue to Overall Decision<ArrowRight className="size-4" aria-hidden /></Button>
            </Card>
          )}
        </aside>
      </div>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this draft comment?" tone="danger" confirmLabel="Delete comment"
        onConfirm={() => { if (toDelete) { actions.deleteDraft(toDelete); if (editingId === toDelete) resetEditor(); toast({ tone: 'success', title: 'Draft comment deleted' }); } setToDelete(null); }}>
        The highlight and its comment will be removed. This can’t be undone.
      </ConfirmDialog>

      <Modal open={manageReasons} onClose={() => setManageReasons(false)} title="Manage feedback reasons" description="These defaults are shared by everyone reviewing on your team in this demo." size="md">
        <ReasonManager />
      </Modal>
    </>
  );
}

function ReasonManager() {
  const { state, actions } = useStore();
  const [drafts, setDrafts] = useState<Record<FeedbackSentiment, string>>({ positive: '', improvement: '' });
  return (
    <div className="space-y-6">
      {(['positive', 'improvement'] as const).map((s) => (
        <section key={s} aria-labelledby={`rm-${s}`}>
          <h3 id={`rm-${s}`} className="mb-2 text-sm font-semibold text-ink">{s === 'positive' ? 'Positive feedback' : 'Areas for improvement'}</h3>
          <ul className="flex flex-wrap gap-2">
            {state.feedbackReasons[s].map((r) => (
              <li key={r} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white py-1 pl-3 pr-1 text-sm">
                {r}
                <button type="button" onClick={() => actions.removeReason(s, r)} disabled={state.feedbackReasons[s].length <= 1} aria-label={`Remove reason ${r}`}
                  className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-bad disabled:opacity-30"><X className="size-3.5" /></button>
              </li>
            ))}
          </ul>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); actions.addReason(s, drafts[s]); setDrafts({ ...drafts, [s]: '' }); }}>
            <label htmlFor={`rm-in-${s}`} className="sr-only">New {s} reason</label>
            <input id={`rm-in-${s}`} className={inputCls + ' h-9'} value={drafts[s]} maxLength={40} placeholder="New reason" onChange={(e) => setDrafts({ ...drafts, [s]: e.target.value })} />
            <Button type="submit" size="sm" variant="secondary" icon={Plus} disabled={!drafts[s].trim()} className="h-9">Add</Button>
          </form>
        </section>
      ))}
      <p className="text-xs text-slate-500">Removing a reason doesn’t change comments that already use it.</p>
    </div>
  );
}
