import { useState } from "react";
import "./style/AuthPage.css";
import type { addUserType, loginUserType } from "./LoginSignup";

type Audience = "applicant" | "employer";
type Tab = "login" | "signup";

// Small line icons so the page doesn't rely on emoji
const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
    const paths: Record<string, React.ReactNode> = {
        doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
        briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
        check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
        up: <><path d="M7 11v9H4v-9z" /><path d="M7 11l4-8a2.5 2.5 0 0 1 2.5 2.5V9h5.3a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.6 20H7" /></>,
        down: <><path d="M7 13V4H4v9z" /><path d="M7 13l4 8a2.5 2.5 0 0 0 2.5-2.5V15h5.3a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.6 4H7" /></>,
        eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
        eyeOff: <><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.9 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M3 3l18 18" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
        arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
        pen: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
        star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
        chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z" />,
        user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
};

const COPY: Record<Audience, { title: [string, string, string]; text: string; features: { icon: string; title: string; text: string }[] }> = {
    applicant: {
        title: ["Know exactly ", "why", " your application worked, or didn't."],
        text: "Employers comment right on your resume and cover letter, so you know what to fix before you apply again.",
        features: [
            { icon: "pen", title: "Line-by-line notes", text: "Positive and negative, each with a reason." },
            { icon: "star", title: "A clear decision", text: "Strongly Consider, Consider or Not a Fit." },
            { icon: "chat", title: "Ask a follow-up", text: "Unsure what a note means? Ask the employer." },
        ],
    },
    employer: {
        title: ["Review faster. Leave feedback applicants can ", "actually use", "."],
        text: "Select any line, mark it positive or negative, and send a clear decision. No more silent rejections.",
        features: [
            { icon: "pen", title: "Comment on any line", text: "Select, tag and explain in seconds." },
            { icon: "star", title: "Decide in one step", text: "Three clear outcomes keep reviews consistent." },
            { icon: "chat", title: "Questions in one place", text: "Replies stay next to the document." },
        ],
    },
};

