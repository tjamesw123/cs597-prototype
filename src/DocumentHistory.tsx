import { Link } from "react-router";
import "./style/App.css";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, JobSubmission } from "./App.tsx";

interface DocumentHistoryProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
}

// Per document history: every resume and cover letter with how many applications used it
const DocumentHistory = ({currentUser, documentList, jobSubmissionList} : DocumentHistoryProps) => {
    const myDocuments = documentList.filter((document) => document.userId == currentUser?.id && !document.removed);
    const timesUsed = (document : DocumentRec) => jobSubmissionList.filter((jobSubmission) =>
        document.type == "resume" ? jobSubmission.resumeId == document.id : jobSubmission.coverLetterId == document.id).length;

    const documentRows = (type : "resume" | "coverletter", emptyText : string) => {
        const documents = myDocuments.filter((document) => document.type == type);
        return documents.length != 0 ? documents.map((document) => (
            <li key={document.id}>
                <div className="item">
                    <div className="title">{document.name != "" ? document.name : document.fileName}</div>
                    <div className="meta">{document.fileName} · Sent with {timesUsed(document)} application{timesUsed(document) == 1 ? "" : "s"}</div>
                </div>
                <Link className="btn-link" to={{pathname: "/applicant/document/" + document.id}}>View History</Link>
            </li>
        )) : <li className="empty">{emptyText}</li>;
    };

    return (
        <div>
            <h1>Document History</h1>
            <p className="home-subtitle">See where each document was sent and all the feedback it received.</p>
            <h2>Resumes</h2>
            <ul className="card-list">{documentRows("resume", "There are no resumes.")}</ul>
            <h2>Cover Letters</h2>
            <ul className="card-list">{documentRows("coverletter", "There are no cover letters.")}</ul>
        </div>
    );
};

export default DocumentHistory;
