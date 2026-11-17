import { ThumbsUp, TrendingUp } from 'lucide-react';
import type { FeedbackAnnotation } from '../types';
import { Badge, cx } from './ui';
import type { ReactNode } from 'react';

export function SentimentBadge({ sentiment }: { sentiment: FeedbackAnnotation['sentiment'] }) {
  return sentiment === 'positive'
    ? <Badge tone="success" icon={ThumbsUp}>Positive</Badge>
    : <Badge tone="warning" icon={TrendingUp}>Area for improvement</Badge>;
}

/** One feedback item. Clicking it should reveal the matching resume highlight. */
export function FeedbackCard({ a, n, active, onSelect, context, actions, showDraftState, domId }: {
  domId?: string; a: FeedbackAnnotation; n?: number; active?: boolean; onSelect?: () => void; context?: ReactNode; actions?: ReactNode; showDraftState?: boolean;
}) {
  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {n !== undefined && (
          <span aria-hidden className={cx('grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold text-white', a.sentiment === 'positive' ? 'bg-green-600' : 'bg-amber-500')}>{n}</span>
        )}
        <SentimentBadge sentiment={a.sentiment} />
        <span className="text-sm font-semibold text-ink">{a.reason}</span>
        {showDraftState && (a.state === 'draft'
          ? <Badge tone="neutral" className="ml-auto">Draft — not sent</Badge>
          : <Badge tone="success" className="ml-auto">Sent</Badge>)}
      </div>
      <blockquote className={cx('mt-2.5 border-l-[3px] pl-3 text-sm italic text-slate-700', a.sentiment === 'positive' ? 'border-green-500' : 'border-amber-500 border-dashed')}>
        “{a.quote}”
      </blockquote>
      {a.comment
        ? <p className="mt-2.5 text-sm leading-6 text-slate-800">{a.comment}</p>
        : <p className="mt-2.5 text-sm italic text-slate-500">No written explanation added.</p>}
      {context && <div className="mt-2.5 text-xs text-slate-500">{context}</div>}
    </>
  );
  const cls = cx('w-full rounded-xl border bg-white p-4 text-left transition',
    active ? 'border-brand ring-2 ring-brand/25 shadow-sm' : 'border-slate-200 hover:border-slate-300');
  return (
    <li id={domId} className="list-none scroll-mt-4">
      {onSelect ? (
        <div className={cls}>
          <button type="button" onClick={onSelect} aria-pressed={active} className="block w-full text-left focus-visible:outline-offset-4">
            <span className="sr-only">{n !== undefined ? `Show feedback ${n} on the resume. ` : ''}</span>
            {body}
          </button>
          {actions && <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">{actions}</div>}
        </div>
      ) : (
        <div className={cls}>{body}{actions && <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">{actions}</div>}</div>
      )}
    </li>
  );
}
