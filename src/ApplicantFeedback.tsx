import React, { type MouseEvent, useEffect, useRef, useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import { Link, Route, Routes } from "react-router";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { addDocumentType, DocumentRec, getJobType, Job, JobSubmission } from "./App.tsx";

interface ApplicantFeedbackProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
    getJob : (id : number) => Job;
}

const ApplicantFeedback = ({currentUser, documentList, jobSubmissionList, jobList, getJob} : ApplicantFeedbackProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    return (
        <div>
            <h1>Review Submissions</h1>
            <ul>
                {jobSubmissionList ? jobSubmissionList.map((jobSubmission) => <li>id: {jobSubmission.id.toString()}, Date: {jobSubmission.date.toString()}, Company: {getJob(jobSubmission.jobId).company}, Position: {getJob(jobSubmission.jobId).position} Reviewed: {jobSubmission.reviewed ? "Yes" : "No"}, <Link to={{pathname: "/applicant/submission/"+jobSubmission.id}}>View Submission</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantFeedback;