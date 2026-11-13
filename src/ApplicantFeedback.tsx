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
import EmployerReview from "./DocumentReview.tsx";
import { NavLink } from "react-router";
import LoginSignUpPage from "./LoginSignup.tsx";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";
import type { addDocumentType, DocumentRec, getJobType, Job, JobSubmission } from "./App.tsx";

interface ApplicantFeedbackProps {
    currentUser : User | null;
    documentList : DocumentRec[];
    jobSubmissionList : JobSubmission[];
    jobList : Job[];
    getJob : (id : number) => Job;
}

const ApplicantFeedback = ({currentUser, documentList, jobSubmissionList, jobList, getJob} : ApplicantFeedbackProps) => {
    const [name, setName] = useState<string>("");
    const [docType, setDocType] = useState<"resume" | "coverletter">("resume");
    const [result, setResult] = useState<string>("");
    const [files, setFiles] = useState<FileList | null>(null);
    return (
        <div>
            <h1>Submission Review</h1>
            <ul>
                {jobSubmissionList ? jobSubmissionList.map((jobSubmission) => <li>id: {jobSubmission.id.toString()}, Date: {jobSubmission.date.toString()}, Company: {getJob(jobSubmission.jobId).company}, Position: {getJob(jobSubmission.jobId).position} Reviewed: {jobSubmission.reviewed ? "Yes" : "No"}, <Link to={{pathname: "/applicant/submission/"+jobSubmission.id}}>View Submission</Link></li>) : ""}
            </ul>
        </div>
    );
};

export default ApplicantFeedback;