import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { FileText, FileType2, Loader2 } from 'lucide-react';
import type { DocumentVersion, FeedbackAnnotation, TextRange } from '../types';
import { coverageOnLine, selectionToRange, tidyRange, wholeLineRange } from '../lib/textRange';
import { loadPdfBytes, pdfjs } from '../services/pdf';
import { Segmented, cx } from './ui';

export interface ViewerProps {
  version: DocumentVersion;
  annotations?: FeedbackAnnotation[];
  /** Display numbers for annotations (id → n). Defaults to array order. */
  numbers?: Record<string, number>;
  activeId?: string | null;
  /** Increment to scroll the active highlight into view and pulse it. */
  focusSignal?: number;
  onAnnotationClick?: (id: string) => void;
  selectable?: boolean;
  pendingRange?: TextRange | null;
  onSelectRange?: (r: TextRange) => void;
  compact?: boolean;
  /** Line indexes to flag as changed (version comparison). */
  changedLines?: Set<number>;
  label?: string;
}

const isSection = (l: string) => l.length < 40 && /[A-Z]/.test(l) && l === l.toUpperCase() && !/[a-z]/.test(l);

export function DocumentViewer(props: ViewerProps) {
  const [tab, setTab] = useState<'text' | 'pdf'>('text');
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Segmented size="sm" label="Document view" value={tab} onChange={setTab} options={[
          { value: 'text', label: <span className="inline-flex items-center gap-1"><FileText className="size-3.5" aria-hidden />{props.selectable || props.annotations?.length ? 'Highlights view' : 'Text view'}</span> },
          { value: 'pdf', label: <span className="inline-flex items-center gap-1"><FileType2 className="size-3.5" aria-hidden />Original PDF</span> },
        ]} />
        <span className="truncate text-xs text-slate-500" title={props.version.fileName}>{props.version.fileName}</span>
      </div>
      {tab === 'text' ? <TextPage {...props} /> : <PdfPages version={props.version} />}
    </div>
  );
}

