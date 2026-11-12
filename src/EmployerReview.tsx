
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
import { Route, Routes, useParams } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";

// interface CommentFormProps {
//   highlights: CommentedHighlight[];
//   setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>;
// }
const TEST_HIGHLIGHTS = _testHighlights;
const PRIMARY_PDF_URL = "https://arxiv.org/pdf/2203.11115";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480";

interface EmployerReviewProps {
    currentUser: User | null, // make this an id as then I can reference the user directly through a function
    documentList: DocumentRec[],
    jobSubmissionList: JobSubmission[],
    jobList: Job[],
    // highlights: CommentedHighlight[],
    setHighlightByJobSubmissionId : (id : number, commentedHighlights : CommentedHighlight[]) => void;
    getHighlightByJobSubmissionId : (id : number) => CommentedHighlight[];
    getPdfByJobSubmissionId : (id : number) => string;
    getPdfLinkByJobSubmissionId : (id : number) => string;
    updateState : () => void;
    // setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>
}
// highlights, setHighlights
const EmployerReview = ({currentUser, updateState, documentList, jobSubmissionList, jobList, setHighlightByJobSubmissionId, getHighlightByJobSubmissionId, getPdfByJobSubmissionId, getPdfLinkByJobSubmissionId} : EmployerReviewProps) => {
    // const [pdf, setPdf] = useState<string | URL | TypedArray | DocumentInitParameters>(""); // documentList !== null ? documentList[1] !== null ? documentList[1].pdf : "" : ""
    
    

    // Need to be on the id route now to work
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this picks the submission to load which then has the document to load
    
    // const [pdfLink, setPdfLink] = useState<string>("");

    // useEffect(() => {

    //     setPdfLink(getPdfByJobSubmissionId(idRoute)); 
    // }, [idRoute]);

    
    // const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == idRoute);
    // if (jobSubmission == undefined) {
    //     throw Error("jobSubmission undefined!");
    // }
    // const job = jobList.find((job) => job.id == jobSubmission.jobId);
    // if (job == undefined) {
    //     throw Error("job undefined!");
    // }
    // setHighlightByJobSubmissionId
    // const [highlights, setHighlights] = useState<CommentedHighlight[]>([]);
    
    // useEffect(() => {
    //     // Got to load from storage here too
    //     // updateState();
    //     console.log(idRoute + ": id route changed!");

    //     console.log(jobSubmissionList);
    //     const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == idRoute);
    //     console.log(jobSubmission);
    //     if (jobSubmission == undefined) {
    //         throw Error("jobSubmission undefined!");
    //     }
    //     const job = jobList.find((job) => job.id == jobSubmission.jobId);
    //     if (job == undefined) {
    //         throw Error("job undefined!");
    //     }
    //     console.log(documentList);
    //     const document = documentList.find((document) => document.id == jobSubmission.docId);
    //     if (document == undefined) {
    //         // const documentListData = window.localStorage.getItem('documentList');
    
    //         // if ( documentListData !== null ) console.log("The data from the documentList", JSON.parse(documentListData));
    //         // if ( documentListData !== null ) { 
    //         //     setDocumentList(JSON.parse(documentListData));
    //         // } else {
    //         //     throw Error("document undefined!");
    //         // }
    //         throw Error("document undefined!");
    //     }
    //     // setHighlightByJobSubmissionId(idRoute, )
    //     // setHighlights(jobSubmission.commentedHighlights);
    //     setPdf(document.pdf);
    // }, [idRoute]);
    
    // const [url, setUrl] = useState(PRIMARY_PDF_URL); // PRIMARY_PDF_URL
    

    
    // const [highlights, setHighlights] = useState<Array<CommentedHighlight>>(
    //     TEST_HIGHLIGHTS[PRIMARY_PDF_URL] ?? [],
    // ); // Insert the highlights saved state here, load it here on start up

    // Pass the document and the user that is currently logged in
    // const currentPdfIndexRef = useRef(0);
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
    // setHighlights
    return (
        <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
            highlights={getHighlightByJobSubmissionId(idRoute)}
            resetHighlights={() => resetHighlights((highlight) => setHighlightByJobSubmissionId(idRoute, highlight) )} 
            // toggleDocument={() => toggleDocument(currentPdfIndexRef, setUrl, setHighlights)}
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
            <Toolbar setPdfScaleValue={(value) => setPdfScaleValue(value)} toggleHighlightPen={() => setHighlightPen(!highlightPen)} />
            <PdfLoader document={getPdfByJobSubmissionId(idRoute)} workerSrc="https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs">
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
                onSelection={highlightPen ? (selection) => addHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), selection.makeGhostHighlight(), "") : undefined}
                selectionTip={highlightPen ? undefined : <ExpandableTip addHighlight={(highlight, comment) => addHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, highlight), getHighlightByJobSubmissionId(idRoute), highlight, comment)} />}
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
        
    );
};

export default EmployerReview;
