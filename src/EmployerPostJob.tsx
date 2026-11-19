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
            <h1>Post a job</h1>
            <form
            className="submitdocs"
            onSubmit={async (event) => {
                event.preventDefault();
                setResult("");
                // Say exactly what's missing instead of a generic failure
                const missing = [company.trim() == "" ? "company name" : "", position.trim() == "" ? "position" : ""].filter((field) => field != "");
                if (missing.length > 0) {
                    setResult("Add the " + missing.join(" and ") + " to post this job.");
                    return;
                }
                const job = addJob(company.trim(), position.trim(), currentUser != null ? currentUser.id : 0);
                if (job !== null) {
                    setCompany("");
                    setPosition("");
                    setResult("Job posted successfully!");
                } else {
                    setResult("Something went wrong and the job wasn't posted. Please try again.");
                }
            }}
            >

            
            <div>
                <label>Company <input type="text" value={company} placeholder="e.g. Northwind Health" onInput={(e) => setCompany(e.currentTarget.value)}/></label>
                <label>Position <input type="text" value={position} placeholder="e.g. Software Engineering Intern" onInput={(e) => setPosition(e.currentTarget.value)}/></label>
                <input type="submit" value="Post job" />
            </div>
            {result && <p className={"form-notice " + (result == "Job posted successfully!" ? "success" : "error")}>{result == "Job posted successfully!" ? "Job posted! Applicants can see it now." : result}</p>}
            <h2>Your job postings</h2>
            <ul className="card-list">
                {jobList && jobList.filter((job) => job.reviewerId == currentUser?.id).length != 0 ? jobList.filter((job) => job.reviewerId == currentUser?.id).map((job) => <li key={job.id}><div className="item"><div className="title">{job.position}</div><div className="meta">{job.company}</div></div></li>) : <li className="empty">You haven't posted any jobs yet. Add one above and applicants can apply right away.</li>}
            </ul>
            </form>
        </div>
    );
};

export default EmployerPostJob;