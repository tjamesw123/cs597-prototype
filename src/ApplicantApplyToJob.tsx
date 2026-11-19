import { Link, useParams } from "react-router";
import type { DocumentRec, Job, JobSubmission } from "./App";
import type { User } from "./LoginSignup";
import { useState } from "react";








interface ApplicantApplyToJobProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    applyToJob : (jobId : number, date: string, resumeId : number | null, coverLetterId : number | null) => JobSubmission | null;
    getJob : (id : number) => Job;
}


const ApplicantApplyToJob = ({currentUser, documentList, jobSubmissionList, applyToJob, getJob} : ApplicantApplyToJobProps) => {
    // Need to be on the id route now to work
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this picks the submission to load which then has the document to load
    
    const [result, setResult] = useState<string>("");

    const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<number | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
    const [sentId, setSentId] = useState<number | null>(null);

    // Prevent applying twice to the same job
    const existing = jobSubmissionList.find((jobSubmission) => jobSubmission.userId == currentUser?.id && jobSubmission.jobId == idRoute);
    const myDocuments = documentList.filter((document) => document.userId == currentUser?.id && !document.removed);
    const label = (document : DocumentRec) => document.name !== "" ? document.name + " (" + document.fileName + ")" : document.fileName;

    return (
        <>
        <h1>Apply to Job</h1>
        <div className="job-header">
            <span className="job-logo">{getJob(idRoute).company.charAt(0)}</span>
            <div>
                <div className="job-position">{getJob(idRoute).position}</div>
                <div className="job-company">{getJob(idRoute).company}</div>
            </div>
        </div>

        {existing && sentId == null ? (
            <div className="form-notice success applied-notice">
                You already applied to this job on {existing.date}. <Link to={"/applicant/submission/" + existing.id}>View your application →</Link>
            </div>
        ) : (
        <form
        className="apply"
        onSubmit={(event) => {
            event.preventDefault();
            setResult("");
            if (selectedResumeId == null && selectedCoverLetterId == null) {
                setResult("Choose a resume or a cover letter (or both) before applying.");
                return;
            }
            const submission = applyToJob(idRoute, new Intl.DateTimeFormat("en-US").format(new Date()), selectedResumeId, selectedCoverLetterId);
            if (submission) {
                setSentId(submission.id);
                setResult("Applied!");
            } else {
                setResult("Something went wrong and your application wasn't sent. Please try again.");
            }
        }}
        >
        <div>
            <label>Resume
                <select onChange={e => setSelectedResumeId(e.target.value == "null" ? null : Number(e.target.value))}>
                    <option value="null">None</option>
                    {myDocuments.filter((document) => document.type == "resume").map((document) => <option key={document.id} value={document.id.toString()}>{label(document)}</option>)}
                </select>
            </label>

            <label>Cover Letter
                <select onChange={e => setSelectedCoverLetterId(e.target.value == "null" ? null : Number(e.target.value))}>
                    <option value="null">None</option>
                    {myDocuments.filter((document) => document.type == "coverletter").map((document) => <option key={document.id} value={document.id.toString()}>{label(document)}</option>)}
                </select>
            </label>
        </div>
        <div>
            <input type="submit" value={sentId != null ? "Application sent ✓" : "Apply to Job"} disabled={sentId != null} />
        </div>
        {result && <p className={"form-notice " + (result == "Applied!" ? "success" : "error")}>
            {result == "Applied!" ? <>Application sent! <Link to="/applicant/feedback">Track it in Feedback →</Link></> : result}
        </p>}
        </form>
        )}
        </>
    );
};

export default ApplicantApplyToJob;