function TextPage({ version, annotations = [], numbers, activeId, focusSignal, onAnnotationClick, selectable, pendingRange, onSelectRange, compact, changedLines, label }: ViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lines = version.lines;
  const isLetter = lines.some((l) => l.startsWith('Dear '));
  const nums = useMemo(() => numbers ?? Object.fromEntries(annotations.map((a, i) => [a.id, i + 1])), [numbers, annotations]);

  useEffect(() => {
    if (!activeId || !ref.current) return;
    const el = ref.current.querySelector<HTMLElement>(`[data-ann-start="${activeId}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const marks = ref.current.querySelectorAll<HTMLElement>(`[data-ann~="${activeId}"]`);
    marks.forEach((m) => { m.classList.remove('hl-pulse'); void m.offsetWidth; m.classList.add('hl-pulse'); });
  }, [activeId, focusSignal]);

  const handleMouseUp = () => {
    if (!selectable || !ref.current || !onSelectRange) return;
    const raw = selectionToRange(ref.current);
    if (!raw) return;
    const r = tidyRange(lines, raw);
    if (r) onSelectRange(r);
  };

  const onLineKey = (e: KeyboardEvent, i: number) => {
    if (!selectable || !onSelectRange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const r = wholeLineRange(lines, i);
      if (r) onSelectRange(r);
    }
  };

  return (
    <div ref={ref} onMouseUp={handleMouseUp} aria-label={label ?? `${version.fileName}, version ${version.versionNumber}`} role="document"
      className={cx('relative flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-100/70', compact ? 'p-2 sm:p-3' : 'p-3 sm:p-6')}>
      <div className={cx('mx-auto max-w-[45rem] rounded-md bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)]', compact ? 'px-4 py-5 sm:px-6' : 'px-5 py-7 sm:px-10 sm:py-10', selectable && 'selection:bg-indigo-200')}>
        {lines.map((line, i) => {
          const starts = annotations.filter((a) => a.range.startLine === i);
          const kind = i === 0 ? 'name' : i === 1 ? 'contact' : isLetter ? 'para' : isSection(line) ? 'section' : line.startsWith('•') ? 'bullet' : 'role';
          return (
            <div key={i} className={cx('group relative flex gap-2',
              kind === 'section' && 'mt-4 border-b border-slate-200 pb-1', kind === 'contact' && 'mb-4', kind === 'para' && 'mb-1.5',
              changedLines?.has(i) && 'rounded bg-sky-50 ring-1 ring-sky-200')}>
              {/* Gutter with numbered markers (kept outside the text node so offsets stay exact). */}
              <div className="flex w-7 shrink-0 flex-col items-end gap-0.5 pt-0.5 select-none" aria-hidden={starts.length === 0}>
                {starts.map((a) => (
                  <button key={a.id} type="button" onClick={() => onAnnotationClick?.(a.id)}
                    aria-label={`Feedback ${nums[a.id]}: ${a.sentiment === 'positive' ? 'Positive' : 'Area for improvement'} — ${a.reason}`}
                    className={cx('grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] font-bold leading-none ring-2 transition',
                      a.sentiment === 'positive' ? 'bg-green-600 text-white ring-green-200' : 'bg-amber-500 text-white ring-amber-200',
                      activeId === a.id && 'scale-110 ring-brand')}>
                    {nums[a.id]}
                  </button>
                ))}
                {changedLines?.has(i) && starts.length === 0 && <span className="text-[0.625rem] font-semibold uppercase text-sky-700" title="Changed from the other version">Δ</span>}
              </div>
              <span
                data-line={i}
                tabIndex={selectable ? 0 : undefined}
                onKeyDown={(e) => onLineKey(e, i)}
                aria-label={selectable ? `Line ${i + 1}: ${line}. Press Enter to select this line for feedback.` : undefined}
                className={cx('block min-w-0 flex-1 whitespace-pre-wrap break-words',
                  kind === 'name' && 'text-2xl font-bold tracking-tight text-navy',
                  kind === 'contact' && 'text-[0.8125rem] text-slate-500',
                  kind === 'section' && 'text-[0.8125rem] font-bold tracking-[0.08em] text-navy',
                  kind === 'bullet' && 'pl-4 text-[0.875rem] leading-6 text-slate-800',
                  kind === 'role' && 'mt-1.5 text-[0.875rem] font-semibold text-ink',
                  kind === 'para' && 'text-[0.9375rem] leading-7 text-slate-800',
                  selectable && 'cursor-text rounded-sm hover:bg-indigo-50/60')}>
                <LineSegments line={line} index={i} annotations={annotations} activeId={activeId} pending={pendingRange} onClick={onAnnotationClick} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineSegments({ line, index, annotations, activeId, pending, onClick }: {
  line: string; index: number; annotations: FeedbackAnnotation[]; activeId?: string | null; pending?: TextRange | null; onClick?: (id: string) => void;
}) {
  const covers = annotations.map((a) => ({ a, c: coverageOnLine(a.range, index, line.length) })).filter((x) => x.c) as { a: FeedbackAnnotation; c: [number, number] }[];
  const pend = pending ? coverageOnLine(pending, index, line.length) : null;
  if (!covers.length && !pend) return <>{line}</>;
  const cuts = new Set<number>([0, line.length]);
  covers.forEach(({ c }) => { cuts.add(c[0]); cuts.add(c[1]); });
  if (pend) { cuts.add(pend[0]); cuts.add(pend[1]); }
  const pts = [...cuts].sort((x, y) => x - y);
  const segs: ReactElement[] = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const [s, e] = [pts[k], pts[k + 1]];
    if (e <= s) continue;
    const text = line.slice(s, e);
    const here = covers.filter(({ c }) => c[0] <= s && c[1] >= e).map((x) => x.a);
    const isPending = !!pend && pend[0] <= s && pend[1] >= e;
    if (!here.length && !isPending) { segs.push(<span key={k}>{text}</span>); continue; }
    const top = here.find((a) => a.id === activeId) ?? here[here.length - 1];
    const startOf = here.find((a) => a.range.startLine === index && a.range.startOffset === s);
    segs.push(
      <mark key={k} data-ann={here.map((a) => a.id).join(' ')} data-ann-start={startOf?.id}
        onClick={top && onClick ? (ev) => { if (!window.getSelection()?.toString()) { ev.stopPropagation(); onClick(top.id); } } : undefined}
        className={cx('rounded-[3px] px-0 text-inherit transition-colors',
          isPending && !top && 'bg-indigo-200 underline decoration-brand decoration-2 underline-offset-4',
          top && (top.sentiment === 'positive'
            ? 'bg-green-100 underline decoration-green-600 decoration-2 underline-offset-[5px]'
            : 'bg-amber-100 underline decoration-amber-500 decoration-dashed decoration-2 underline-offset-[5px]'),
          top && onClick && 'cursor-pointer',
          top && activeId && here.some((a) => a.id === activeId) && (top.sentiment === 'positive' ? 'bg-green-200' : 'bg-amber-200'),
          isPending && top && 'outline outline-2 outline-brand')}>
        {text}
      </mark>,
    );
  }
  return <>{segs}</>;
}

/** Renders the original PDF pages with PDF.js. */
function PdfPages({ version }: { version: DocumentVersion }) {
  const box = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    const container = box.current;
    (async () => {
      setStatus('loading');
      try {
        const bytes = await loadPdfBytes(version.source);
        if (cancelled) return;
        if (!bytes) { setStatus('missing'); return; }
        const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
        if (cancelled || !container) return;
        container.innerHTML = '';
        const width = Math.min(container.clientWidth - 24, 760);
        for (let p = 1; p <= doc.numPages; p++) {
          const page = await doc.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const scale = width / base.width;
          const vp = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          canvas.style.width = `${width}px`;
          canvas.className = 'mx-auto mb-3 block rounded bg-white shadow';
          canvas.setAttribute('aria-label', `Page ${p} of ${doc.numPages}`);
          container.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;
          if (cancelled) return;
        }
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [version]);

  return (
    <div className="relative min-h-[26rem] flex-1 overflow-auto rounded-xl border border-slate-200 bg-slate-100/70 p-3">
      {status === 'loading' && <div className="absolute inset-0 grid place-items-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Rendering PDF…</span></div>}
      {status === 'missing' && <p className="p-6 text-sm text-slate-600">The original PDF file is not available in this browser (browser storage may have been cleared). The extracted text — and every highlight attached to it — is still saved in the Highlights view.</p>}
      {status === 'error' && <p className="p-6 text-sm text-bad">This PDF could not be rendered. The extracted text is still available in the Highlights view.</p>}
      <div ref={box} />
      {status === 'ready' && <p className="mt-1 text-center text-xs text-slate-500">Highlights are shown in the Highlights view, which uses the text extracted from this PDF.</p>}
    </div>
  );
}
