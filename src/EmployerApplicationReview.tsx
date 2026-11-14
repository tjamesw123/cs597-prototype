// import { useState } from "react";
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

const EmployerApplicationReview = ({currentUser, jobSubmissionList, getJob} : ApplicantFeedbackProps) => {
    return (
        <div>
            <h1>Submissions Review</h1>
            <ul>
                {jobSubmissionList ? jobSubmissionList.filter((jobSubmission) => getJob(jobSubmission.jobId).reviewerId == currentUser?.id).map((jobSubmission) => <li>id: {jobSubmission.id.toString()}, Date: {jobSubmission.date.toString()}, Company: {getJob(jobSubmission.jobId).company}, Position: {getJob(jobSubmission.jobId).position} Reviewed: {jobSubmission.reviewed ? "Yes" : "No"}, <Link to={{pathname: "/applicant/submission/"+jobSubmission.id}}>View submission and provide feedback</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default EmployerApplicationReview;