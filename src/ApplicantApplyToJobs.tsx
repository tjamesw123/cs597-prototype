import React, { type MouseEvent, useEffect, useRef, useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import { Link, Route, Routes } from "react-router";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { addDocumentType, DocumentRec, getJobType, Job, JobSubmission } from "./App.tsx";

interface ApplicantApplyToJobsProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
}

const ApplicantApplyToJobs = ({currentUser, documentList, jobSubmissionList, jobList} : ApplicantApplyToJobsProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    return (
        <div>
            <h1>Apply to Jobs</h1>
            <ul className="card-list">
                {jobList ? jobList.map((job) => <li key={job.id}><div className="item"><div className="title">{job.position}</div><div className="meta">{job.company}</div></div><Link className="btn-link" to={{pathname: "/applicant/apply/"+job.id}}>Apply</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantApplyToJobs;