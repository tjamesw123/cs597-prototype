
import Sidebar from "./Sidebar.tsx";
import React, { type MouseEvent, useEffect, useRef, useState} from "react";
import CommentForm from "./CommentForm.tsx";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu.tsx";
import ExpandableTip from "./ExpandableTip.tsx";
import HighlightContainer from "./HighlightContainer.tsx";
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
import { Route, Routes, useParams } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, getJobType, Job, JobSubmission } from "./App.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";

// interface CommentFormProps {
//   highlights: CommentedHighlight[];
//   setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>;
// }
const TEST_HIGHLIGHTS = _testHighlights;
const PRIMARY_PDF_URL = "https://arxiv.org/pdf/2203.11115";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480";

interface DocumentReviewProps {
    currentUser: User | null, // make this an id as then I can reference the user directly through a function
    documentList: DocumentRec[],
    jobSubmissionList: JobSubmission[],
    jobList: Job[],
    setHighlightByJobSubmissionId : (id : number, commentedHighlights : CommentedHighlight[]) => void;
    getHighlightByJobSubmissionId : (id : number) => CommentedHighlight[];
    getPdfByJobSubmissionId : (id : number) => string | null;
    getPdfLinkByJobSubmissionId : (id : number) => string | null;
    reviewedSubmission : (id : number) => void;
    getJob : (id : number) => Job;
}
const base64ToBlob = (base64: string): Blob => {
    const [metadata, data] = base64.split(",");

    const mimeType = metadata.match(/:(.*?);/)?.[1] || "application/pdf";

    const binary = atob(data);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
};
// highlights, setHighlights

// This is more of a jobSubmission review
const DocumentReview = ({currentUser, documentList, jobSubmissionList, jobList, setHighlightByJobSubmissionId, getHighlightByJobSubmissionId, getPdfByJobSubmissionId, getPdfLinkByJobSubmissionId, reviewedSubmission} : DocumentReviewProps) => {
    // Need to be on the id route now to work
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this picks the submission to load which then has the document to load

    // The id is a jobSubmission id so doesn't display individual 
    // Always try to start with the resume by you can switch between them
    // const [coverLetterOrResume, setCoverLetterOrResume] = useState<"coverletter" | "resume">("resume"); 
    
    const [pdfLink, setPdfLink] = useState<string>("");

    useEffect(() => {
        const url = getPdfLinkByJobSubmissionId(idRoute);
        if (url == null) {
            const pdfData = getPdfByJobSubmissionId(idRoute);
            if (pdfData == null) {
                throw Error("pdfData null!");
            }
            const blob = base64ToBlob(pdfData);
            const pdfURL = URL.createObjectURL(blob);
            setPdfLink(pdfURL);
        } else {
            setPdfLink(url);
        }
    }, [idRoute]); // How to make this change by a pageType change and not break everything


    // Everything passed here is document review

    // Pass the document and the user that is currently logged in
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
    const [pdfScaleValue, setPdfScaleValue] = useState<number | undefined>(
        undefined,
    );
    const [highlightPen, setHighlightPen] = useState<boolean>(false);

    // Refs for PdfHighlighter utilities
    const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

    // Click listeners for context menu
    useEffect(() => {
        const handleClick = () => {
        if (contextMenu) {
            setContextMenu(null);
        }
        };

        document.addEventListener("click", handleClick);

        return () => {
        document.removeEventListener("click", handleClick);
        };
    }, [contextMenu]);

    // Hash listeners for autoscrolling to highlights
    useEffect(() => {
        window.addEventListener("hashchange", () => scrollToHighlightFromHash(getHighlightByJobSubmissionId(idRoute), highlighterUtilsRef));

        return () => {
        window.removeEventListener("hashchange", () => scrollToHighlightFromHash(getHighlightByJobSubmissionId(idRoute), highlighterUtilsRef));
        };
    }, [scrollToHighlightFromHash]);

    return (
        <>
        <h1>Review feedback for particular submission</h1>
        <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
            highlights={getHighlightByJobSubmissionId(idRoute)}
            resetHighlights={() => resetHighlights((highlight) => setHighlightByJobSubmissionId(idRoute, highlight) )}
            currentUser={currentUser}
            // documentList={}
            // jobSubmissionList={}
            // jobList={}
            idRoute={idRoute}
            reviewedSubmission={reviewedSubmission}
            
        />
        <div
            style={{
            height: "100vh",
            width: "75vw",
            overflow: "hidden",
            position: "relative",
            flexGrow: 1,
            }}
        >
            <Toolbar setPdfScaleValue={(value) => setPdfScaleValue(value)} toggleHighlightPen={() => setHighlightPen(!highlightPen)} currentUser={currentUser} />
            <PdfLoader document={pdfLink} workerSrc="https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs">
            {(pdfDocument) => (
                <PdfHighlighter
                    enableAreaSelection={(event) => event.altKey}
                    pdfDocument={pdfDocument}
                    onScrollAway={resetHash}
                    utilsRef={(_pdfHighlighterUtils) => {
                        highlighterUtilsRef.current = _pdfHighlighterUtils;
                    }}
                    pdfScaleValue={pdfScaleValue}
                    textSelectionColor={highlightPen ? "rgba(255, 226, 143, 1)" : undefined}
                    onSelection={currentUser?.isEmployer ? highlightPen ? (selection) => addHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), selection.makeGhostHighlight(), "") : undefined : undefined}
                    selectionTip={currentUser?.isEmployer ? highlightPen ? undefined : <ExpandableTip addHighlight={(highlight, comment) => addHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), highlight, comment)} /> : undefined}
                    highlights={getHighlightByJobSubmissionId(idRoute)}
                    style={{
                        height: "calc(100% - 41px)",
                    }}
                    >
                    <HighlightContainer
                        editHighlight={(idToUpdate, edit) => editHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), idToUpdate, edit)}
                        onContextMenu={(event, highlight) => handleContextMenu(event, highlight, setContextMenu, (highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), highlighterUtilsRef)}
                    />
                </PdfHighlighter>
            )}
            </PdfLoader>
        </div>

        {contextMenu && <ContextMenu {...contextMenu} />}
        </div>
        </>
        
    );
};

export default DocumentReview;
