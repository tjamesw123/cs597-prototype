import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, CheckCircle2, Highlighter, MessageSquareText, UserRound, History } from 'lucide-react';
import { useStore } from '../state/store';
import { Logo } from '../components/Layout';
import { Alert, Button, Field, Segmented, cx, inputCls } from '../components/ui';
import type { Role } from '../types';

export default function Welcome() {
  const { actions, state } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<Role>('applicant');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);

  const enter = (userId: string, to: string) => { actions.loginAs(userId); navigate(to); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const errs: Record<string, string> = {};
    if (mode === 'signup' && form.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address, like name@school.edu.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (mode === 'signup') {
      setNotice('Account creation is simulated in this prototype, so no account was created. Use a demo account below to explore Employer.MD with sample data.');
      return;
    }
    const user = state.users.find((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.role === role && (u.id === 'u-maya' || u.id === 'u-dana'));
    if (!user) {
      setNotice(`No ${role} account matches that email. This prototype only includes the demo accounts — try ${role === 'applicant' ? 'maya.shah@example.edu' : 'dana.miller@northbridge.example'}, or use the buttons below.`);
      return;
    }
    enter(user.id, user.role === 'applicant' ? '/applicant' : '/employer');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top_left,#EEF2FF_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#E0E7FF_0%,transparent_50%)] bg-canvas">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Logo />
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">HCI course prototype · sample data</span>
      </header>
      <main id="main" className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-6 pb-16 pt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-10 lg:py-12">
        <section>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-navy sm:text-5xl xl:text-6xl">
            Know <span className="text-brand">why</span>, not just <span className="whitespace-nowrap">“not selected.”</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 xl:text-xl xl:leading-9">
            Employer.MD lets hiring managers highlight parts of your resume and attach specific, structured feedback — so every application helps you improve the next one.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Highlighter, t: 'Highlighted feedback', d: 'Comments are pinned to the exact lines an employer reviewed.' },
              { icon: MessageSquareText, t: 'Clear decisions', d: 'Every evaluation explains what it means and what to do next.' },
              { icon: History, t: 'Document history', d: 'See which resume version went where, and how it was received.' },
              { icon: UserRound, t: 'Human reviewers', d: 'Feedback comes from people, not an AI score.' },
            ].map((f) => (
              <li key={f.t} className="flex gap-3 rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand"><f.icon className="size-[1.125rem]" aria-hidden /></span>
                <div><div className="text-sm font-semibold text-ink">{f.t}</div><div className="mt-0.5 text-sm text-slate-600">{f.d}</div></div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="auth-title" className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-10">
          <h2 id="auth-title" className="text-2xl font-semibold text-ink">{mode === 'login' ? 'Log in to Employer.MD' : 'Create your account'}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Segmented label="Log in or sign up" value={mode} onChange={(m) => { setMode(m); setErrors({}); setNotice(null); }} options={[{ value: 'login', label: 'Log in' }, { value: 'signup', label: 'Sign up' }]} />
          </div>
          <fieldset className="mt-5">
            <legend className="mb-2 text-sm font-medium text-slate-800">I am…</legend>
            <div className="grid grid-cols-2 gap-3">
              {([['applicant', 'An applicant', UserRound], ['employer', 'An employer', Briefcase]] as const).map(([v, l, Icon]) => (
                <label key={v} className={cx('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand',
                  role === v ? 'border-brand bg-brand-50 text-brand-600' : 'border-slate-300 text-slate-700 hover:border-slate-400')}>
                  <input type="radio" name="role" value={v} checked={role === v} onChange={() => setRole(v)} className="sr-only" />
                  <Icon className="size-4" aria-hidden />{l}{role === v && <CheckCircle2 className="ml-auto size-4" aria-label="selected" />}
                </label>
              ))}
            </div>
          </fieldset>
          <form noValidate onSubmit={submit} className="mt-5 space-y-4">
            {mode === 'signup' && (
              <Field label="Full name" htmlFor="name" error={errors.name} required>
                <input id="name" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} autoComplete="name" />
              </Field>
            )}
            <Field label="Email" htmlFor="email" error={errors.email} required>
              <input id="email" type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters." required>
              <input id="password" type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-hint'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </Field>
            {notice && <Alert tone="info">{notice}</Alert>}
            <Button type="submit" className="w-full" variant="navy">{mode === 'login' ? 'Log in' : 'Create account'}</Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400"><span className="h-px flex-1 bg-slate-200" />Class demonstration<span className="h-px flex-1 bg-slate-200" /></div>
          <div className="space-y-3">
            <DemoButton onClick={() => enter('u-maya', '/applicant')} title="Continue as Maya — Applicant" sub="Graduate student · resumes, applications & feedback" />
            <DemoButton onClick={() => enter('u-dana', '/employer')} title="Continue as Dana — Employer" sub="Hiring manager at Northbridge Partners · reviews & decisions" />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Demo accounts use fictional sample data stored only in this browser. No real employers, job platforms or emails are involved.
          </p>
        </section>
      </main>
    </div>
  );
}

function DemoButton({ title, sub, onClick }: { title: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left transition hover:border-brand hover:bg-brand-50/50">
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block text-xs text-slate-500">{sub}</span>
      </span>
      <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
    </button>
  );
}
