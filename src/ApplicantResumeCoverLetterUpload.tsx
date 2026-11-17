import { useState } from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import type { User } from "./LoginSignup.tsx";
import type { addDocumentType, DocumentRec } from "./App.tsx";

interface ApplicantResumeCoverLetterUploadProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    addDocument : addDocumentType;
}

const ApplicantResumeCoverLetterUpload = ({currentUser, documentList, addDocument} : ApplicantResumeCoverLetterUploadProps) => {
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
                {documentList && documentList.filter((document) => document.userId == currentUser?.id).filter((document) => document.type == "coverletter").length != 0 ? documentList
                .filter((document) => document.userId == currentUser?.id)
                .filter((document) => document.type == "coverletter")
                .map((document) => <li key={document.id}><div className="item"><div className="title">{document.name != "" ? document.name : document.fileName}</div><div className="meta">{document.fileName}</div></div></li>) : <li className="empty">There are no cover letters.</li>}
            </ul>

            <h2>Resumes</h2>
            <ul className="card-list">
                {documentList && documentList.filter((document) => document.userId == currentUser?.id).filter((document) => document.type == "resume").length != 0 ? documentList
                .filter((document) => document.userId == currentUser?.id)
                .filter((document) => document.type == "resume")
                .map((document) => <li key={document.id}><div className="item"><div className="title">{document.name != "" ? document.name : document.fileName}</div><div className="meta">{document.fileName}</div></div></li>) : <li className="empty">There are no resumes.</li>}
            </ul>
        </div>
    );
};

export default ApplicantResumeCoverLetterUpload;
