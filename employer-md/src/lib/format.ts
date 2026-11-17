export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < day) return `${Math.round(diff / 3_600_000)} h ago`;
  if (diff < 7 * day) return `${Math.round(diff / day)} d ago`;
  return fmtDate(iso);
}

export const fmtBytes = (n?: number) =>
  n == null ? '' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`;

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const isPastDeadline = (deadline?: string) => !!deadline && new Date(deadline + 'T23:59:59') < new Date();

export const plural = (n: number, word: string, pluralWord = word + 's') => `${n} ${n === 1 ? word : pluralWord}`;
