
import { useEffect, useRef, useState} from "react";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu.tsx";
import HighlightContainer from "./HighlightContainer.tsx";
import Toolbar from "./Toolbar.tsx";
import {
  PdfHighlighter,
  type PdfHighlighterUtils,
  PdfLoader} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import type { CommentedHighlight } from "./types.ts";
import { useParams } from "react-router";
import { handleContextMenu, resetHash, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";
import FullDocumentReviewSidebar from "./FullDocumentSidebar.tsx";

interface DocumentReviewProps {
    currentUser: User | null, // make this an id as then I can reference the user directly through a function
    documentList: DocumentRec[],
    jobSubmissionList: JobSubmission[],
    jobList: Job[];
    getJobSubmission: (id: number) => JobSubmission;
    getDocumentRec: (id : number) => DocumentRec;
    isCoverLetterPresentInJobSubmissionId: (id: number) => boolean;
    isResumePresentInJobSubmissionId: (id: number) => boolean;
    getResumePdfByJobSubmissionId : (id : number) => string | null;
    getCoverLetterPdfByJobSubmissionId : (id : number) => string | null;
    getResumePdfLinkByJobSubmissionId : (id : number) => string | null;
    getCoverLetterPdfLinkByJobSubmissionId : (id : number) => string | null;
    getAllHighlightsForDocumentId : (id : number) => CommentedHighlight[];
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

// This is more of a jobSubmission review
const FullDocumentReview = ({currentUser, jobSubmissionList, getJob, getJobSubmission, getDocumentRec, getAllHighlightsForDocumentId, reviewedSubmission} : DocumentReviewProps) => {
    
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this is the document id in this case

    

    const [coverLetterOrResume, setCoverLetterOrResume] = useState<"coverletter" | "resume">(getDocumentRec(idRoute).type);
    
    const [pdfLink, setPdfLink] = useState<string>("");

    useEffect(() => {
        if (getDocumentRec(idRoute).type == "coverletter") {
            setCoverLetterOrResume("coverletter");
        } else {
            setCoverLetterOrResume("resume");
        }
        const url = getDocumentRec(idRoute).pdfURL;
        if (url == null) {
            const pdfData = getDocumentRec(idRoute).pdfData;
            if (pdfData == null) {
                throw Error("pdfData null!");
            }
            const blob = base64ToBlob(pdfData);
            const pdfURL = URL.createObjectURL(blob);
            setPdfLink(pdfURL);
        } else {
            setPdfLink(url);
        }
    }, [idRoute]);


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
        window.addEventListener("hashchange", () => scrollToHighlightFromHash(getAllHighlightsForDocumentId(idRoute), highlighterUtilsRef));

        return () => {
        window.removeEventListener("hashchange", () => scrollToHighlightFromHash(getAllHighlightsForDocumentId(idRoute), highlighterUtilsRef));
        };
    }, [scrollToHighlightFromHash]);

    return (
        <>
        <h1>Document History</h1>
        <div className="App" style={{ display: "flex", height: "100vh" }}>
        <FullDocumentReviewSidebar
            highlights={getAllHighlightsForDocumentId(idRoute)}
            currentUser={currentUser}
            getJobSubmission={getJobSubmission}
            getJob={getJob}
            getDocumentRec={getDocumentRec}
            coverLetterOrResume={coverLetterOrResume}
            idRoute={idRoute}
            reviewedSubmission={reviewedSubmission}
            jobSubmissionList={jobSubmissionList}
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
                    onSelection={undefined}
                    selectionTip={undefined}
                    highlights={getAllHighlightsForDocumentId(idRoute)}
                    style={{
                        height: "calc(100% - 41px)",
                    }}
                    >
                    <HighlightContainer
                        editHighlight={() => null}
                        onContextMenu={(event, highlight) => handleContextMenu(event, highlight, setContextMenu, () => null, getAllHighlightsForDocumentId(idRoute), highlighterUtilsRef)}
                    />
                </PdfHighlighter>
            )}
            </PdfLoader>
        </div>

        {currentUser?.isEmployer && contextMenu && <ContextMenu {...contextMenu} />}
        </div>
        </>
        
    );
};

export default FullDocumentReview;
