import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase, FileClock, FileText, History, Inbox, LayoutDashboard, LogOut, Menu,
  MessageSquareText, RotateCcw, Repeat, Search, X,
} from 'lucide-react';
import { useStore } from '../state/store';
import { useToast } from './Toast';
import { ConfirmDialog, cx } from './ui';
import type { Role } from '../types';

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <span className={cx('grid size-8 place-items-center rounded-lg text-[0.8125rem] font-bold', light ? 'bg-white text-navy' : 'bg-navy text-white')} aria-hidden>MD</span>
      <span className={cx('text-lg font-semibold tracking-tight', light ? 'text-white' : 'text-navy')}>Employer<span className={light ? 'text-indigo-300' : 'text-brand'}>.MD</span></span>
    </span>
  );
}

const NAV: Record<Role, { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[]> = {
  applicant: [
    { to: '/applicant', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/applicant/documents', label: 'Resumes & Cover Letters', icon: FileText },
    { to: '/applicant/jobs', label: 'Browse Jobs', icon: Search },
    { to: '/applicant/applications', label: 'My Applications', icon: Briefcase },
    { to: '/applicant/feedback', label: 'Employer Feedback', icon: MessageSquareText },
    { to: '/applicant/history', label: 'Document History', icon: FileClock },
  ],
  employer: [
    { to: '/employer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employer/applications', label: 'Applications', icon: Inbox },
    { to: '/employer/history', label: 'Review History', icon: History },
  ],
};

export function AppLayout({ role }: { role: Role }) {
  const { currentUser, actions, state } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (!currentUser) return null;
  const pendingCount = role === 'employer'
    ? state.applications.filter((a) => a.reviewStatus === 'pending' && state.jobs.find((j) => j.id === a.jobId)?.employerId === currentUser.id).length
    : state.applications.filter((a) => a.applicantId === currentUser.id && a.evaluationId && !a.feedbackViewedAt).length;

  const switchTo = role === 'applicant' ? { id: 'u-dana', label: 'Switch to Dana (Employer)', to: '/employer' } : { id: 'u-maya', label: 'Switch to Maya (Applicant)', to: '/applicant' };

  const sidebar = (
    <div className="flex h-full flex-col bg-navy text-slate-200">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Logo light />
        <button type="button" className="rounded-md p-1 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X className="size-5" /></button>
      </div>
      <div className="mx-5 mb-4 rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white" aria-hidden>{currentUser.name.split(' ').map((p) => p[0]).join('')}</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{currentUser.name}</div>
            <div className="truncate text-xs text-slate-300">{role === 'applicant' ? 'Applicant' : `Employer · ${currentUser.company}`}</div>
          </div>
        </div>
      </div>
      <nav aria-label={role === 'applicant' ? 'Applicant navigation' : 'Employer navigation'} className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV[role].map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cx('group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive ? 'bg-white text-navy shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white')}>
            {({ isActive }) => (<>
              <item.icon className={cx('size-[1.125rem]', isActive ? 'text-brand' : 'text-slate-400 group-hover:text-white')} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {isActive && <span className="sr-only">(current page)</span>}
              {((role === 'employer' && item.to === '/employer/applications') || (role === 'applicant' && item.to === '/applicant/feedback')) && pendingCount > 0 && (
                <span className={cx('rounded-full px-1.5 text-xs font-semibold', isActive ? 'bg-brand text-white' : 'bg-amber-400 text-navy')}>
                  {pendingCount}<span className="sr-only">{role === 'employer' ? ' pending' : ' unread'}</span>
                </span>
              )}
            </>)}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <div className="px-3 pb-2 text-[0.6875rem] leading-snug text-slate-400">
          <span className="font-semibold text-amber-300">Demo mode.</span> Sample data, stored only in this browser. No real employers or emails.
        </div>
        <SideButton icon={Repeat} onClick={() => { actions.loginAs(switchTo.id); navigate(switchTo.to); toast({ tone: 'info', title: `Signed in as ${switchTo.id === 'u-dana' ? 'Dana Miller' : 'Maya Shah'}` }); }}>{switchTo.label}</SideButton>
        <SideButton icon={RotateCcw} onClick={() => setConfirmReset(true)}>Reset demo data</SideButton>
        <SideButton icon={LogOut} onClick={() => { actions.logout(); navigate('/'); }}>Sign out</SideButton>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-72">
      <a href="#main" className="sr-only z-[70] rounded-md bg-white px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to main content</a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">{sidebar}</div>
        </div>
      )}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Open navigation" aria-expanded={mobileOpen}><Menu className="size-5" /></button>
        <Logo />
        <span className="w-9" />
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 focus:outline-none">
        <Outlet />
      </main>
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?" confirmLabel="Reset data" tone="danger" loading={resetting}
        onConfirm={async () => {
          setResetting(true);
          await actions.resetDemo();
          setResetting(false); setConfirmReset(false);
          navigate(role === 'applicant' ? '/applicant' : '/employer');
          toast({ tone: 'success', title: 'Demo data reset', body: 'All sample records were restored. Uploaded PDFs were removed from this browser.' });
        }}>
        This restores the original sample applications, documents and feedback for both Maya and Dana. Anything you uploaded, applied for or reviewed during this session will be permanently removed.
      </ConfirmDialog>
    </div>
  );
}

function SideButton({ icon: Icon, children, onClick }: { icon: typeof Menu; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
      <Icon className="size-4 text-slate-400" aria-hidden />{children}
    </button>
  );
}

