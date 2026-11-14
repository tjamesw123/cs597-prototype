import React, { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";


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
    addUser: addUserType;
    loginUser: (username: string, password: string) => User | null;
}

interface UserSignUpProps {
    currentUser: User | null;
  addUser: addUserType; 
}

interface UserLoginProps {
    currentUser: User | null;
  loginUser: loginUserType;
}

const LoginForm = ({ currentUser, loginUser }: UserLoginProps) => {
    const [username, setUsername] = useState<string>("");
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
        <h2>Log in</h2>
        <div>
            <label>Username <input type="text" value={username} onInput={(e) => setUsername(e.currentTarget.value)}/></label>
            <label>Password <input type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)}/></label>
        </div>
        <div>
            <input type="submit" value="Log in" />
        </div>
        {result && <p className="form-result">{result}</p>}
        </form>
        </>
    );
};

const SignUpForm = ({ currentUser, addUser }: UserSignUpProps) => {
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
            } else {
                setResult("Failed to sign up!");
            }
            // onSubmit(input);
        }}
        >
        <h2>Create an account</h2>
        <div>
            <label>First Name <input type="text" value={first_name} onInput={(e) => setFirstName(e.currentTarget.value)}/></label>
            <label>Last Name <input type="text" value={last_name} onInput={(e) => setLastName(e.currentTarget.value)}/></label>
            <label>Username <input type="text" value={username} onInput={(e) => setUsername(e.currentTarget.value)}/></label>
            <label>Password <input type="password" value={password} onInput={(e) => setPassword(e.currentTarget.value)}/></label>
            <label>Repeat Password <input type="password" value={repeatPassword} onInput={(e) => setRepeatPassword(e.currentTarget.value)}/></label>
            <label className="check"><input type="checkbox" name="isEmployer" defaultChecked={false} onInput={(e) => setIsEmployer(e.currentTarget.checked)}/> I'm an employer</label>
        </div>
        <div>
            <input type="submit" value="Sign Up" />
        </div>
        {result && <p className="form-result">{result}</p>}
        </form>
    </>
  );
};

type HomeAction = { icon: string; title: string; text: string; to: string; button: string };

const HomeDashboard = ({ subtitle, actions, steps }: { subtitle: string; actions: HomeAction[]; steps: string[] }) => (
    <>
    <p className="home-subtitle">{subtitle}</p>
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
    <h2>How it works</h2>
    <ol className="home-steps">
        {steps.map((step, index) => <li key={index}><span>{index + 1}</span>{step}</li>)}
    </ol>
    </>
);

const ApplicantHome = () => (
    <HomeDashboard
        subtitle="Get real feedback on your resume from the employers you apply to."
        actions={[
            { icon: "📄", title: "Upload a resume", text: "Add your resume or cover letter as a PDF.", to: "/applicant/resumecoverletterupload", button: "Upload" },
            { icon: "💼", title: "Apply to jobs", text: "Pick a job and send your documents.", to: "/applicant/apply", button: "Browse jobs" },
            { icon: "💬", title: "See your feedback", text: "Read employer highlights and comments.", to: "/applicant/feedback", button: "View feedback" },
        ]}
        steps={["Upload your resume", "Apply to a job", "Get highlighted feedback"]}
    />
);

const EmployerHome = () => (
    <HomeDashboard
        subtitle="Review applicants and give them feedback that helps."
        actions={[
            { icon: "📝", title: "Review applications", text: "Highlight resumes and leave comments.", to: "/employer/applications/", button: "Go to applications" },
            { icon: "➕", title: "Post a job", text: "Add a new opening for applicants to see.", to: "/employer/jobposting/", button: "Post a job" },
        ]}
        steps={["Open an application", "Highlight and comment", "Mark as reviewed"]}
    />
);

const LoginSignUpPage = ({ currentUser, loginUser, addUser }: UserSignUpLoginProps) => {
    return (
        <>
        {!currentUser ?
            <div className="auth">
                <LoginForm currentUser={currentUser} loginUser={loginUser} />
                <SignUpForm currentUser={currentUser} addUser={addUser}/>
            </div>
        : ""}
        {currentUser ? currentUser.isEmployer ? <EmployerHome /> : <ApplicantHome /> : ""}
        </>
    );
};

export default LoginSignUpPage;