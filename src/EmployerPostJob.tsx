import { useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job } from "./App.tsx";

interface EmployerPostJobProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobList : Job[];
    addJob : (company : string, position : string, reviewerId : number) => Job | null;
}

const EmployerPostJob = ({currentUser, jobList, addJob} : EmployerPostJobProps) => {
    const [company, setCompany] = useState<string>("");
    const [position, setPosition] = useState<string>("");
    const [result, setResult] = useState<string>("");
    return (
        <div>
            <h1>Submit Job Postings</h1>
            <form
            className="submitdocs"
            onSubmit={async (event) => {
                event.preventDefault();
                setResult("");
                const job = addJob(company, position, currentUser != null ? currentUser.id : 0);
                if (job !== null) {
                    setCompany("");
                    setPosition("");
                    setResult("Job posted successfully!");
                } else {
                    setResult("No job posted!");
                }
            }}
            >

            
            <div>
                <label>Company: <input type="text" value={company} onInput={(e) => setCompany(e.currentTarget.value)}/></label>
                <label>Position: <input type="text" value={position} onInput={(e) => setPosition(e.currentTarget.value)}/></label>
                <input type="submit" value="Post job" />
            </div>
            <p>Your Current Job Postings:</p>
            <ul>
                {jobList && jobList.filter((job) => job.reviewerId == currentUser?.id).length != 0 ? jobList.filter((job) => job.reviewerId == currentUser?.id).map((job) => <li>Company: {job.company}, Position: {job.position}</li>) : "There are no jobs."}
            </ul>
            </form>
            <h4>{result}</h4>
        </div>
    );
};

export default EmployerPostJob;