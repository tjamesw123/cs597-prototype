import { useEffect, useState} from "react";
import { Link } from "react-router";
import type { DocumentRec, Job, JobSubmission } from "./App";
import { DECISIONS } from "./types.ts";


export type User = {
    id : number;
    first_name : string
    last_name : string
    username : string
    password : string
    isEmployer: boolean
}

export type addUserType = {
    (first_name: string, last_name: string, username: string, password: string, isEmployer: boolean) : User | null
}

export type loginUserType = {
    (username: string, password: string) : User | null
}

interface UserSignUpLoginProps {
    currentUser: User | null;
    jobList: Job[];
    jobSubmissionList: JobSubmission[];
    documentList: DocumentRec[];
    addUser: addUserType;
    loginUser: (username: string, password: string) => User | null;
    resetDemoAndLogin: (username: string) => void;
}

interface UserSignUpProps {
    currentUser: User | null;
  addUser: addUserType; 
  onSignedUp?: (email: string) => void;
}

interface UserLoginProps {
    currentUser: User | null;
  loginUser: loginUserType;
  resetDemoAndLogin: (username: string) => void;
  notice?: string;
  defaultEmail?: string;
}

const LoginForm = ({ currentUser, loginUser, resetDemoAndLogin, notice, defaultEmail }: UserLoginProps) => {
    const quickLogin = (name : string, email : string) => {
        if (!loginUser(email, "1234")) {
            if (window.confirm(name + "'s demo account isn't in this browser's saved data. Reset the demo data and sign in as " + name + "?")) {
                resetDemoAndLogin(email);
            }
        }
    };
    const [username, setUsername] = useState<string>(defaultEmail ?? "");
    const [password, setPassword] = useState<string>("");
    const [result, setResult] = useState<string>("");
    useEffect(() => {
        if (currentUser == null) {
            setResult("");
        }
    }, [currentUser]);
    // function handleSubmit(e) {
    //     // Prevent the browser from reloading the page
    //     e.preventDefault();
    //     const form = e.target;
    //     const formData = new FormData(form);
    //     const query = formData.get('query');
    //     alert(`You searched for '${query}'`);
    // }
    // handleChange
    
    return (
        <>
        <form
        className="login"
        onSubmit={(event) => {
            event.preventDefault();
            // const form = event.target;
            // const formData = new FormData(form);
            console.log(event.target);
            console.log(password);
            const user = loginUser(username, password);
            setUsername("");
            setPassword("");
            if (user) {
                setResult("Logged in!");
            } else {
                setResult("Failed to log in!");
            }
            // onSubmit(input);
        }}
        >
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Log in to see your applications and feedback.</p>
        {notice ? <p className="form-notice success">{notice}</p> : ""}
        <div>
            <label>Email <input type="text" value={username} placeholder="e.g. maya@example.com" onInput={(e) => setUsername(e.currentTarget.value)}/></label>
            <label>Password <input type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)}/></label>
        </div>
        <div>
            <input type="submit" value="Log in" />
        </div>
        {result && <p className="form-result">{result}</p>}
        <div className="quick-login">
            <span>Or sign in with a demo account</span>
            <div className="quick-login-buttons">
                <button type="button" className="btn secondary" onClick={() => quickLogin("Dana", "dana@example.com")}>Dana <small>Employer</small></button>
                <button type="button" className="btn secondary" onClick={() => quickLogin("Maya", "maya@example.com")}>Maya <small>Applicant</small></button>
            </div>
        </div>
        </form>
        </>
    );
};

