import type { Highlight } from "react-pdf-highlighter-extended";
import "./style/Sidebar.css";
import { Link } from "react-router";
import { DECISIONS, getSentiment, sentimentTagText, type CommentedHighlight } from "./types.ts";
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
  jobSubmissionList : JobSubmission[];
}

const updateHash = (highlight: Highlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

// {/* Description section */}
const FullDocumentReviewSidebar = ({
  highlights,
  // toggleDocument,
  getDocumentRec,
  getJob,
  coverLetterOrResume,
  idRoute,
  jobSubmissionList
}: FullDocumentReviewSidebarProps) => {
  // Every application this document was sent with
  const submissions = jobSubmissionList.filter((jobSubmission) =>
    coverLetterOrResume == "coverletter" ? jobSubmission.coverLetterId == idRoute : jobSubmission.resumeId == idRoute);
  return (
    <div className="fulldocumentreviewsidebar" style={{ width: "25vw", maxWidth: "500px" }}>
       
      <div className="description" style={{ padding: "1rem" }}>
      
      <>
        <h2 style={{ marginBottom: "1rem" }}>
          Document History
        </h2>
        <p>
          Feedback on this document from every application it was sent with
        </p>
        <p>
          Reviewing {coverLetterOrResume == "coverletter" ? "Cover Letter" : "Resume"}: 
        </p>
        <p>
          <b>File Name</b>: {getDocumentRec(idRoute).fileName}
        </p>
        <p>
          {getDocumentRec(idRoute).name != "" ? <><b>Name</b>: {getDocumentRec(idRoute).name}</> : ""}
        </p>
        <p><b>Submission History</b></p>
        {submissions.length != 0 ? (
          <ul className="submission-history">
            {submissions.map((jobSubmission) => (
              <li key={jobSubmission.id}>
                <Link to={"/applicant/submission/" + jobSubmission.id}>{getJob(jobSubmission.jobId).company} · {getJob(jobSubmission.jobId).position}</Link>
                <span>{jobSubmission.date} · {jobSubmission.reviewed ? (jobSubmission.decision ? DECISIONS[jobSubmission.decision].icon + " " + DECISIONS[jobSubmission.decision].label : "Reviewed") : "Pending Review"}</span>
              </li>
            ))}
          </ul>
        ) : <p>Not sent with any applications yet.</p>}
      </>
      </div>
      

      {/* Highlights list */}
      {highlights && (
        <ul className="fulldocumentreviewsidebar__highlights">
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className={"fulldocumentreviewsidebar__highlight" + (getSentiment(highlight.sentiment) ? " s-" + highlight.sentiment : "")}
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
