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
    return (
        <div>
            <h1>Apply to Jobs</h1>
            <ul>
                {jobList ? jobList.map((job) => <li>id: {job.id.toString()}, Company: {job.company}, Position: {job.position} <Link to={{pathname: "/applicant/apply/"+job.id}}>Apply to Job</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantApplyToJobs;