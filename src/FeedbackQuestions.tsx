import { useState } from "react";
import "./style/App.css";
import { sentimentTagText, type CommentedHighlight } from "./types.ts";
import type { JobSubmission } from "./App.tsx";

interface FeedbackQuestionsProps {
    submission : JobSubmission;
    isEmployer : boolean;
    askQuestion : (text : string, about? : string) => void;
    replyToQuestion : (questionId : number, reply : string) => void;
}

// Applicant asks about the feedback, employer replies (Assignment 4 "Feedback Detail" screen)
const FeedbackQuestions = ({submission, isEmployer, askQuestion, replyToQuestion} : FeedbackQuestionsProps) => {
    const [question, setQuestion] = useState<string>("");
    const [about, setAbout] = useState<string>("");
    const [replies, setReplies] = useState<Record<number, string>>({});
    const questions = submission.questions ?? [];
    const comments : CommentedHighlight[] = [...submission.resumeCommentedHighlights, ...submission.coverLetterCommentedHighlights]
        .filter((highlight) => highlight.content.text);
    const shorten = (text : string) => text.length > 60 ? text.slice(0, 60) + "..." : text;

    return (
        <div className="questions">
            <h2>Questions about this feedback</h2>
            {questions.length == 0 ? <p className="questions-empty">{isEmployer ? "The applicant hasn't asked any questions." : "Not sure what a comment means? Ask the employer below."}</p> : ""}
            {questions.map((item) => (
                <div key={item.id} className={"question-card" + (item.reply ? " answered" : "")}>
                    <div className="question-meta">{isEmployer ? "Applicant asked" : "You asked"} · {item.askedAt}</div>
                    {item.about ? <div className="question-about">About: “{shorten(item.about)}”</div> : ""}
                    <div className="question-text">{item.text}</div>
                    {item.reply ? (
                        <div className="question-reply"><b>{isEmployer ? "Your reply" : "Employer replied"} · {item.repliedAt}</b><span>{item.reply}</span></div>
                    ) : isEmployer ? (
                        <form className="question-form" onSubmit={(e) => {
                            e.preventDefault();
                            if ((replies[item.id] ?? "").trim() != "") {
                                replyToQuestion(item.id, replies[item.id].trim());
                            }
                        }}>
                            <textarea placeholder="Write a reply..." value={replies[item.id] ?? ""} onInput={(e) => setReplies({...replies, [item.id]: e.currentTarget.value})} />
                            <button className="btn primary" type="submit" disabled={(replies[item.id] ?? "").trim() == ""}>Send reply</button>
                        </form>
                    ) : (
                        <div className="question-waiting">Waiting for the employer to reply</div>
                    )}
                </div>
            ))}
            {!isEmployer ? (
                <form className="question-form" onSubmit={(e) => {
                    e.preventDefault();
                    if (question.trim() != "") {
                        askQuestion(question.trim(), about != "" ? about : undefined);
                        setQuestion("");
                        setAbout("");
                    }
                }}>
                    <label>About
                        <select value={about} onChange={(e) => setAbout(e.target.value)}>
                            <option value="">The feedback in general</option>
                            {comments.map((highlight) => (
                                <option key={highlight.id} value={highlight.content.text}>{sentimentTagText(highlight) != "" ? sentimentTagText(highlight) + ": " : ""}{shorten(highlight.content.text ?? "")}</option>
                            ))}
                        </select>
                    </label>
                    <textarea placeholder="Your question for the employer..." value={question} onInput={(e) => setQuestion(e.currentTarget.value)} />
                    <button className="btn primary" type="submit" disabled={question.trim() == ""}>Ask the employer</button>
                </form>
            ) : ""}
        </div>
    );
};

export default FeedbackQuestions;
