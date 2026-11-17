import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, FileText, FileUp, History, Loader2, Mail, Star, Trash2, Upload, Wand2 } from 'lucide-react';
import { ActionError, sel, useStore } from '../../state/store';
import { Alert, Badge, Button, ButtonLink, Card, CardHeader, ConfirmDialog, EmptyState, Field, Modal, PageHeader, cx, inputCls } from '../../components/ui';
import { DocumentViewer } from '../../components/DocumentViewer';
import { useToast } from '../../components/Toast';
import { extractLines, validatePdf } from '../../services/pdf';
import { putFile } from '../../services/fileStore';
import { DEMO_UPLOAD } from '../../data/seed';
import { fmtBytes, fmtDate, plural, uid } from '../../lib/format';
import type { DocumentKind, DocumentVersion } from '../../types';

type Phase = 'idle' | 'validating' | 'extracting' | 'saving' | 'done';

export default function Documents() {
  const { state, actions, currentUser } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const me = currentUser!;
  const myDocs = state.documents.filter((d) => d.ownerId === me.id);

  const [kind, setKind] = useState<DocumentKind>('resume');
  const [target, setTarget] = useState<string>('new');
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [makeCurrent, setMakeCurrent] = useState(true);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errors, setErrors] = useState<{ file?: string; name?: string; general?: string }>({});
  const [success, setSuccess] = useState<{ docName: string; versionNumber: number; persisted: boolean; versionId: string; documentId: string; lines: number } | null>(null);
  const [preview, setPreview] = useState<DocumentVersion | null>(null);
  const [toDelete, setToDelete] = useState<DocumentVersion | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const sameKindDocs = myDocs.filter((d) => d.kind === kind);
  const kindLabel = kind === 'resume' ? 'Resume' : 'Cover Letter';
  const busy = phase !== 'idle' && phase !== 'done';

  const chooseFile = async (f: File | null) => {
    setSuccess(null);
    setErrors((e) => ({ ...e, file: undefined, general: undefined }));
    if (!f) { setFile(null); return; }
    const err = await validatePdf(f);
    if (err) { setFile(null); setErrors((e) => ({ ...e, file: err })); if (fileInput.current) fileInput.current.value = ''; return; }
    setFile(f);
    if (target === 'new' && !name) setName(f.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  };

  const useSample = async () => {
    try {
      const res = await fetch(DEMO_UPLOAD.url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setKind('resume');
      setTarget('new');
      await chooseFile(new File([blob], DEMO_UPLOAD.fileName, { type: 'application/pdf' }));
      setName('Office & Operations Resume');
    } catch {
      setErrors({ general: 'The sample PDF could not be loaded. You can still choose any PDF from your computer.' });
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs: typeof errors = {};
    if (!file) errs.file = 'Choose a PDF file to upload.';
    if (target === 'new' && name.trim().length < 3) errs.name = 'Give the document a descriptive name (at least 3 characters), e.g. “Data Analyst Resume”.';
    if (target === 'new' && myDocs.some((d) => d.name.toLowerCase() === name.trim().toLowerCase())) errs.name = 'You already have a document with this name. Upload it as a new version instead, or choose another name.';
    setErrors(errs);
    if (Object.keys(errs).length || !file) return;
    try {
      setPhase('validating');
      const err = await validatePdf(file);
      if (err) { setErrors({ file: err }); setPhase('idle'); return; }
      setPhase('extracting');
      const bytes = await file.arrayBuffer();
      const { lines } = await extractLines(bytes.slice(0));
      if (lines.length < 3) {
        setErrors({ file: 'We couldn’t find selectable text in this PDF — it may be a scanned image. Employers need selectable text to highlight feedback. Please export your resume as a text-based PDF.' });
        setPhase('idle'); return;
      }
      setPhase('saving');
      const blobKey = uid('pdf');
      const persisted = await putFile(blobKey, new Blob([bytes], { type: 'application/pdf' }));
      const res = actions.addDocumentVersion({
        kind, name, existingDocumentId: target === 'new' ? undefined : target, fileName: file.name, fileSize: file.size, lines,
        source: { type: 'upload', blobKey, persisted }, makeCurrent: target === 'new' ? true : makeCurrent,
      });
      const docName = target === 'new' ? name.trim() : sel.document(state, target)!.name;
      setSuccess({ docName, versionNumber: res.versionNumber, persisted, versionId: res.versionId, documentId: res.documentId, lines: lines.length });
      toast({ tone: 'success', title: `${kindLabel} uploaded`, body: `${docName} — version ${res.versionNumber}` });
      setPhase('done');
      setFile(null); setName(''); setTarget('new');
      if (fileInput.current) fileInput.current.value = '';
    } catch (err) {
      setErrors({ general: err instanceof ActionError ? err.message : 'Something went wrong while reading this PDF. Please try another file.' });
      setPhase('idle');
    }
  };

  const steps: { key: Phase; label: string }[] = [
    { key: 'validating', label: 'Checking file' }, { key: 'extracting', label: 'Extracting text for highlights' }, { key: 'saving', label: 'Saving in this browser' },
  ];
  const order: Phase[] = ['idle', 'validating', 'extracting', 'saving', 'done'];

  return (
    <>
      <PageHeader title="Resumes & Cover Letters" description="Upload PDFs, keep every version, and choose which one is current. Employers see the exact version you submit." />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card id="upload" className="h-fit">
          <CardHeader title="Upload a document" description="PDF only, up to 5 MB, with selectable text." />
          <form noValidate onSubmit={submit} className="space-y-5 p-5">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-slate-800">Document type</legend>
              <div className="grid grid-cols-2 gap-2">
                {(['resume', 'cover_letter'] as const).map((k) => (
                  <label key={k} className={cx('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
                    kind === k ? 'border-brand bg-brand-50 text-brand-600' : 'border-slate-300 text-slate-700')}>
                    <input type="radio" className="sr-only" name="kind" checked={kind === k} onChange={() => { setKind(k); setTarget('new'); }} />
                    {k === 'resume' ? <FileText className="size-4" aria-hidden /> : <Mail className="size-4" aria-hidden />}{k === 'resume' ? 'Resume' : 'Cover letter'}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Save as" htmlFor="target">
              <select id="target" className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="new">A new document</option>
                {sameKindDocs.map((d) => <option key={d.id} value={d.id}>New version of “{d.name}”</option>)}
              </select>
            </Field>

            {target === 'new' ? (
              <Field label="Descriptive name" htmlFor="docname" error={errors.name} hint="Helps you tell versions apart, e.g. “Operations Resume”." required>
                <input id="docname" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'docname-error' : 'docname-hint'} />
              </Field>
            ) : (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="size-4 rounded border-slate-300 accent-brand" checked={makeCurrent} onChange={(e) => setMakeCurrent(e.target.checked)} />
                Make this the current version
              </label>
            )}

            <Field label="PDF file" htmlFor="pdf" error={errors.file} required>
              <div className={cx('rounded-lg border-2 border-dashed p-4 text-center', errors.file ? 'border-bad/50 bg-red-50/40' : 'border-slate-300 bg-slate-50')}>
                <input ref={fileInput} id="pdf" type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
                  aria-invalid={!!errors.file} aria-describedby={errors.file ? 'pdf-error' : undefined} disabled={busy} />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-ok" aria-hidden />
                    <span className="font-medium text-ink">{file.name}</span><span className="text-slate-500">({fmtBytes(file.size)})</span>
                  </div>
                ) : <p className="text-sm text-slate-500">No file chosen</p>}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <label htmlFor="pdf" className={cx('inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50', busy && 'pointer-events-none opacity-50')}
                    tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.current?.click(); } }}>
                    <FileUp className="size-4" aria-hidden />Choose PDF
                  </label>
                  <Button size="sm" variant="ghost" icon={Wand2} onClick={useSample} disabled={busy} className="h-9">Use sample resume</Button>
                </div>
              </div>
            </Field>

            {errors.general && <Alert tone="error">{errors.general}</Alert>}

            {busy && (
              <ol className="space-y-1.5 rounded-lg bg-slate-50 p-3 text-sm" aria-live="polite">
                {steps.map((s) => {
                  const done = order.indexOf(phase) > order.indexOf(s.key);
                  const active = phase === s.key;
                  return (
                    <li key={s.key} className={cx('flex items-center gap-2', done ? 'text-ok' : active ? 'text-ink' : 'text-slate-400')}>
                      {done ? <CheckCircle2 className="size-4" aria-hidden /> : active ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <span className="size-4 rounded-full border border-slate-300" aria-hidden />}
                      {s.label}{done && <span className="sr-only"> (done)</span>}
                    </li>
                  );
                })}
              </ol>
            )}

            {success && (
              <Alert tone="success" title={`Upload complete — ${success.docName}, version ${success.versionNumber}`} onClose={() => setSuccess(null)}>
                <p>Extracted {success.lines} lines of text for employer highlighting.{' '}
                  {success.persisted ? 'The PDF is stored in this browser (IndexedDB) and will survive a refresh.' : 'Browser storage was unavailable, so the original PDF is kept only until you refresh; the extracted text is saved.'}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button type="button" className="font-semibold underline" onClick={() => setPreview(sel.version(state, success.versionId) ?? null)}>Preview</button>
                  <button type="button" className="font-semibold underline" onClick={() => navigate('/applicant/jobs')}>Browse jobs to apply</button>
                </div>
              </Alert>
            )}

            <Button type="submit" className="w-full" icon={Upload} loading={busy}>{busy ? 'Uploading…' : `Upload ${kindLabel}`}</Button>
            <p className="text-xs text-slate-500">
              Files stay in this browser only; nothing is sent to a server. Need a test file? <a href={DEMO_UPLOAD.url} download className="font-medium text-brand underline">Download the sample resume PDF</a>.
            </p>
          </form>
        </Card>

        <div className="space-y-6">
          {(['resume', 'cover_letter'] as const).map((k) => {
            const docs = myDocs.filter((d) => d.kind === k);
            return (
              <section key={k} aria-labelledby={`h-${k}`}>
                <h2 id={`h-${k}`} className="mb-3 text-lg font-semibold text-ink">{k === 'resume' ? 'Resumes' : 'Cover letters'} <span className="text-sm font-normal text-slate-500">({docs.length})</span></h2>
                {docs.length === 0 ? (
                  <Card><EmptyState icon={FileText} title={`No ${k === 'resume' ? 'resumes' : 'cover letters'} yet`} description="Upload a PDF to get started." /></Card>
                ) : (
                  <div className="space-y-4">
                    {docs.map((d) => {
                      const versions = sel.versionsOf(state, d.id);
                      return (
                        <Card key={d.id}>
                          <CardHeader title={d.name} description={`${plural(versions.length, 'version')} · created ${fmtDate(d.createdAt)}`}
                            action={<ButtonLink size="sm" variant="ghost" icon={History} to={`/applicant/history?doc=${d.id}`}>History</ButtonLink>} />
                          <ul className="divide-y divide-slate-100">
                            {versions.map((v) => {
                              const used = sel.appsUsingVersion(state, v.id);
                              const current = d.currentVersionId === v.id;
                              return (
                                <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-medium text-ink">Version {v.versionNumber}</span>
                                      {current ? <Badge tone="success" icon={Star}>Current</Badge> : <Badge tone="neutral">Archived</Badge>}
                                      <span className="truncate text-sm text-slate-500">{v.fileName}</span>
                                    </div>
                                    <div className="mt-0.5 text-sm text-slate-600">
                                      Uploaded {fmtDate(v.uploadedAt)} · {used.length === 0 ? 'Not used in any application' : (
                                        <>Used in {used.map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link className="text-brand hover:underline" to={`/applicant/feedback/${a.id}`}>{sel.job(state, a.jobId)?.company}</Link></span>)}</>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    <Button size="sm" variant="secondary" icon={Eye} onClick={() => setPreview(v)} aria-label={`Preview ${d.name} version ${v.versionNumber}`}>Preview</Button>
                                    {!current && <Button size="sm" variant="secondary" icon={Star} onClick={() => { actions.setCurrentVersion(d.id, v.id); toast({ tone: 'success', title: `Version ${v.versionNumber} is now current`, body: d.name }); }}>Set as current</Button>}
                                    {used.length === 0 && <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setToDelete(v)} aria-label={`Delete ${d.name} version ${v.versionNumber}`} className="text-bad hover:bg-red-50">Delete</Button>}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} size="lg"
        title={preview ? `${sel.docOfVersion(state, preview.id)?.name ?? 'Document'} — Version ${preview.versionNumber}` : ''}
        description={preview ? `Uploaded ${fmtDate(preview.uploadedAt)}` : undefined}>
        {preview && <div className="h-[65vh]"><DocumentViewer version={preview} compact /></div>}
      </Modal>

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this version?" tone="danger" confirmLabel="Delete version"
        onConfirm={() => {
          if (!toDelete) return;
          try { actions.deleteVersion(toDelete.id); toast({ tone: 'success', title: 'Version deleted' }); }
          catch (e) { toast({ tone: 'error', title: 'Could not delete', body: e instanceof Error ? e.message : undefined }); }
          setToDelete(null);
        }}>
        {toDelete && <>Version {toDelete.versionNumber} ({toDelete.fileName}) will be permanently removed from this browser. Versions used in applications can’t be deleted.</>}
      </ConfirmDialog>
    </>
  );
}