const SignUpForm = ({ currentUser, addUser, onSignedUp }: UserSignUpProps) => {
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [isEmployer, setIsEmployer] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  useEffect(() => {
    if (currentUser == null) {
        setResult("");
    }
  }, [currentUser]);

  return (
    <>
        <form
        className="login"
        onSubmit={(event) => {
            event.preventDefault();
            // const form = event.target;
            // const formData = new FormData(form);
            console.log(event.target);
            console.log(first_name);
            setResult("");
            let user = null;
            if (password == repeatPassword) {
                user = addUser(first_name, last_name, username, password, isEmployer);
            }
            if (user) {
                setResult("Signed up!");
                if (onSignedUp) {
                    onSignedUp(username);
                }
                setFirstName("");
                setLastName("");
                setUsername("");
                setPassword("");
                setRepeatPassword("");
                setIsEmployer(false);
            } else {
                setResult("Failed to sign up!");
            }
            // onSubmit(input);
        }}
        >
        <h2>Create your account</h2>
        <p className="auth-subtitle">It's free and takes less than a minute.</p>
        <div className="role-choice" role="radiogroup" aria-label="I am">
            <button type="button" role="radio" aria-checked={!isEmployer} className={"role-option" + (!isEmployer ? " active" : "")} onClick={() => setIsEmployer(false)}>
                <span className="role-icon">🎓</span><b>I'm applying</b><small>Get feedback on my resume</small>
            </button>
            <button type="button" role="radio" aria-checked={isEmployer} className={"role-option" + (isEmployer ? " active" : "")} onClick={() => setIsEmployer(true)}>
                <span className="role-icon">💼</span><b>I'm hiring</b><small>Review applicants' documents</small>
            </button>
        </div>
        <div>
            <div className="name-row">
                <label>First Name <input type="text" value={first_name} onInput={(e) => setFirstName(e.currentTarget.value)}/></label>
                <label>Last Name <input type="text" value={last_name} onInput={(e) => setLastName(e.currentTarget.value)}/></label>
            </div>
            <label>Email <input type="email" required value={username} onInput={(e) => setUsername(e.currentTarget.value)}/></label>
            <label>Password <input type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)}/></label>
            <label>Repeat Password <input type="password" value={repeatPassword} onInput={(e) => setRepeatPassword(e.currentTarget.value)}/></label>
        </div>
        <div>
            <input type="submit" value="Create account" />
        </div>
        {result && <p className="form-result">{result}</p>}
        </form>
    </>
  );
};

type HomeAction = { icon: string; title: string; text: string; to: string; button: string };

const HomeActions = ({ actions }: { actions: HomeAction[] }) => (
    <div className="home-actions">
        {actions.map((action) => (
            <Link key={action.to} to={action.to} className="home-card">
                <span className="home-icon">{action.icon}</span>
                <span className="home-title">{action.title}</span>
                <span className="home-text">{action.text}</span>
                <span className="home-button">{action.button} →</span>
            </Link>
        ))}
    </div>
);

const HomeStats = ({ stats }: { stats: { value: number; label: string; to: string }[] }) => (
    <div className="stat-row">
        {stats.map((stat) => (
            <Link key={stat.label} to={stat.to} className="stat"><b>{stat.value}</b><span>{stat.label}</span></Link>
        ))}
    </div>
);

interface HomeProps {
    currentUser: User;
    jobList: Job[];
    jobSubmissionList: JobSubmission[];
    documentList: DocumentRec[];
}

