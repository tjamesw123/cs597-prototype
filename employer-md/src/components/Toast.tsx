import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cx } from './ui';

type ToastTone = 'success' | 'error' | 'info';
interface Toast { id: number; tone: ToastTone; title: string; body?: string }

const Ctx = createContext<(t: Omit<Toast, 'id'>) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    setTimeout(() => dismiss(id), 5000);
  }, []);
  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <Icon className={cx('mt-0.5 size-5 shrink-0', t.tone === 'success' ? 'text-ok' : t.tone === 'error' ? 'text-bad' : 'text-brand')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.body && <p className="mt-0.5 text-sm text-slate-600">{t.body}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="h-fit rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
