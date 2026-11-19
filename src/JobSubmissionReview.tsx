
import Sidebar from "./Sidebar.tsx";
import { useEffect, useRef, useState} from "react";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu.tsx";
import ExpandableTip from "./ExpandableTip.tsx";
import HighlightContainer from "./HighlightContainer.tsx";
import Toolbar from "./Toolbar.tsx";
import {
  PdfHighlighter,
  type PdfHighlighterUtils,
  PdfLoader
} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights.ts";
import { DECISIONS, type CommentedHighlight, type Decision } from "./types.ts";
import FeedbackQuestions from "./FeedbackQuestions.tsx";
import { useParams } from "react-router";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, Job, JobSubmission } from "./App.tsx";

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
    setHighlightByJobSubmissionId : (id : number, type : "coverletter" | "resume", commentedHighlights : CommentedHighlight[]) => void;
    getHighlightByJobSubmissionId : (id : number, type : "coverletter" | "resume") => CommentedHighlight[];
    reviewedSubmission : (id : number) => void;
    submitDecision : (id : number, decision : Decision) => void;
    askQuestion : (id : number, text : string, about? : string) => void;
    replyToQuestion : (id : number, questionId : number, reply : string) => void;
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
const JobSubmissionReview = ({currentUser, getJob, getJobSubmission, getDocumentRec, setHighlightByJobSubmissionId, getHighlightByJobSubmissionId, isResumePresentInJobSubmissionId, isCoverLetterPresentInJobSubmissionId, getCoverLetterPdfByJobSubmissionId, getCoverLetterPdfLinkByJobSubmissionId, getResumePdfByJobSubmissionId, getResumePdfLinkByJobSubmissionId, reviewedSubmission, submitDecision, askQuestion, replyToQuestion} : DocumentReviewProps) => {
    // Need to be on the id route now to work
    let params = useParams();
    const idRoute = params.id !== undefined ? Number(params.id) : 0; // this picks the submission to load which then has the document(s) to load

    // The id is a jobSubmission id so doesn't display individual 
    // Always try to start with the resume by you can switch between them
    const [coverLetterOrResume, setCoverLetterOrResume] = useState<"coverletter" | "resume">(isResumePresentInJobSubmissionId(idRoute) ? "resume" : "coverletter");
    
    const [pdfLink, setPdfLink] = useState<string>("");

    useEffect(() => {
        if (!isResumePresentInJobSubmissionId(idRoute) || (coverLetterOrResume == "coverletter")) {
            const url = getCoverLetterPdfLinkByJobSubmissionId(idRoute);
            if (url == null) {
                const pdfData = getCoverLetterPdfByJobSubmissionId(idRoute);
                if (pdfData == null) {
                    throw Error("pdfData null!");
                }
                const blob = base64ToBlob(pdfData);
                const pdfURL = URL.createObjectURL(blob);
                setPdfLink(pdfURL);
            } else {
                setPdfLink(url);
            }
        } else if (!isCoverLetterPresentInJobSubmissionId(idRoute) || (coverLetterOrResume == "resume")) {
            const url = getResumePdfLinkByJobSubmissionId(idRoute);
            if (url == null) {
                const pdfData = getResumePdfByJobSubmissionId(idRoute);
                if (pdfData == null) {
                    throw Error("pdfData null!");
                }
                const blob = base64ToBlob(pdfData);
                const pdfURL = URL.createObjectURL(blob);
                setPdfLink(pdfURL);
            } else {
                setPdfLink(url);
            }
        }
    }, [idRoute, coverLetterOrResume]);


    // Everything passed here is document review

    // Pass the document and the user that is currently logged in
    const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);
    const [pdfScaleValue, setPdfScaleValue] = useState<number | undefined>(
        undefined,
    );

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
        window.addEventListener("hashchange", () => scrollToHighlightFromHash(getHighlightByJobSubmissionId(idRoute, coverLetterOrResume), highlighterUtilsRef));

        return () => {
        window.removeEventListener("hashchange", () => scrollToHighlightFromHash(getHighlightByJobSubmissionId(idRoute, coverLetterOrResume), highlighterUtilsRef));
        };
    }, [scrollToHighlightFromHash, coverLetterOrResume]);

    // Questions open once feedback is sent (employers also see any that were asked)
    const questionCount = (getJobSubmission(idRoute).questions ?? []).length;
    const unanswered = (getJobSubmission(idRoute).questions ?? []).filter((question) => !question.reply).length;
    const showQuestions = getJobSubmission(idRoute).reviewed || questionCount > 0;

    // Applicants only see comments once the employer has sent their feedback
    const visibleHighlights = currentUser?.isEmployer || getJobSubmission(idRoute).reviewed ? getHighlightByJobSubmissionId(idRoute, coverLetterOrResume) : [];

    return (
        <>
        <h1>Review feedback for submission</h1>
        {/* Applicant sees the employer's overall decision and what to do next */}
        {currentUser?.isEmployer != true && getJobSubmission(idRoute).reviewed && getJobSubmission(idRoute).decision ?
        <div className={"notice decision-banner d-" + getJobSubmission(idRoute).decision}>
            <span className="notice-icon">{DECISIONS[getJobSubmission(idRoute).decision!].icon}</span>
            <span className="notice-text"><b>Employer's decision: {DECISIONS[getJobSubmission(idRoute).decision!].label}</b>
            <span>{DECISIONS[getJobSubmission(idRoute).decision!].next}</span></span>
        </div>
        : ""}
        {showQuestions ?
        <a className="questions-link" href="#questions" onClick={(e) => { e.preventDefault(); document.getElementById("questions")?.scrollIntoView({ behavior: "smooth" }); }}>
            💬 Questions about this feedback{unanswered > 0 ? " · " + unanswered + " waiting for a reply" : questionCount > 0 ? " (" + questionCount + ")" : ""}
        </a>
        : ""}
        {isCoverLetterPresentInJobSubmissionId(idRoute) && isResumePresentInJobSubmissionId(idRoute) ? 
        <button className="sidebar__toggle" onClick={() => coverLetterOrResume == "resume" ? setCoverLetterOrResume("coverletter") : setCoverLetterOrResume("resume")}>Switch to {coverLetterOrResume == "resume" ? "Cover Letter" : "Resume"}</button>
        : ""}
        <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
            highlights={visibleHighlights}
            resetHighlights={() => resetHighlights((highlight) => setHighlightByJobSubmissionId(idRoute, coverLetterOrResume, highlight) )}
            allHighlights={getHighlightByJobSubmissionId(idRoute, coverLetterOrResume)}
            setAllHighlights={(highlights) => setHighlightByJobSubmissionId(idRoute, coverLetterOrResume, highlights)}
            currentUser={currentUser}
            getJobSubmission={getJobSubmission}
            getJob={getJob}
            getDocumentRec={getDocumentRec}
            coverLetterOrResume={coverLetterOrResume}
            idRoute={idRoute}
            reviewedSubmission={reviewedSubmission}
            submitDecision={submitDecision}
            isCoverLetterPresentInJobSubmissionId={isCoverLetterPresentInJobSubmissionId}
            isResumePresentInJobSubmissionId={isResumePresentInJobSubmissionId}
            setCoverLetterOrResume={setCoverLetterOrResume}
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
            <Toolbar setPdfScaleValue={(value) => setPdfScaleValue(value)} currentUser={currentUser} />
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
                    onSelection={undefined}
                    selectionTip={currentUser?.isEmployer ? <ExpandableTip addHighlight={(highlight, comment, sentiment, reason) => addHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, coverLetterOrResume, highlight), getHighlightByJobSubmissionId(idRoute, coverLetterOrResume), highlight, comment, sentiment, reason)} /> : undefined}
                    highlights={visibleHighlights}
                    style={{
                        height: "calc(100% - 41px)",
                    }}
                    >
                    <HighlightContainer
                        editHighlight={(idToUpdate, edit) => editHighlight((highlight) => setHighlightByJobSubmissionId(idRoute, coverLetterOrResume, highlight), getHighlightByJobSubmissionId(idRoute, coverLetterOrResume), idToUpdate, edit)}
                        onContextMenu={(event, highlight) => handleContextMenu(event, highlight, setContextMenu, (highlight) => setHighlightByJobSubmissionId(idRoute, coverLetterOrResume, highlight), getHighlightByJobSubmissionId(idRoute, coverLetterOrResume), highlighterUtilsRef)}
                    />
                </PdfHighlighter>
            )}
            </PdfLoader>
        </div>

        {currentUser?.isEmployer && contextMenu && <ContextMenu {...contextMenu} />}
        </div>
        {showQuestions ?
        <div id="questions">
            <FeedbackQuestions
                submission={getJobSubmission(idRoute)}
                isEmployer={currentUser?.isEmployer == true}
                askQuestion={(text, about) => askQuestion(idRoute, text, about)}
                replyToQuestion={(questionId, reply) => replyToQuestion(idRoute, questionId, reply)}
            />
        </div>
        : ""}
        </>
        
    );
};

export default JobSubmissionReview;
