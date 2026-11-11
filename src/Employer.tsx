import Sidebar from "./Sidebar";
import React, { type MouseEvent, useEffect, useRef, useState} from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
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
import { Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import type { User } from "./LoginSignup.tsx";
import type {DocumentRec, JobSubmission} from './App.tsx';

interface EmployerProps {
    documentList : DocumentRec[];
    jobSubmissions : JobSubmission[];
}

const Employer = ({documentList, jobSubmissions} : EmployerProps) => {
    
    return (
        <div>
            <h1>Employer</h1>
            <h2>Application resumes to review</h2>
            <ul>
                {jobSubmissions ? jobSubmissions.map((jobSubmission) => <li>{jobSubmission.id.toString()}</li>) : ""}
            </ul>
        </div>
    );
};

export default Employer