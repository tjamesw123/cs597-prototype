import React from "react";
import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import type { CommentedHighlight } from "./types.ts";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, JobSubmission, Job } from "./App.tsx";

interface SidebarProps {
  highlights: Array<CommentedHighlight>;
  resetHighlights: () => void;
  currentUser: User | null, // make this an id as then I can reference the user directly through a function
  // documentList: DocumentRec[],
  // jobSubmissionList: JobSubmission[],
  // jobList: Job[],
  idRoute : number,
  reviewedSubmission: (id : number) => void

  // toggleDocument: () => void;
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
  idRoute,
  reviewedSubmission
}: SidebarProps) => {
  return (
    <div className="sidebar" style={{ width: "25vw", maxWidth: "500px" }}>
       
      <div className="description" style={{ padding: "1rem" }}>
      {currentUser?.isEmployer == true ? 
      <>
        <h2 style={{ marginBottom: "1rem" }}>
          Employer Review
        </h2>
        <p>
          Comment with quick comments on the applicant's resume to tell them what they could do better and what they did well.
        </p>
          <br></br>
        <p>
          Press the submit button once you are done with feedback
        </p>
        {/* You can see this as an employer */}
        <div style={{ padding: "0.5rem" }}>
          <button onClick={() => reviewedSubmission(idRoute)} className="sidebar__toggle">
            Mark as reviewed to the applicant
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
              className="sidebar__highlight"
              onClick={() => {
                updateHash(highlight);
              }}
            >
              <div>
                {/* Highlight comment and text */}
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

      {/* Change to either not be visible or a different button 
      <div style={{ padding: "0.5rem" }}>
        <button onClick={toggleDocument} className="sidebar__toggle">
          Toggle PDF document
        </button>
      </div> */}

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
