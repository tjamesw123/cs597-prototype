import React, { useState } from "react";
import { Link } from "react-router";
import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import { DECISIONS, SENTIMENTS, type CommentedHighlight, type Decision, type Sentiment } from "./types.ts";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, JobSubmission, Job } from "./App.tsx";

interface SidebarProps {
  highlights: Array<CommentedHighlight>;
  resetHighlights: () => void;
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
  getJobSubmission,
  getJob,
  getDocumentRec,
  coverLetterOrResume,
  idRoute,
  submitDecision,
}: SidebarProps) => {
  const [decisionStep, setDecisionStep] = useState<"closed" | "choose" | "sent">("closed");
  const [decision, setDecision] = useState<Decision | null>(null);
  const submission = getJobSubmission(idRoute);
  // Count comments on both the resume and the cover letter
  const allComments = [...submission.resumeCommentedHighlights, ...submission.coverLetterCommentedHighlights];
  const countOf = (sentiment: Sentiment) => allComments.filter((highlight) => highlight.sentiment == sentiment).length;

  let reviewing = coverLetterOrResume == "coverletter" ? getJobSubmission(idRoute).coverLetterId : getJobSubmission(idRoute).resumeId;
  if (reviewing == null) {
    reviewing = 0;
  } 
  const submissionInfo = <>
  <p>
    Reviewing {coverLetterOrResume == "coverletter" ? "Cover Letter" : "Resume"}: 
  </p>
  <p>
    <b>File Name</b>: {getDocumentRec(reviewing).fileName}
  </p>
  <p>
    {getDocumentRec(reviewing).name != "" ? <><b>Name</b>: {getDocumentRec(reviewing).name}</> : ""}
  </p>
  <p>
    <b>Company</b>: {getJob(getJobSubmission(idRoute).jobId).company}
  </p>
  <p>
    <b>Position</b>: {getJob(getJobSubmission(idRoute).jobId).position}
  </p>
  <p>
    <b>Date</b>: {getJobSubmission(idRoute).date}
  </p>
  <br></br>
  </>
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
          Review the feedback from the employer
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
              className={"sidebar__highlight" + (highlight.sentiment ? " s-" + highlight.sentiment : "")}
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                {/* Highlight comment and text */}
                {highlight.sentiment && (
                  <span className={"sentiment-tag s-" + highlight.sentiment}>
                    {SENTIMENTS[highlight.sentiment].icon} {SENTIMENTS[highlight.sentiment].label}
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

              {/* Highlight page number */}
              <div className="highlight__location">
                Page {highlight.position.boundingRect.pageNumber}
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
          <button onClick={resetHighlights} className="sidebar__reset">
            Reset highlights and all feedback
          </button>
        </div>
      )}

      
    </div>
  );
};

export default Sidebar;
