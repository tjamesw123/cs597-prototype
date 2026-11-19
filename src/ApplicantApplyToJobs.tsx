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

const ApplicantApplyToJobs = ({currentUser, jobList, jobSubmissionList} : ApplicantApplyToJobsProps) => {
    // Jobs this applicant already applied to show their status instead of another Apply button
    const appliedTo = (jobId : number) => jobSubmissionList.find((jobSubmission) => jobSubmission.userId == currentUser?.id && jobSubmission.jobId == jobId);
    const [search, setSearch] = useState<string>("");
    // Search by position or company
    const matches = jobList ? jobList.filter((job) => (job.position + " " + job.company).toLowerCase().includes(search.trim().toLowerCase())) : [];
    return (
        <div>
            <h1>Apply to Jobs</h1>
            <input className="job-search" type="search" placeholder="Search jobs by position or company" value={search} onInput={(e) => setSearch(e.currentTarget.value)} />
            <ul className="card-list">
                {matches.length == 0 ? <li className="empty">{search != "" ? "No jobs match your search." : "There are no jobs yet."}</li> : ""}
                {matches.map((job) => {
                    const submission = appliedTo(job.id);
                    return <li key={job.id}><div className="item"><div className="title">{job.position}</div><div className="meta">{job.company}{submission ? " · Applied " + submission.date : ""}</div></div>
                    {submission ? <><span className="badge applied">✓ Applied</span><Link className="btn-link" to={"/applicant/submission/" + submission.id}>View</Link></> : <Link className="btn-link" to={{pathname: "/applicant/apply/"+job.id}}>Apply</Link>}</li>;
                })}
            </ul>
        </div>
    );
};

export default ApplicantApplyToJobs;