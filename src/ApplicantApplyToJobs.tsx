import { useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import { Link } from "react-router";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";

interface ApplicantApplyToJobsProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
}

const ApplicantApplyToJobs = ({jobList} : ApplicantApplyToJobsProps) => {
    const [search, setSearch] = useState<string>("");
    // Search by position or company
    const matches = jobList ? jobList.filter((job) => (job.position + " " + job.company).toLowerCase().includes(search.trim().toLowerCase())) : [];
    return (
        <div>
            <h1>Apply to Jobs</h1>
            <input className="job-search" type="search" placeholder="Search jobs by position or company" value={search} onInput={(e) => setSearch(e.currentTarget.value)} />
            <ul className="card-list">
                {matches.length == 0 ? <li className="empty">{search != "" ? "No jobs match your search." : "There are no jobs yet."}</li> : ""}
                {matches.map((job) => <li key={job.id}><div className="item"><div className="title">{job.position}</div><div className="meta">{job.company}</div></div><Link className="btn-link" to={{pathname: "/applicant/apply/"+job.id}}>Apply</Link></li>)}
            </ul>
        </div>
    );
};

export default ApplicantApplyToJobs;