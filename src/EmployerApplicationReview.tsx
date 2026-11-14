import { useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import { Link } from "react-router";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";

interface ApplicantFeedbackProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
    getJob : (id : number) => Job;
}

const EmployerApplicationReview = ({currentUser, documentList, jobSubmissionList, jobList, getJob} : ApplicantFeedbackProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    return (
        <div>
            <h1>Submissions Review</h1>
            <ul className="card-list">
                {jobSubmissionList ? jobSubmissionList.filter((jobSubmission) => getJob(jobSubmission.jobId).reviewerId == currentUser?.id).map((jobSubmission) => <li key={jobSubmission.id}><div className="item"><div className="title">{getJob(jobSubmission.jobId).position} · {getJob(jobSubmission.jobId).company}</div><div className="meta">Submitted {jobSubmission.date}</div></div><span className={"badge " + (jobSubmission.reviewed ? "reviewed" : "pending")}>{jobSubmission.reviewed ? "Reviewed" : "Pending Review"}</span><Link className="btn-link" to={{pathname: "/applicant/submission/"+jobSubmission.id}}>{jobSubmission.reviewed ? "View Feedback" : "Review"}</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default EmployerApplicationReview;