const ApplicantHome = ({ currentUser, jobList, jobSubmissionList, documentList }: HomeProps) => {
    const findJob = (id: number) => jobList.find((job) => job.id == id);
    const mySubmissions = jobSubmissionList.filter((jobSubmission) => jobSubmission.userId == currentUser.id);
    const reviewed = mySubmissions.filter((jobSubmission) => jobSubmission.reviewed);
    const myDocuments = documentList.filter((document) => document.userId == currentUser.id);
    return (
        <>
        <p className="home-subtitle">Get real feedback on your resume from the employers you apply to.</p>
        {reviewed.map((jobSubmission) => (
            <Link key={jobSubmission.id} className="notice good" to={"/applicant/submission/" + jobSubmission.id}>
                <span className="notice-icon">💬</span>
                <span className="notice-text"><b>Feedback ready from {findJob(jobSubmission.jobId)?.company ?? "an employer"}</b>
                <span>{findJob(jobSubmission.jobId)?.position ?? ""}{jobSubmission.decision ? " · " + DECISIONS[jobSubmission.decision].icon + " " + DECISIONS[jobSubmission.decision].label : ""} · Tap to read their highlights and comments</span></span>
                <span className="notice-arrow">→</span>
            </Link>
        ))}
        <HomeStats stats={[
            { value: mySubmissions.length, label: "Applications", to: "/applicant/feedback" },
            { value: reviewed.length, label: "Reviewed", to: "/applicant/feedback" },
            { value: myDocuments.length, label: "Documents", to: "/applicant/resumecoverletterupload" },
        ]} />
        <HomeActions actions={[
            { icon: "📄", title: "Upload a resume", text: "Add your resume or cover letter as a PDF.", to: "/applicant/resumecoverletterupload", button: "Upload" },
            { icon: "💼", title: "Apply to jobs", text: "Pick a job and send your documents.", to: "/applicant/apply", button: "Browse jobs" },
            { icon: "💬", title: "See your feedback", text: "Read employer highlights and comments.", to: "/applicant/feedback", button: "View feedback" },
        ]} />
        <h2>Jobs on Employer.MD</h2>
        <ul className="card-list">
            {jobList.length != 0 ? jobList.map((job) => {
                const applied = mySubmissions.find((jobSubmission) => jobSubmission.jobId == job.id);
                return (
                    <li key={job.id}>
                        <span className="job-logo">{job.company.charAt(0)}</span>
                        <div className="item"><div className="title">{job.position}</div><div className="meta">{job.company}</div></div>
                        {applied ? <span className="badge applied">Applied</span> : <Link className="btn-link" to={"/applicant/apply/" + job.id}>Apply</Link>}
                    </li>
                );
            }) : <li className="empty">There are no jobs posted yet.</li>}
        </ul>
        </>
    );
};

const EmployerHome = ({ currentUser, jobList, jobSubmissionList }: HomeProps) => {
    const findJob = (id: number) => jobList.find((job) => job.id == id);
    const myJobs = jobList.filter((job) => job.reviewerId == currentUser.id);
    const mySubmissions = jobSubmissionList.filter((jobSubmission) => findJob(jobSubmission.jobId)?.reviewerId == currentUser.id);
    const pending = mySubmissions.filter((jobSubmission) => !jobSubmission.reviewed);
    const reviewed = mySubmissions.filter((jobSubmission) => jobSubmission.reviewed);
    const next = pending[0];
    const withQuestions = mySubmissions.filter((jobSubmission) => (jobSubmission.questions ?? []).some((question) => !question.reply));
    return (
        <>
        <p className="home-subtitle">Review applicants and give them feedback that helps.</p>
        {withQuestions.map((jobSubmission) => (
            <Link key={"q" + jobSubmission.id} className="notice question-notice" to={"/applicant/submission/" + jobSubmission.id}>
                <span className="notice-icon">💬</span>
                <span className="notice-text"><b>An applicant asked a question about your feedback</b>
                <span>{findJob(jobSubmission.jobId)?.position ?? ""} · {findJob(jobSubmission.jobId)?.company ?? ""} · Tap to reply</span></span>
                <span className="notice-arrow">→</span>
            </Link>
        ))}
        {pending.length != 0 ?
            <Link className="notice warn" to="/employer/applications/">
                <span className="notice-num">{pending.length}</span>
                <span className="notice-text"><b>{pending.length == 1 ? "1 application" : pending.length + " applications"} waiting for your review</b>
                <span>Tap to see them</span></span>
                <span className="notice-arrow">→</span>
            </Link>
        :
            <div className="notice good">
                <span className="notice-icon">✅</span>
                <span className="notice-text">{mySubmissions.length == 0 ? <><b>No applications yet</b><span>Post a job to start receiving applications.</span></> : <><b>All caught up!</b><span>Every application has been reviewed.</span></>}</span>
            </div>
        }
        <HomeStats stats={[
            { value: myJobs.length, label: "Job postings", to: "/employer/jobposting/" },
            { value: pending.length, label: "Pending review", to: "/employer/applications/" },
            { value: reviewed.length, label: "Reviewed", to: "/employer/applications/" },
        ]} />
        <div className="quick">
            {next ? <Link className="btn primary" to={"/applicant/submission/" + next.id}>📝 Review next: {findJob(next.jobId)?.position} · {findJob(next.jobId)?.company}</Link> : ""}
            <Link className="btn secondary" to="/employer/jobposting/">➕ Post a new job</Link>
        </div>
        <h2>Recently reviewed</h2>
        <ul className="card-list">
            {reviewed.length != 0 ? reviewed.map((jobSubmission) => (
                <li key={jobSubmission.id}>
                    <div className="item"><div className="title">{findJob(jobSubmission.jobId)?.position} · {findJob(jobSubmission.jobId)?.company}</div><div className="meta">Submitted {jobSubmission.date}</div></div>
                    <span className="badge reviewed">Reviewed</span>
                    <Link className="btn-link" to={"/applicant/submission/" + jobSubmission.id}>View Feedback</Link>
                </li>
            )) : <li className="empty">No feedback sent yet.</li>}
        </ul>
        </>
    );
};

