import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import { DECISIONS, SENTIMENTS, getSentiment, sentimentTagText, type CommentedHighlight, type Decision, type Sentiment } from "./types.ts";
import { readUsers, type User } from "./LoginSignup.tsx";
import type { DocumentRec, JobSubmission, Job } from "./App.tsx";

interface SidebarProps {
  highlights: Array<CommentedHighlight>;
  resetHighlights: () => void;
  // Every comment on the open document (used so delete can be undone)
  allHighlights?: Array<CommentedHighlight>;
  setAllHighlights?: (highlights: Array<CommentedHighlight>) => void;
  currentUser: User | null, // make this an id as then I can reference the user directly through a function
  // documentList: DocumentRec[],
  // jobSubmissionList: JobSubmission[],
  // jobList: Job[],
  getJobSubmission : (id : number) => JobSubmission;
  getJob : (id : number) => Job;
  getDocumentRec : (id : number) => DocumentRec;
  coverLetterOrResume : "coverletter" | "resume";
  idRoute : number;

  reviewedSubmission: (id : number) => void;
  submitDecision: (id : number, decision : Decision) => void;
  isResumePresentInJobSubmissionId: (id: number) => boolean;
  isCoverLetterPresentInJobSubmissionId: (id: number) => boolean;
  setCoverLetterOrResume: React.Dispatch<React.SetStateAction<"coverletter" | "resume">>;
}

