import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Circle, Clock, Info, Loader2, X, XCircle, type LucideIcon } from 'lucide-react';
import type { Tone } from '../lib/labels';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------- Buttons ----------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'navy';
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-sm disabled:bg-brand/50',
  navy: 'bg-navy text-white hover:bg-navy-700 shadow-sm disabled:bg-navy/50',
  secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50 hover:border-slate-400 disabled:text-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-bad text-white hover:bg-red-700 shadow-sm disabled:bg-bad/50',
};
const sizes = { sm: 'h-8 px-3 text-sm gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-5 text-base gap-2' };
const btnBase = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed whitespace-nowrap';

export function Button({
  variant = 'primary', size = 'md', icon: Icon, loading, className, children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes; icon?: LucideIcon; loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} aria-busy={loading || undefined} className={cx(btnBase, variants[variant], sizes[size], className)}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : Icon ? <Icon className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'md', icon: Icon, className, children, ...rest }: LinkProps & { variant?: Variant; size?: keyof typeof sizes; icon?: LucideIcon }) {
  return (
    <Link {...rest} className={cx(btnBase, variants[variant], sizes[size], className)}>
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </Link>
  );
}

// ---------- Badge (always text + icon, never color alone) ----------
const toneStyles: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-300',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
  success: 'bg-green-50 text-ok ring-green-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  error: 'bg-red-50 text-red-700 ring-red-200',
  indigo: 'bg-brand-50 text-brand-600 ring-indigo-200',
};
const toneIcons: Record<Tone, LucideIcon> = { neutral: Circle, info: Clock, success: CheckCircle2, warning: AlertTriangle, error: XCircle, indigo: Info };

export function Badge({ tone = 'neutral', icon, children, className }: { tone?: Tone; icon?: LucideIcon | null; children: ReactNode; className?: string }) {
  const Icon = icon === null ? null : icon ?? toneIcons[tone];
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', toneStyles[tone], className)}>
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  );
}

// ---------- Layout primitives ----------
export function Card({ children, className, as: As = 'section', ...rest }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' } & Record<string, unknown>) {
  return <As {...rest} className={cx('rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]', className)}>{children}</As>;
}

export function CardHeader({ title, description, action, id }: { title: ReactNode; description?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 id={id} className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-sm text-slate-500">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-[0.9375rem] text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, to, tone = 'navy' }: { label: string; value: number | string; icon: LucideIcon; hint?: string; to?: string; tone?: 'navy' | 'brand' | 'ok' | 'warn' }) {
  const toneCls = { navy: 'bg-navy-50 text-navy', brand: 'bg-brand-50 text-brand', ok: 'bg-green-50 text-ok', warn: 'bg-amber-50 text-warn' }[tone];
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={cx('grid size-9 place-items-center rounded-lg', toneCls)}><Icon className="size-[1.125rem]" aria-hidden /></span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </>
  );
  const cls = 'block rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]';
  return to ? <Link to={to} className={cx(cls, 'transition hover:border-brand/40 hover:shadow-md')}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500"><Icon className="size-6" aria-hidden /></div>
      <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ tone = 'info', title, children, className, onClose }: { tone?: 'info' | 'success' | 'warning' | 'error'; title?: ReactNode; children?: ReactNode; className?: string; onClose?: () => void }) {
  const map = {
    info: ['border-sky-200 bg-sky-50 text-sky-900', Info],
    success: ['border-green-200 bg-green-50 text-green-900', CheckCircle2],
    warning: ['border-amber-200 bg-amber-50 text-amber-900', AlertTriangle],
    error: ['border-red-200 bg-red-50 text-red-900', AlertCircle],
  } as const;
  const [cls, Icon] = map[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex gap-3 rounded-lg border px-4 py-3 text-sm', cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 rounded p-0.5 hover:bg-black/5"><X className="size-4" /></button>}
    </div>
  );
}

// ---------- Form fields ----------
export const inputCls = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:bg-slate-50';

export function Field({ label, hint, error, children, htmlFor, required }: { label: string; hint?: ReactNode; error?: string | null; children: ReactNode; htmlFor: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}{required && <span className="text-bad" aria-hidden> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${htmlFor}-hint`} className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="mt-1 flex items-center gap-1 text-xs font-medium text-bad"><AlertCircle className="size-3.5" aria-hidden />{error}</p>}
    </div>
  );
}

/** Accessible segmented control (radio group semantics). */
export function Segmented<T extends string>({ value, onChange, options, label, size = 'md' }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; count?: number }[]; label: string; size?: 'sm' | 'md' }) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-100 p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label key={o.value} className={cx('relative cursor-pointer rounded-md font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm', on ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink')}>
            <input type="radio" name={name} className="sr-only" checked={on} onChange={() => onChange(o.value)} />
            {o.label}{o.count !== undefined && <span className={cx('ml-1.5 rounded-full px-1.5 text-xs', on ? 'bg-brand-50 text-brand' : 'bg-slate-200 text-slate-600')}>{o.count}</span>}
          </label>
        );
      })}
    </div>
  );
}

// ---------- Modal ----------
export function Modal({ open, onClose, title, description, children, footer, size = 'md', labelledBy }: {
  open: boolean; onClose: () => void; title: ReactNode; description?: ReactNode; children?: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])') ?? []);
    (focusables()[0] ?? node)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy ?? titleId} tabIndex={-1}
        className={cx('flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', w)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><X className="size-5" /></button>
        </div>
        {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel, tone = 'primary', loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; children: ReactNode; confirmLabel: string; tone?: 'primary' | 'danger'; loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>}>
      <div className="text-sm text-slate-600">{children}</div>
    </Modal>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return <span className={cx('inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-amber-900', className)}>Sample data</span>;
}
