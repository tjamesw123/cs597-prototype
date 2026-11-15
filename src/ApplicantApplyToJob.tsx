import { Link, useParams } from "react-router";
import type { DocumentRec, Job, JobSubmission } from "./App";
import type { User } from "./LoginSignup";
import { useState } from "react";








interface ApplicantApplyToJobProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    applyToJob : (jobId : number, date: string, resumeId : number | null, coverLetterId : number | null) => JobSubmission | null;
    getJob : (id : number) => Job;
}


const ApplicantApplyToJob = ({currentUser, documentList, applyToJob, getJob} : ApplicantApplyToJobProps) => {
    // Need to be on the id route now to work
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this picks the submission to load which then has the document to load
    
    const [result, setResult] = useState<string>("");

    const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<number | null>(null);
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

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

        <form
        className="apply"
        onSubmit={(event) => {
            event.preventDefault();
            setResult("");
            const user = applyToJob(idRoute, new Intl.DateTimeFormat("en-US").format(new Date()), selectedResumeId, selectedCoverLetterId);
            if (user) {
                setResult("Applied!");
            } else {
                setResult("Failed to apply!");
            }
        }}
        >
        <div>
            <label>Resume
                <select onChange={e => setSelectedResumeId(e.target.value == "null" ? null : Number(e.target.value))}>
                    <option value="null">None</option>
                    {documentList.filter((document) => document.userId == currentUser?.id).filter((document) => document.type == "resume").map((document) => <option value={document.id.toString()}> File Name: {document.fileName}{document.name !== "" ? ", Name: " + document.name : ""}</option>)}
                </select>
            </label>

            <label>Cover Letter
                <select onChange={e => setSelectedCoverLetterId(e.target.value == "null" ? null : Number(e.target.value))}>
                    <option value="null">None</option>
                    {documentList.filter((document) => document.userId == currentUser?.id).filter((document) => document.type == "coverletter").map((document) => <option value={document.id.toString()}> File Name: {document.fileName}{document.name !== "" ? ", Name: " + document.name : ""}</option>)}
                </select>
            </label>
        </div>
        <div>
            <input type="submit" value="Apply to Job" />
        </div>
        {result && <p className={"form-notice " + (result == "Applied!" ? "success" : "error")}>
            {result == "Applied!" ? <>Application sent! <Link to="/applicant/feedback">Track it in Feedback →</Link></> : "Couldn't apply. Choose a resume or cover letter first."}
        </p>}
        </form>
        </>
    );
};

export default ApplicantApplyToJob;