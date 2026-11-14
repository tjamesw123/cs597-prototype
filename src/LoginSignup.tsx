import React, { useEffect, useState, type FormEvent } from "react";


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

const LoginSignUpPage = ({ currentUser, loginUser, addUser }: UserSignUpLoginProps) => {
    return (
        <>
        {!currentUser ?
            <div className="auth">
                <LoginForm currentUser={currentUser} loginUser={loginUser} />
                <SignUpForm currentUser={currentUser} addUser={addUser}/>
            </div>
        : ""}
        {currentUser ? currentUser.isEmployer ? <p>Proceed to the applications tab to start reviewing job submissions</p> : <p>Add your resume and cover letters in the document upload tab and then apply for jobs with those documents and get annotated feedback on them from the employer</p> : ""}
        </>
    );
};

export default LoginSignUpPage;