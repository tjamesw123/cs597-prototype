import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import type { CommentedHighlight } from "./types.ts";
import type { User } from "./LoginSignup.tsx";
import type { DocumentRec, JobSubmission, Job } from "./App.tsx";

interface FullDocumentReviewSidebarProps {
  highlights: Array<CommentedHighlight>;
  currentUser: User | null;
  getJobSubmission : (id : number) => JobSubmission;
  getJob : (id : number) => Job;
  getDocumentRec : (id : number) => DocumentRec;
  coverLetterOrResume : "coverletter" | "resume";
  idRoute : number;
  reviewedSubmission: (id : number) => void
}

const updateHash = (highlight: Highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

// {/* Description section */}
const FullDocumentReviewSidebar = ({
  highlights,
  // toggleDocument,
  getDocumentRec,
  coverLetterOrResume,
  idRoute
}: FullDocumentReviewSidebarProps) => {
  // let reviewing = coverLetterOrResume == "coverletter" ? getJobSubmission(idRoute).coverLetterId : getJobSubmission(idRoute).resumeId;
  // if (reviewing == null) {
  //   reviewing = 0;
  // } 
  return (
    <div className="fulldocumentreviewsidebar" style={{ width: "25vw", maxWidth: "500px" }}>
       
      <div className="description" style={{ padding: "1rem" }}>
      
      <>
        <h2 style={{ marginBottom: "1rem" }}>
          Applicant Review
        </h2>
        <p>
          Review the feedback on the document from all submissions
        </p>
        <p>
          Reviewing {coverLetterOrResume == "coverletter" ? "Cover Letter" : "Resume"}: {getDocumentRec(idRoute).fileName}
        </p>
      </>
      </div>
      

      {/* Highlights list */}
      {highlights && (
        <ul className="fulldocumentreviewsidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className="fulldocumentreviewsidebar__highlight"
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

      
    </div>
  );
};

export default FullDocumentReviewSidebar;
