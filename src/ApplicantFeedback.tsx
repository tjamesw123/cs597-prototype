import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import { Link } from "react-router";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";
import { DECISIONS } from "./types.ts";

interface ApplicantFeedbackProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
    getJob : (id : number) => Job;
}

const ApplicantFeedback = ({jobSubmissionList, getJob} : ApplicantFeedbackProps) => {
    return (
        <div>
            <h1>Review Submissions</h1>
            <ul className="card-list">
                {jobSubmissionList ? jobSubmissionList.map((jobSubmission) => <li key={jobSubmission.id}><div className="item"><div className="title">{getJob(jobSubmission.jobId).position} · {getJob(jobSubmission.jobId).company}</div><div className="meta">Applied {jobSubmission.date}</div></div><span className={"badge " + (jobSubmission.reviewed ? (jobSubmission.decision ? "d-" + jobSubmission.decision : "reviewed") : "pending")}>{jobSubmission.reviewed ? (jobSubmission.decision ? DECISIONS[jobSubmission.decision].icon + " " + DECISIONS[jobSubmission.decision].label : "Reviewed") : "Pending Review"}</span><Link className="btn-link" to={{pathname: "/applicant/submission/"+jobSubmission.id}}>View Feedback</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantFeedback;