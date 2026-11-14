import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
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

const ApplicantFeedback = ({jobSubmissionList, getJob} : ApplicantFeedbackProps) => {
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