const updateHash = (highlight: Highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

// {/* Description section */}
const Sidebar = ({
  highlights,
  // toggleDocument,
  currentUser,
  resetHighlights,
  allHighlights,
  setAllHighlights,
  getJobSubmission,
  getJob,
  getDocumentRec,
  coverLetterOrResume,
  idRoute,
  submitDecision,
}: SidebarProps) => {
  const [decisionStep, setDecisionStep] = useState<"closed" | "choose" | "sent">("closed");
  const [decision, setDecision] = useState<Decision | null>(null);
  // Deleting is instant and can be undone (better than an "Are you sure?" pop-up)
  const [undo, setUndo] = useState<{ message: string; snapshot: CommentedHighlight[] } | null>(null);
  const canEdit = currentUser?.isEmployer && allHighlights != undefined && setAllHighlights != undefined;

  useEffect(() => {
    if (undo == null) {
      return;
    }
    const timer = window.setTimeout(() => setUndo(null), 8000);
    return () => window.clearTimeout(timer);
  }, [undo]);

  // An undo only applies to the document it came from
  useEffect(() => {
    setUndo(null);
  }, [coverLetterOrResume, idRoute]);

  const removeComment = (highlight: CommentedHighlight) => {
    if (!canEdit) {
      return;
    }
    setUndo({ message: "Comment deleted", snapshot: allHighlights! });
    setAllHighlights!(allHighlights!.filter((item) => item.id != highlight.id));
  };

  const clearAllComments = () => {
    if (!canEdit) {
      resetHighlights();
      return;
    }
    const count = allHighlights!.length;
    setUndo({ message: count + (count == 1 ? " comment" : " comments") + " cleared from this " + (coverLetterOrResume == "coverletter" ? "cover letter" : "resume"), snapshot: allHighlights! });
    resetHighlights();
  };
  const submission = getJobSubmission(idRoute);
  // Count comments on both the resume and the cover letter
  const allComments = [...submission.resumeCommentedHighlights, ...submission.coverLetterCommentedHighlights];
  const countOf = (sentiment: Sentiment) => allComments.filter((highlight) => highlight.sentiment == sentiment).length;

  let reviewing = coverLetterOrResume == "coverletter" ? getJobSubmission(idRoute).coverLetterId : getJobSubmission(idRoute).resumeId;
  if (reviewing == null) {
    reviewing = 0;
  } 
  const users = readUsers();
  const applicant = users.find((user) => user.id == submission.userId);
  const job = getJob(submission.jobId);
  const documentRec = getDocumentRec(reviewing);
  const submissionInfo = <div className="submission-info">
    {currentUser?.isEmployer ? (
      <div className="si-applicant">
        <span className="applicant-avatar" aria-hidden="true">{applicant ? (applicant.first_name.charAt(0) + applicant.last_name.charAt(0)).toUpperCase() : "?"}</span>
        <div>
          <b>{applicant ? applicant.first_name + " " + applicant.last_name : "Unknown applicant"}</b>
          {applicant ? <small>{applicant.username}</small> : ""}
        </div>
      </div>
    ) : ""}
    <div className="si-job">{job.position}</div>
    <div className="si-meta">{job.company} · Applied {submission.date}</div>
    <div className="si-doc">
      <span>{coverLetterOrResume == "coverletter" ? "Cover letter" : "Resume"}</span>
      {documentRec.name != "" ? documentRec.name : documentRec.fileName}
    </div>
  </div>
  return (
    <div className="sidebar" style={{ width: "25vw", maxWidth: "500px" }}>
       
      <div className="description" style={{ padding: "1rem" }}>
      {currentUser?.isEmployer == true ? 
      <>
        <h2 style={{ marginBottom: "1rem" }}>
          Employer Review
        </h2>
        {submissionInfo}
        <p>
          Comment with quick comments on the applicant's resume to tell them what they could do better and what they did well.
        </p>
          <br></br>
        <p>
          When you are done commenting, continue to give an overall decision.
        </p>
        {submission.reviewed && (
          <p className="decision-sent">
            {submission.decision ? <>Decision sent: <b>{DECISIONS[submission.decision].icon} {DECISIONS[submission.decision].label}</b></> : <b>Marked as reviewed</b>}
          </p>
        )}
        <div style={{ padding: "0.5rem" }}>
          <button onClick={() => { setDecision(submission.decision ?? null); setDecisionStep("choose"); }} className="sidebar__toggle">
            {submission.reviewed ? "Change overall decision" : "Continue to Overall Decision →"}
          </button>
        </div>
        <p>
          <small>
            To create an area highlight hold ⌥ Option key (Alt), then click and
            drag.
          </small>
        </p>
      </>
      : 
      <>
        <h2 style={{ marginBottom: "1rem" }}>
          Applicant Review
        </h2>
        {submissionInfo}
        <p>
          {getJobSubmission(idRoute).reviewed ? "Review the feedback from the employer" : "The employer hasn't sent feedback yet. Check back later."}
        </p>
      </>
      }
      </div>
      

      {/* Highlights list */}
      {highlights && (
        <ul className="sidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className={"sidebar__highlight" + (getSentiment(highlight.sentiment) ? " s-" + highlight.sentiment : "")}
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                {/* Highlight comment and text */}
                {getSentiment(highlight.sentiment) && (
                  <span className={"sentiment-tag s-" + highlight.sentiment}>
                    {sentimentTagText(highlight)}
                  </span>
                )}
                <strong>{highlight.comment}</strong>
                {highlight.content.text && (
                  <blockquote style={{ marginTop: "0.5rem" }}>
                    {`${highlight.content.text.slice(0, 90).trim()}…`}
                  </blockquote>
                )}

                {/* Highlight image */}
                {highlight.content.image && (
                  <div
                    className="highlight__image__container"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <img
                      src={highlight.content.image}
                      alt={"Screenshot"}
                      className="highlight__image"
                    />
                  </div>
                )}
              </div>

              {/* Highlight page number, and delete for the employer */}
              <div className="highlight__footer">
                <span className="highlight__location">Page {highlight.position.boundingRect.pageNumber}</span>
                {canEdit ? (
                  <button
                    type="button"
                    className="comment-delete"
                    aria-label="Delete this comment"
                    title="Delete this comment"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeComment(highlight);
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
                    Delete
                  </button>
                ) : ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      {decisionStep != "closed" && (
        <div className="decision-overlay" onClick={() => decisionStep == "choose" && setDecisionStep("closed")}>
          <div className="decision-card" onClick={(event) => event.stopPropagation()}>
            {decisionStep == "choose" ? (
              <>
                <h2>Overall decision</h2>
                <p className="decision-summary">
                  You left {allComments.length} {allComments.length == 1 ? "comment" : "comments"}:
                  {(Object.keys(SENTIMENTS) as Sentiment[]).filter((key) => countOf(key) > 0).map((key) => (
                    <span key={key} className={"sentiment-tag s-" + key}>{SENTIMENTS[key].icon} {countOf(key)} {SENTIMENTS[key].label}</span>
                  ))}
                </p>
                <div className="decision-options">
                  {(Object.keys(DECISIONS) as Decision[]).map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={"decision-option d-" + key + (decision == key ? " active" : "")}
                      onClick={() => setDecision(key)}
                    >
                      <b>{DECISIONS[key].icon} {DECISIONS[key].label}</b>
                      <span>{DECISIONS[key].text}</span>
                    </button>
                  ))}
                </div>
                <div className="decision-actions">
                  <button type="button" className="decision-cancel" onClick={() => setDecisionStep("closed")}>Back to comments</button>
                  <button
                    type="button"
                    disabled={decision == null}
                    onClick={() => {
                      if (decision != null) {
                        submitDecision(idRoute, decision);
                        setDecisionStep("sent");
                      }
                    }}
                  >
                    Send feedback
                  </button>
                </div>
              </>
            ) : (
              <div className="decision-done">
                <div className="decision-check">✅</div>
                <h2>Feedback sent!</h2>
                <p>The applicant can now see your {allComments.length} {allComments.length == 1 ? "comment" : "comments"} and your decision: <b>{decision ? DECISIONS[decision].label : ""}</b>.</p>
                <div className="decision-actions">
                  <button type="button" className="decision-cancel" onClick={() => setDecisionStep("closed")}>Stay on this page</button>
                  <Link className="btn primary" to="/employer/applications/">Back to Applications</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentUser?.isEmployer && highlights && highlights.length > 0 && (
        <div style={{ padding: "0.5rem" }}>
          <button onClick={clearAllComments} className="sidebar__reset">
            Clear all comments on this {coverLetterOrResume == "coverletter" ? "cover letter" : "resume"}
          </button>
        </div>
      )}

      {undo != null ? (
        <div className="undo-bar" role="status">
          <span>{undo.message}</span>
          <button type="button" onClick={() => {
            setAllHighlights!(undo.snapshot);
            setUndo(null);
          }}>Undo</button>
        </div>
      ) : ""}
    </div>
  );
};

export default Sidebar;
