import React, { type MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import {
  type GhostHighlight,
  type Highlight,
  PdfHighlighter,
  type PdfHighlighterUtils,
  PdfLoader,
  type Tip,
  type ViewportHighlight
} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import type { CommentedHighlight } from "./types.ts";
import { Link, Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import EmployerReview from "./EmployerReview.tsx";
import { NavLink } from "react-router";
import LoginSignUpPage from "./LoginSignup.tsx";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";
import type { addDocumentType, DocumentRec } from "./App.tsx";

interface ApplicantResumeCoverLetterSubmissionProps {
    documentList : DocumentRec[];
    addDocument : addDocumentType;
}

const ApplicantResumeCoverLetterSubmission = ({documentList, addDocument} : ApplicantResumeCoverLetterSubmissionProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    // useEffect(() => {
    //     if (currentUser == null) {
    //         setResult("");
    //     }
    // }, [currentUser]);
    return (
        <div>
            <h1>Application Submission</h1>
            <form
            className="submitdocs"
            onSubmit={async (event) => {
                event.preventDefault();
                setResult("");
                if (files !== null) {
                    setName("");
                    const file = files[0];
                    URL.createObjectURL(files[0]);
                    await addDocument(name, file, docType);
                } else {
                    setResult("No file uploaded!");
                }
            }}
            >
            <div>
                <label>Username: 
                    <select value={docType} onChange={e => setDocType(e.target.value == "resume" || e.target.value == "coverletter" ? e.target.value : "resume")}>
                        <option value="resume">Resume</option>
                        <option value="coverletter">Cover Letter</option>
                    </select>
                </label>
                <label>Name: <input type="text" value={name} onInput={(e) => setName(e.currentTarget.value)}/></label>
            </div>
            <div>
                <input type="file" onInput={(e) => setFiles(e.currentTarget.files)} />
                <input type="submit" value="SubmitDoc" />
            </div>
            </form>
            <h4>{result}</h4>
            <ul>
                {documentList ? documentList.map((document) => <li>id: {document.id.toString()}, Name: {document.name.toString()}</li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantResumeCoverLetterSubmission;

//  <select
//           value={roomId}
//           onChange={e => setRoomId(e.target.value)}
//         >
//           <option value="general">general</option>
//           <option value="travel">travel</option>
//           <option value="music">music</option>
//         </select>

