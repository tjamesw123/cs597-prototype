import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Columns2, FileClock, FileText, GitCompareArrows, ListTree, MessageSquareText, Star } from 'lucide-react';
import { sel, useStore } from '../../state/store';
import { Badge, ButtonLink, Card, CardHeader, EmptyState, PageHeader, Segmented, cx, inputCls } from '../../components/ui';
import { DocumentViewer } from '../../components/DocumentViewer';
import { FeedbackCard } from '../../components/FeedbackCard';
import { DECISION_META, STATUS_META } from '../../lib/labels';
import { fmtDate, plural } from '../../lib/format';
import { byPosition } from './Feedback';
import type { DocumentVersion } from '../../types';

export default function DocumentHistory() {
  const { state, currentUser } = useStore();
  const [params, setParams] = useSearchParams();
  const myDocs = state.documents.filter((d) => d.ownerId === currentUser!.id);
  const docId = params.get('doc') && myDocs.some((d) => d.id === params.get('doc')) ? params.get('doc')! : myDocs[0]?.id;
  const doc = myDocs.find((d) => d.id === docId);
  const versions = doc ? sel.versionsOf(state, doc.id) : [];
  const versionId = versions.some((v) => v.id === params.get('version')) ? params.get('version')! : doc?.currentVersionId;
  const mode = params.get('mode') === 'compare' ? 'compare' : 'timeline';

  const setParam = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v === null ? p.delete(k) : p.set(k, v)));
    setParams(p, { replace: true });
  };

  if (!doc) {
    return (<><PageHeader title="Document History" /><Card><EmptyState icon={FileClock} title="No documents yet" description="Upload a resume or cover letter to start tracking its history." action={<ButtonLink to="/applicant/documents">Upload Resume</ButtonLink>} /></Card></>);
  }

  return (
    <>
      <PageHeader title="Document History" description="See where each version of a document was submitted and the feedback that specific version received." />
      <Card className="mb-5 flex flex-wrap items-end gap-4 p-4">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="hist-doc" className="mb-1.5 block text-sm font-medium text-slate-800">Document</label>
          <select id="hist-doc" className={inputCls} value={doc.id} onChange={(e) => setParam({ doc: e.target.value, version: null, a: null, b: null })}>
            <optgroup label="Resumes">{myDocs.filter((d) => d.kind === 'resume').map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</optgroup>
            <optgroup label="Cover letters">{myDocs.filter((d) => d.kind === 'cover_letter').map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</optgroup>
          </select>
        </div>
        <Segmented label="View mode" value={mode} onChange={(m) => setParam({ mode: m === 'compare' ? 'compare' : null })} options={[
          { value: 'timeline', label: <span className="inline-flex items-center gap-1.5"><ListTree className="size-4" aria-hidden />Version timeline</span> },
          { value: 'compare', label: <span className="inline-flex items-center gap-1.5"><GitCompareArrows className="size-4" aria-hidden />Compare versions</span> },
        ]} />
      </Card>

      {mode === 'timeline' ? (
        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          <nav aria-label={`Versions of ${doc.name}`}>
            <ol className="space-y-2">
              {versions.map((v) => {
                const used = sel.appsUsingVersion(state, v.id);
                const fb = state.annotations.filter((a) => a.documentVersionId === v.id && a.state === 'sent').length;
                const on = v.id === versionId;
                return (
                  <li key={v.id}>
                    <button type="button" onClick={() => setParam({ version: v.id })} aria-current={on ? 'true' : undefined}
                      className={cx('w-full rounded-xl border p-4 text-left transition', on ? 'border-brand bg-white ring-2 ring-brand/20' : 'border-slate-200 bg-white hover:border-slate-300')}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink">Version {v.versionNumber}</span>
                        {doc.currentVersionId === v.id ? <Badge tone="success" icon={Star}>Current</Badge> : <Badge tone="neutral">Archived</Badge>}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">Uploaded {fmtDate(v.uploadedAt)}</div>
                      <div className="mt-2 text-xs text-slate-600">{plural(used.length, 'submission')} · {plural(fb, 'feedback comment')}</div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          {versionId && <VersionDetail version={versions.find((v) => v.id === versionId)!} isCurrent={doc.currentVersionId === versionId} docName={doc.name} />}
        </div>
      ) : (
        <Compare versions={versions} a={params.get('a')} b={params.get('b')} setParam={setParam} />
      )}
    </>
  );
}

function VersionDetail({ version, isCurrent, docName }: { version: DocumentVersion; isCurrent: boolean; docName: string }) {
  const { state } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [signal, setSignal] = useState(0);
  const apps = sel.appsUsingVersion(state, version.id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const anns = state.annotations.filter((a) => a.documentVersionId === version.id && a.state === 'sent').sort(byPosition);
  const numbers = Object.fromEntries(anns.map((a, i) => [a.id, i + 1]));
  const select = (id: string) => { setActiveId(id); setSignal((s) => s + 1); document.getElementById(`hfb-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };

  return (
    <div className="min-w-0 space-y-6">
      <Card>
        <CardHeader title={<>{docName} — Version {version.versionNumber} {isCurrent ? <Badge tone="success" icon={Star} className="ml-2 align-middle">Current</Badge> : <Badge tone="neutral" className="ml-2 align-middle">Archived</Badge>}</>}
          description={`${version.fileName} · uploaded ${fmtDate(version.uploadedAt)}`} />
        <div className="p-5">
          <h3 className="text-sm font-semibold text-ink">Submitted with this version</h3>
          {apps.length === 0 ? <p className="mt-2 text-sm text-slate-500">This version hasn’t been submitted to any job yet.</p> : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th scope="col" className="py-2 pr-4">Company</th><th scope="col" className="py-2 pr-4">Position</th><th scope="col" className="py-2 pr-4">Submitted</th><th scope="col" className="py-2 pr-4">Status</th><th scope="col" className="py-2">Evaluation</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {apps.map((a) => {
                    const j = sel.job(state, a.jobId)!; const ev = sel.evaluation(state, a.evaluationId);
                    return (
                      <tr key={a.id}>
                        <td className="py-2.5 pr-4 font-medium text-ink">{j.company}</td>
                        <td className="py-2.5 pr-4"><Link to={`/applicant/feedback/${a.id}`} className="text-brand hover:underline">{j.title}</Link></td>
                        <td className="whitespace-nowrap py-2.5 pr-4 text-slate-600">{fmtDate(a.submittedAt)}</td>
                        <td className="py-2.5 pr-4"><Badge tone={STATUS_META[a.status].tone}>{STATUS_META[a.status].label}</Badge></td>
                        <td className="py-2.5">{ev ? <Badge tone={DECISION_META[ev.decision].tone}>{DECISION_META[ev.decision].label}</Badge> : <span className="text-slate-400">Not yet</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
        <section aria-label="Version preview" className="h-[70vh] min-h-[30rem] min-w-0">
          <DocumentViewer version={version} annotations={anns} numbers={numbers} activeId={activeId} focusSignal={signal} onAnnotationClick={select} />
        </section>
        <section aria-labelledby="vfb-h" className="min-w-0">
          <h3 id="vfb-h" className="mb-3 text-base font-semibold text-ink">Feedback on version {version.versionNumber} <span className="font-normal text-slate-500">({anns.length})</span></h3>
          {anns.length === 0 ? <Card><EmptyState icon={MessageSquareText} title="No feedback on this version" description="Only feedback sent for this exact version appears here." /></Card> : (
            <div className="space-y-5">
              {apps.filter((a) => anns.some((x) => x.applicationId === a.id)).map((a) => {
                const j = sel.job(state, a.jobId)!; const ev = sel.evaluation(state, a.evaluationId);
                return (
                  <div key={a.id}>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-ink">{j.company}</span><span className="text-slate-500">· {j.title}</span>
                      {ev && <Badge tone={DECISION_META[ev.decision].tone}>{DECISION_META[ev.decision].label}</Badge>}
                    </div>
                    <ul className="space-y-2">
                      {anns.filter((x) => x.applicationId === a.id).map((x) => (
                        <FeedbackCard key={x.id} domId={`hfb-${x.id}`} a={x} n={numbers[x.id]} active={activeId === x.id} onSelect={() => select(x.id)} />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Compare({ versions, a, b, setParam }: { versions: DocumentVersion[]; a: string | null; b: string | null; setParam: (p: Record<string, string | null>) => void }) {
  const { state } = useStore();
  const left = versions.find((v) => v.id === a) ?? versions[1] ?? versions[0];
  const right = versions.find((v) => v.id === b) ?? versions[0];
  const changed = useMemo(() => {
    if (!left || !right) return [new Set<number>(), new Set<number>()];
    const L = new Set(left.lines), R = new Set(right.lines);
    return [new Set(left.lines.map((l, i) => (R.has(l) ? -1 : i)).filter((i) => i >= 0)), new Set(right.lines.map((l, i) => (L.has(l) ? -1 : i)).filter((i) => i >= 0))];
  }, [left, right]);

  if (versions.length < 2) {
    return <Card><EmptyState icon={Columns2} title="Only one version so far" description="Upload a new version of this document to compare versions side by side." action={<ButtonLink to="/applicant/documents" variant="secondary">Upload new version</ButtonLink>} /></Card>;
  }

  const Side = ({ v, which, other, changedLines }: { v: DocumentVersion; which: 'a' | 'b'; other: DocumentVersion; changedLines: Set<number> }) => {
    const anns = state.annotations.filter((x) => x.documentVersionId === v.id && x.state === 'sent').sort(byPosition);
    const numbers = Object.fromEntries(anns.map((x, i) => [x.id, i + 1]));
    return (
      <section aria-label={`Version ${v.versionNumber}`} className="min-w-0">
        <label htmlFor={`cmp-${which}`} className="mb-1.5 block text-sm font-medium text-slate-800">{which === 'a' ? 'Left' : 'Right'} version</label>
        <select id={`cmp-${which}`} className={inputCls + ' mb-3'} value={v.id} onChange={(e) => setParam({ [which]: e.target.value })}>
          {versions.map((x) => <option key={x.id} value={x.id} disabled={x.id === other.id}>Version {x.versionNumber} — {fmtDate(x.uploadedAt)}</option>)}
        </select>
        <div className="h-[62vh] min-h-[26rem]"><DocumentViewer version={v} annotations={anns} numbers={numbers} changedLines={changedLines} compact /></div>
        <h3 className="mb-2 mt-4 text-sm font-semibold text-ink">Feedback on version {v.versionNumber} only ({anns.length})</h3>
        {anns.length === 0 ? <p className="text-sm text-slate-500">No feedback was sent for this version.</p> : (
          <ul className="space-y-2">{anns.map((x) => {
            const j = sel.job(state, state.applications.find((ap) => ap.id === x.applicationId)?.jobId ?? '');
            return <FeedbackCard key={x.id} a={x} n={numbers[x.id]} context={j ? `${j.company} · ${j.title}` : undefined} />;
          })}</ul>
        )}
      </section>
    );
  };

  return (
    <>
      <p className="mb-4 flex items-center gap-2 text-sm text-slate-600"><FileText className="size-4" aria-hidden />Lines marked <span className="rounded bg-sky-50 px-1 font-semibold text-sky-700 ring-1 ring-sky-200">Δ</span> don’t appear in the other version. Feedback is never mixed between versions.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Side v={left} which="a" other={right} changedLines={changed[0]} />
        <Side v={right} which="b" other={left} changedLines={changed[1]} />
      </div>
    </>
  );
}
