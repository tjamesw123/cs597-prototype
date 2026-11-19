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
        eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
        eyeOff: <><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.9 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M3 3l18 18" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
        arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
        alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
};

const COPY: Record<Audience, { title: [string, string, string]; text: string }> = {
    applicant: {
        title: ["Every application deserves a ", "reason", "."],
        text: "Employers mark up your resume and cover letter line by line, so you know exactly what to keep and what to fix.",
    },
    employer: {
        title: ["Turn every review into ", "advice", "."],
        text: "Select a line, mark it positive or negative, pick a reason, and send one clear decision. It takes minutes.",
    },
};

const PasswordField = ({ id, value, onChange, autoComplete }: { id: string; value: string; onChange: (value: string) => void; autoComplete: string }) => {
    const [show, setShow] = useState<boolean>(false);
    return (
        <div className="ed-password">
            <input id={id} type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onInput={(e) => onChange(e.currentTarget.value)} />
            <button type="button" className="ed-eye" aria-label={show ? "Hide password" : "Show password"} title={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>
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
        <div className="ed">
            {/* Left: what the product is, shown as a marked-up resume */}
            <section className="ed-story">
                <div className="ed-story-inner">
                    <div className="ed-audience" role="tablist" aria-label="Who is this for">
                        <button type="button" role="tab" aria-selected={audience == "applicant"} className={audience == "applicant" ? "active" : ""} onClick={() => setAudience("applicant")}>For applicants</button>
                        <button type="button" role="tab" aria-selected={audience == "employer"} className={audience == "employer" ? "active" : ""} onClick={() => setAudience("employer")}>For employers</button>
                    </div>

                    <h1 className="ed-title" key={audience}>
                        {copy.title[0]}<em className="ed-marker">{copy.title[1]}</em>{copy.title[2]}
                    </h1>
                    <p className="ed-lead">{copy.text}</p>

                    <figure className="ed-sheet" aria-label="Example: a resume with employer comments">
                        <div className="ed-sheet-paper">
                            <div className="ed-sheet-name">Maya Shah</div>
                            <div className="ed-sheet-rule">Experience</div>
                            <p className="ed-sheet-line">
                                <mark className="pos"><span className="ed-pin pos">1</span>Led a team of 4 to build a clinic appointment app used by 300+ students</mark>
                            </p>
                            <div className="ed-skel" style={{width: "84%"}} />
                            <div className="ed-skel" style={{width: "66%"}} />
                            <p className="ed-sheet-line">
                                <mark className="neg"><span className="ed-pin neg">2</span>Responsible for various tasks related to the website</mark>
                            </p>
                            <div className="ed-skel" style={{width: "74%"}} />
                            <div className="ed-stamp" aria-hidden="true">Strongly<br />Consider</div>
                        </div>
                        <figcaption className="ed-notes">
                            <div className="ed-note pos">
                                <span className="ed-pin pos">1</span>
                                <div><b>Positive · Strong impact</b><span>Real numbers make this stand out.</span></div>
                            </div>
                            <div className="ed-note neg">
                                <span className="ed-pin neg">2</span>
                                <div><b>Negative · Too vague</b><span>Say what you built and what changed.</span></div>
                            </div>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* Right: the form, with nothing competing for attention */}
            <section className="ed-panel">
                <div className="ed-panel-inner">
                    <div className="ed-tabs" role="tablist" aria-label="Log in or sign up">
                        <button type="button" role="tab" aria-selected={tab == "login"} className={tab == "login" ? "active" : ""} onClick={() => switchTab("login")}>Log in</button>
                        <button type="button" role="tab" aria-selected={tab == "signup"} className={tab == "signup" ? "active" : ""} onClick={() => switchTab("signup")}>Sign up</button>
                    </div>

                    {tab == "login" ? (
                        <form className="ed-form" noValidate onSubmit={(event) => {
                            event.preventDefault();
                            setError("");
                            if (email.trim() == "" || password == "") {
                                setError("Enter your email and password to log in.");
                                return;
                            }
                            if (!loginUser(email.trim(), password)) {
                                setPassword("");
                                setError("That email and password don't match an account. Check them and try again, or try a demo account below.");
                            }
                        }}>
                            <h2>Welcome back.</h2>
                            <p className="ed-sub">Log in to see your applications and feedback.</p>
                            {notice ? <p className="ed-alert success" role="status"><Icon name="check" size={16} /> {notice}</p> : ""}

                            <div className="ed-field">
                                <label htmlFor="ed-login-email">Email</label>
                                <input id="ed-login-email" type="email" value={email} placeholder="you@example.com" autoComplete="email" onInput={(e) => setEmail(e.currentTarget.value)} />
                            </div>
                            <div className="ed-field">
                                <label htmlFor="ed-login-password">Password</label>
                                <PasswordField id="ed-login-password" value={password} onChange={setPassword} autoComplete="current-password" />
                            </div>
                            {error ? <p className="ed-alert error" role="alert"><Icon name="alert" size={16} /> {error}</p> : ""}
                            <button type="submit" className="ed-primary">Log in <Icon name="arrow" size={16} /></button>

                            <div className="ed-demo">
                                <span className="ed-demo-label">Just looking? Try a demo account</span>
                                <button type="button" onClick={() => quickLogin("Dana", "dana@example.com")}>
                                    <span className="ed-avatar">DM</span>
                                    <span className="ed-demo-text"><b>Dana Miller</b><small>Employer · reviews applications</small></span>
                                    <Icon name="arrow" size={16} />
                                </button>
                                <button type="button" onClick={() => quickLogin("Maya", "maya@example.com")}>
                                    <span className="ed-avatar">MS</span>
                                    <span className="ed-demo-text"><b>Maya Shah</b><small>Applicant · reads feedback</small></span>
                                    <Icon name="arrow" size={16} />
                                </button>
                            </div>

                            <p className="ed-switch">New here? <button type="button" onClick={() => switchTab("signup")}>Create a free account</button></p>
                        </form>
                    ) : (
                        <form className="ed-form" noValidate onSubmit={(event) => {
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
                            if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) {
                                setError("That email doesn't look right. It should look like name@example.com.");
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
                                setNotice("Account created. Enter your password to log in.");
                                setTab("login");
                            } else {
                                setError("We couldn't create your account. That email may already be in use, so try logging in instead.");
                            }
                        }}>
                            <h2>Create your account.</h2>
                            <p className="ed-sub">Free, and it takes about a minute.</p>

                            <div className="ed-roles" role="radiogroup" aria-label="I am">
                                <button type="button" role="radio" aria-checked={audience == "applicant"} className={"ed-role" + (audience == "applicant" ? " active" : "")} onClick={() => setAudience("applicant")}>
                                    <Icon name="doc" />
                                    <span><b>I'm applying</b><small>Get feedback on my documents</small></span>
                                </button>
                                <button type="button" role="radio" aria-checked={audience == "employer"} className={"ed-role" + (audience == "employer" ? " active" : "")} onClick={() => setAudience("employer")}>
                                    <Icon name="briefcase" />
                                    <span><b>I'm hiring</b><small>Review and give feedback</small></span>
                                </button>
                            </div>

                            <div className="ed-row">
                                <div className="ed-field">
                                    <label htmlFor="ed-first">First name</label>
                                    <input id="ed-first" type="text" value={firstName} autoComplete="given-name" onInput={(e) => setFirstName(e.currentTarget.value)} />
                                </div>
                                <div className="ed-field">
                                    <label htmlFor="ed-last">Last name</label>
                                    <input id="ed-last" type="text" value={lastName} autoComplete="family-name" onInput={(e) => setLastName(e.currentTarget.value)} />
                                </div>
                            </div>
                            <div className="ed-field">
                                <label htmlFor="ed-new-email">Email</label>
                                <input id="ed-new-email" type="email" value={newEmail} placeholder="you@example.com" autoComplete="email" onInput={(e) => setNewEmail(e.currentTarget.value)} />
                            </div>
                            <div className="ed-field">
                                <label htmlFor="ed-new-password">Password</label>
                                <PasswordField id="ed-new-password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                            </div>
                            {error ? <p className="ed-alert error" role="alert"><Icon name="alert" size={16} /> {error}</p> : ""}
                            <button type="submit" className="ed-primary">Create {audience == "applicant" ? "applicant" : "employer"} account <Icon name="arrow" size={16} /></button>

                            <p className="ed-switch">Already have an account? <button type="button" onClick={() => switchTab("login")}>Log in</button></p>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AuthPage;
