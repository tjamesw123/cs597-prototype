import React, { type MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm.tsx";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu.tsx";
import ExpandableTip from "./ExpandableTip.tsx";
import HighlightContainer from "./HighlightContainer.tsx";
import Sidebar from "./Sidebar.tsx";
import Toolbar from "./Toolbar.tsx";
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
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import type { CommentedHighlight } from "./types.ts";
import { Link, Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import EmployerReview from "./DocumentReview.tsx";
import { NavLink } from "react-router";
import LoginSignUpPage from "./LoginSignup.tsx";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";
import type { addDocumentType, DocumentRec } from "./App.tsx";

interface ApplicantResumeCoverLetterUploadProps {
    documentList : DocumentRec[];
    addDocument : addDocumentType;
}

const ApplicantResumeCoverLetterUpload = ({documentList, addDocument} : ApplicantResumeCoverLetterUploadProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    return (
        <div>
            <h1>Cover Letter and Resume Upload</h1>
            <form
            className="submitdocs"
            onSubmit={async (event) => {
                event.preventDefault();
                setResult("");
                if (files !== null) {
                    setName("");
                    const file = files[0];
                    // URL.createObjectURL(files[0]);
                    file.name
                    await addDocument(file.name, name, file, docType);
                } else {
                    setResult("No file uploaded!");
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
                <label>Name: <input type="text" value={name} onInput={(e) => setName(e.currentTarget.value)}/></label>
            </div>
            <div>
                <input type="file" onInput={(e) => setFiles(e.currentTarget.files)} />
                <input type="submit" value="SubmitDoc" />
            </div>
            </form>
            <h4>{result}</h4>

            <h2>Cover Letter</h2>
            <ul>
                {documentList && documentList.filter((document) => document.type == "coverletter").length != 0 ? documentList.filter((document) => document.type == "coverletter").map((document) => <li>id: {document.id.toString()}, {document.fileName != undefined && document.fileName != "" ? "fileName: " + document.fileName + "," : "" } Name: {document.name.toString()}</li>) : "There are no cover letters."}
            </ul>

            <h2>Resume</h2>
            <ul>
                {documentList && documentList.filter((document) => document.type == "resume").length != 0 ? documentList.filter((document) => document.type == "resume").map((document) => <li>id: {document.id.toString()}, {document.fileName != undefined && document.fileName != "" ? "fileName: " + document.fileName + "," : "" } Name: {document.name.toString()}</li>) : "There are no resumes."}
            </ul>
        </div>
    );
};

export default ApplicantResumeCoverLetterUpload;

//  <select
//           value={roomId}
//           onChange={e => setRoomId(e.target.value)}
//         >
//           <option value="general">general</option>
//           <option value="travel">travel</option>
//           <option value="music">music</option>
//         </select>

