import { useEffect, useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import type { User } from "./LoginSignup.tsx";
import type { addDocumentType, DocumentRec, JobSubmission } from "./App.tsx";

interface ApplicantResumeCoverLetterUploadProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    setDocumentRemoved : (id : number, removed : boolean) => void;
    addDocument : addDocumentType;
}

const ApplicantResumeCoverLetterUpload = ({currentUser, documentList, jobSubmissionList, setDocumentRemoved, addDocument} : ApplicantResumeCoverLetterUploadProps) => {
    // Removing is instant with an Undo, instead of an "Are you sure?" pop-up
    const [undo, setUndo] = useState<{ id : number; message : string } | null>(null);
    useEffect(() => {
        if (undo == null) {
            return;
        }
        const timer = window.setTimeout(() => setUndo(null), 8000);
        return () => window.clearTimeout(timer);
    }, [undo]);

    const myDocuments = documentList.filter((document) => document.userId == currentUser?.id && !document.removed);
    const timesUsed = (document : DocumentRec) => jobSubmissionList.filter((jobSubmission) =>
        document.type == "resume" ? jobSubmission.resumeId == document.id : jobSubmission.coverLetterId == document.id).length;
    const title = (document : DocumentRec) => document.name != "" ? document.name : document.fileName;

    const documentRows = (type : "resume" | "coverletter", emptyText : string) => {
        const documents = myDocuments.filter((document) => document.type == type);
        return documents.length != 0 ? documents.map((document) => (
            <li key={document.id}>
                <div className="item">
                    <div className="title">{title(document)}</div>
                    <div className="meta">{document.fileName}{timesUsed(document) > 0 ? " · Sent with " + timesUsed(document) + " application" + (timesUsed(document) == 1 ? "" : "s") : ""}</div>
                </div>
                <button type="button" className="btn-link remove-doc" aria-label={"Remove " + title(document)} onClick={() => {
                    setDocumentRemoved(document.id, true);
                    const used = timesUsed(document);
                    setUndo({ id: document.id, message: "Removed \"" + title(document) + "\"." + (used > 0 ? " Employers you sent it to can still see it." : "") });
                }}>Remove</button>
            </li>
        )) : <li className="empty">{emptyText}</li>;
    };
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [resultOk, setResultOk] = useState<boolean>(false);
    return (
        <div>
            <h1>Cover Letter and Resume Upload</h1>
            <form
            className="submitdocs"
            onSubmit={async (event) => {
                event.preventDefault();
                setResult("");
                const form = event.currentTarget;
                if (files !== null && files.length > 0) {
                    setName("");
                    const file = files[0];
                    const document = await addDocument(file.name, name, file, docType, currentUser?.id != undefined ? currentUser.id : 0);
                    setResultOk(document !== null);
                    setResult(document !== null ? `Uploaded "${file.name}". You can now use it when you apply.` : "Upload failed. Please try again.");
                    setFiles(null);
                    form.reset();
                } else {
                    setResultOk(false);
                    setResult("Choose a PDF file first.");
                }
            }}
            >
            <div>
                <label>Document Type
                    <select value={docType} onChange={e => setDocType(e.target.value == "resume" || e.target.value == "coverletter" ? e.target.value : "resume")}>
                        <option value="resume">Resume</option>
                        <option value="coverletter">Cover Letter</option>
                    </select>
                </label>
                <label>Name (optional) <input type="text" value={name} placeholder="e.g. Software Engineer Resume" onInput={(e) => setName(e.currentTarget.value)}/></label>
            </div>
            <div className="file-row">
                <input id="pdf-file" className="file-input" type="file" accept="application/pdf,.pdf" onInput={(e) => setFiles(e.currentTarget.files)} />
                <label htmlFor="pdf-file" className="file-button">📎 Choose PDF</label>
                <span className="file-name">{files && files.length > 0 ? files[0].name : "No file chosen"}</span>
            </div>
            <input type="submit" value={docType == "resume" ? "Upload Resume" : "Upload Cover Letter"} />
            {result && <p className={"form-notice " + (resultOk ? "success" : "error")}>{result}</p>}
            </form>

            <h2>Cover Letters</h2>
            <ul className="card-list">
                {documentRows("coverletter", "You haven't uploaded a cover letter yet.")}
            </ul>

            <h2>Resumes</h2>
            <ul className="card-list">
                {documentRows("resume", "You haven't uploaded a resume yet.")}
            </ul>

            {undo != null ? (
                <div className="undo-bar" role="status">
                    <span>{undo.message}</span>
                    <button type="button" onClick={() => {
                        setDocumentRemoved(undo.id, false);
                        setUndo(null);
                    }}>Undo</button>
                </div>
            ) : ""}
        </div>
    );
};

export default ApplicantResumeCoverLetterUpload;