const PasswordField = ({ value, onChange, autoComplete }: { value: string; onChange: (value: string) => void; autoComplete: string }) => {
    const [show, setShow] = useState<boolean>(false);
    return (
        <div className="ap-password">
            <input type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onInput={(e) => onChange(e.currentTarget.value)} />
            <button type="button" className="ap-eye" aria-label={show ? "Hide password" : "Show password"} title={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
                <Icon name={show ? "eyeOff" : "eye"} />
            </button>
        </div>
    );
};

interface AuthPageProps {
    loginUser: loginUserType;
    addUser: addUserType;
    resetDemoAndLogin: (username: string) => void;
}

const AuthPage = ({ loginUser, addUser, resetDemoAndLogin }: AuthPageProps) => {
    const [tab, setTab] = useState<Tab>("login");
    const [audience, setAudience] = useState<Audience>("applicant");
    const [notice, setNotice] = useState<string>("");
    const [error, setError] = useState<string>("");

    // Log in fields
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Sign up fields
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [newEmail, setNewEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");

    const copy = COPY[audience];

    const switchTab = (next: Tab) => {
        setTab(next);
        setError("");
        if (next == "signup") {
            setNotice("");
        }
    };

    const quickLogin = (name: string, demoEmail: string) => {
        if (!loginUser(demoEmail, "1234")) {
            if (window.confirm(name + "'s demo account isn't in this browser's saved data. Reset the demo data and sign in as " + name + "?")) {
                resetDemoAndLogin(demoEmail);
            }
        }
    };

    return (
        <div className="ap">
            <section className="ap-hero">
                <div className="ap-segment" role="tablist" aria-label="Who is this for">
                    <button type="button" role="tab" aria-selected={audience == "applicant"} className={audience == "applicant" ? "active" : ""} onClick={() => setAudience("applicant")}>For applicants</button>
                    <button type="button" role="tab" aria-selected={audience == "employer"} className={audience == "employer" ? "active" : ""} onClick={() => setAudience("employer")}>For employers</button>
                </div>
                <h1>{copy.title[0]}<span className="ap-marker">{copy.title[1]}</span>{copy.title[2]}</h1>
                <p className="ap-lead">{copy.text}</p>

                <div className="ap-stage" aria-hidden="true">
                    <div className="ap-paper">
                        <div className="ap-paper-name">Maya Shah</div>
                        <div className="ap-paper-contact"><i style={{width: "62%"}} /></div>
                        <div className="ap-paper-heading">Experience</div>
                        <div className="ap-paper-role"><i style={{width: "54%"}} /><i style={{width: "18%"}} /></div>
                        <div className="ap-paper-line"><mark className="pos">Led a team of 4 to build a clinic appointment app used by 300+ students</mark></div>
                        <div className="ap-paper-skel"><i style={{width: "88%"}} /></div>
                        <div className="ap-paper-skel"><i style={{width: "72%"}} /></div>
                        <div className="ap-paper-role"><i style={{width: "46%"}} /><i style={{width: "20%"}} /></div>
                        <div className="ap-paper-line"><mark className="neg">Responsible for various tasks related to the website</mark></div>
                        <div className="ap-paper-skel"><i style={{width: "80%"}} /></div>
                        <div className="ap-paper-heading">Skills</div>
                        <div className="ap-paper-skel"><i style={{width: "66%"}} /></div>
                    </div>

                    <div className="ap-float ap-float-decision">
                        <span className="ap-float-icon"><Icon name="star" size={16} /></span>
                        <span><small>Northwind Health</small><b>Strongly Consider</b></span>
                    </div>
                    <div className="ap-float ap-float-pos">
                        <span className="ap-tag pos"><Icon name="up" size={14} /> Positive · Strong impact</span>
                        <p>Real numbers make this stand out.</p>
                    </div>
                    <div className="ap-float ap-float-neg">
                        <span className="ap-tag neg"><Icon name="down" size={14} /> Negative · Too vague</span>
                        <p>Say what you built and what changed because of it.</p>
                        <div className="ap-float-reply"><span className="ap-avatar">MS</span>{audience == "applicant" ? "Would page views help here?" : "Applicant asked a question"}</div>
                    </div>
                </div>

                <div className="ap-features">
                    {copy.features.map((feature) => (
                        <div key={feature.title} className="ap-feature">
                            <span className="ap-feature-icon"><Icon name={feature.icon} /></span>
                            <b>{feature.title}</b>
                            <span>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="ap-card">
                <div className="ap-tabs" role="tablist" aria-label="Log in or sign up">
                    <button type="button" role="tab" aria-selected={tab == "login"} className={tab == "login" ? "active" : ""} onClick={() => switchTab("login")}>Log in</button>
                    <button type="button" role="tab" aria-selected={tab == "signup"} className={tab == "signup" ? "active" : ""} onClick={() => switchTab("signup")}>Sign up</button>
                </div>

                {tab == "login" ? (
                    <form className="ap-form" onSubmit={(event) => {
                        event.preventDefault();
                        setError("");
                        if (email.trim() == "" || password == "") {
                            setError("Enter your email and password to log in.");
                            return;
                        }
                        if (!loginUser(email.trim(), password)) {
                            setPassword("");
                            setError("That email and password don't match an account. Check them and try again.");
                        }
                    }}>
                        <h2>Welcome back</h2>
                        <p className="ap-sub">Log in to see your applications and feedback. We'll take you to your applicant or employer home.</p>
                        {notice ? <p className="ap-alert success" role="status"><Icon name="check" size={16} /> {notice}</p> : ""}

                        <label className="ap-label">Email
                            <input type="email" value={email} placeholder="you@example.com" autoComplete="email" onInput={(e) => setEmail(e.currentTarget.value)} />
                        </label>
                        <label className="ap-label">Password
                            <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
                        </label>
                        {error ? <p className="ap-alert error" role="alert">{error}</p> : ""}
                        <button type="submit" className="ap-submit">Log in <Icon name="arrow" size={16} /></button>

                        <div className="ap-divider"><span>or try a demo account</span></div>
                        <div className="ap-demo">
                            <button type="button" onClick={() => quickLogin("Dana", "dana@example.com")}>
                                <span className="ap-demo-icon"><Icon name="briefcase" /></span>
                                <span><b>Dana Miller</b><small>Employer</small></span>
                            </button>
                            <button type="button" onClick={() => quickLogin("Maya", "maya@example.com")}>
                                <span className="ap-demo-icon"><Icon name="doc" /></span>
                                <span><b>Maya Shah</b><small>Applicant</small></span>
                            </button>
                        </div>

                        <p className="ap-switch">New to Employer.MD? <button type="button" onClick={() => switchTab("signup")}>Create a free account</button></p>
                    </form>
                ) : (
                    <form className="ap-form" onSubmit={(event) => {
                        event.preventDefault();
                        setError("");
                        const missing = [
                            firstName.trim() == "" ? "first name" : "",
                            lastName.trim() == "" ? "last name" : "",
                            newEmail.trim() == "" ? "email" : "",
                            newPassword == "" ? "password" : "",
                        ].filter((field) => field != "");
                        if (missing.length > 0) {
                            const list = missing.length > 1 ? missing.slice(0, -1).join(", ") + " and " + missing[missing.length - 1] : missing[0];
                            setError("Please add your " + list + ".");
                            return;
                        }
                        const user = addUser(firstName.trim(), lastName.trim(), newEmail.trim(), newPassword, audience == "employer");
                        if (user) {
                            setEmail(newEmail.trim());
                            setPassword("");
                            setFirstName("");
                            setLastName("");
                            setNewEmail("");
                            setNewPassword("");
                            setNotice("Account created! Enter your password to log in.");
                            setTab("login");
                        } else {
                            setError("We couldn't create your account. Check your details and try again.");
                        }
                    }}>
                        <h2>Create your free account</h2>
                        <p className="ap-sub">First, tell us how you'll use Employer.MD.</p>

                        <div className="ap-roles" role="radiogroup" aria-label="How you'll use Employer.MD">
                            <button type="button" role="radio" aria-checked={audience == "applicant"} className={"ap-role" + (audience == "applicant" ? " active" : "")} onClick={() => setAudience("applicant")}>
                                <span className="ap-role-icon"><Icon name="doc" /></span>
                                {audience == "applicant" ? <span className="ap-role-check"><Icon name="check" size={13} /></span> : ""}
                                <b>I'm applying</b>
                                <small>Get line-by-line feedback on my resume</small>
                            </button>
                            <button type="button" role="radio" aria-checked={audience == "employer"} className={"ap-role" + (audience == "employer" ? " active" : "")} onClick={() => setAudience("employer")}>
                                <span className="ap-role-icon"><Icon name="briefcase" /></span>
                                {audience == "employer" ? <span className="ap-role-check"><Icon name="check" size={13} /></span> : ""}
                                <b>I'm hiring</b>
                                <small>Review applicants and give feedback</small>
                            </button>
                        </div>

                        <div className="ap-row">
                            <label className="ap-label">First name
                                <input type="text" value={firstName} placeholder="Jordan" autoComplete="given-name" onInput={(e) => setFirstName(e.currentTarget.value)} />
                            </label>
                            <label className="ap-label">Last name
                                <input type="text" value={lastName} placeholder="Lee" autoComplete="family-name" onInput={(e) => setLastName(e.currentTarget.value)} />
                            </label>
                        </div>
                        <label className="ap-label">Email
                            <input type="email" value={newEmail} placeholder="you@example.com" autoComplete="email" onInput={(e) => setNewEmail(e.currentTarget.value)} />
                        </label>
                        <label className="ap-label">Password
                            <PasswordField value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                        </label>
                        {error ? <p className="ap-alert error" role="alert">{error}</p> : ""}
                        <button type="submit" className="ap-submit">Create {audience == "applicant" ? "applicant" : "employer"} account <Icon name="arrow" size={16} /></button>

                        <p className="ap-switch">Already have an account? <button type="button" onClick={() => switchTab("login")}>Log in</button></p>
                    </form>
                )}
            </section>
        </div>
    );
};

export default AuthPage;
