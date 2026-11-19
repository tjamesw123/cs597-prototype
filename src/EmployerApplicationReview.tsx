// import { useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import { Link } from "react-router";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";
import { DECISIONS } from "./types.ts";
import { readUsers } from "./LoginSignup.tsx";

interface ApplicantFeedbackProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
    getJob : (id : number) => Job;
}

const EmployerApplicationReview = ({currentUser, jobSubmissionList, getJob} : ApplicantFeedbackProps) => {
    // The employer reviews people, so lead with the applicant's name
    const users = readUsers();
    const applicantOf = (userId : number) => users.find((user) => user.id == userId);
    const initials = (user? : User) => user ? (user.first_name.charAt(0) + user.last_name.charAt(0)).toUpperCase() : "?";
    return (
        <div>
            <h1>Submissions Review</h1>
            <ul className="card-list">
                {jobSubmissionList ? jobSubmissionList.filter((jobSubmission) => getJob(jobSubmission.jobId).reviewerId == currentUser?.id).map((jobSubmission) => <li key={jobSubmission.id}><span className="applicant-avatar" aria-hidden="true">{initials(applicantOf(jobSubmission.userId))}</span><div className="item"><div className="title">{applicantOf(jobSubmission.userId) ? applicantOf(jobSubmission.userId)!.first_name + " " + applicantOf(jobSubmission.userId)!.last_name : "Unknown applicant"}</div><div className="meta">{getJob(jobSubmission.jobId).position} · {getJob(jobSubmission.jobId).company} · Applied {jobSubmission.date}</div></div><span className={"badge " + (jobSubmission.reviewed ? "reviewed" : "pending")}>{jobSubmission.reviewed ? "Reviewed" + (jobSubmission.decision ? " · " + DECISIONS[jobSubmission.decision].label : "") : "Pending Review"}</span>{(jobSubmission.questions ?? []).some((question) => !question.reply) ? <span className="badge question">💬 Question</span> : ""}<Link className="btn-link" to={{pathname: "/applicant/submission/"+jobSubmission.id}}>{jobSubmission.reviewed ? "View Feedback" : "Review"}</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default EmployerApplicationReview;