const LoginSignUpPage = ({ currentUser, loginUser, resetDemoAndLogin, addUser, jobList, jobSubmissionList, documentList }: UserSignUpLoginProps) => {
    const [tab, setTab] = useState<"login" | "signup">("login");
    const [notice, setNotice] = useState<string>("");
    const [signedUpEmail, setSignedUpEmail] = useState<string>("");
    return (
        <>
        {!currentUser ?
            <div className="auth-page">
                <section className="auth-hero">
                    <h1>Know exactly why your application worked, or didn't.</h1>
                    <p>Employers comment right on your resume and cover letter, so you know what to fix before you apply again.</p>
                    <ul className="auth-points">
                        <li><span>👍</span><div><b>Comments on the exact line</b>Positive and negative feedback with a clear reason.</div></li>
                        <li><span>⭐</span><div><b>A clear decision</b>Strongly Consider, Consider or Not a Fit, plus what to do next.</div></li>
                        <li><span>💬</span><div><b>Ask about the feedback</b>Not sure what a comment means? Ask the employer.</div></li>
                    </ul>
                    <div className="auth-preview" aria-hidden="true">
                        <div className="auth-preview-line"><mark className="pos">Led a team of 4 to build a clinic appointment app</mark></div>
                        <div className="auth-preview-tag pos">👍&nbsp; Positive · Strong impact</div>
                        <div className="auth-preview-line"><mark className="neg">Responsible for various tasks related to the website</mark></div>
                        <div className="auth-preview-tag neg">👎&nbsp; Negative · Too vague</div>
                    </div>
                </section>
                <section className="auth-card">
                    <div className="auth-tabs" role="tablist">
                        <button type="button" role="tab" aria-selected={tab == "login"} className={tab == "login" ? "active" : ""} onClick={() => setTab("login")}>Log in</button>
                        <button type="button" role="tab" aria-selected={tab == "signup"} className={tab == "signup" ? "active" : ""} onClick={() => { setTab("signup"); setNotice(""); }}>Create account</button>
                    </div>
                    {tab == "login" ?
                        <LoginForm key={signedUpEmail} currentUser={currentUser} loginUser={loginUser} resetDemoAndLogin={resetDemoAndLogin} notice={notice} defaultEmail={signedUpEmail} />
                    :
                        <SignUpForm currentUser={currentUser} addUser={addUser} onSignedUp={(email) => {
                            setSignedUpEmail(email);
                            setNotice("Account created! Enter your password to log in.");
                            setTab("login");
                        }} />
                    }
                </section>
            </div>
        : ""}
        {currentUser ? currentUser.isEmployer ?
            <EmployerHome currentUser={currentUser} jobList={jobList} jobSubmissionList={jobSubmissionList} documentList={documentList} />
            : <ApplicantHome currentUser={currentUser} jobList={jobList} jobSubmissionList={jobSubmissionList} documentList={documentList} />
        : ""}
        </>
    );
};

export default LoginSignUpPage;