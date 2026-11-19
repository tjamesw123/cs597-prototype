import type { Highlight, Content } from "react-pdf-highlighter-extended";

export type Sentiment = "positive" | "negative";

// Feedback is positive or negative with a predefined reason (Assignment 4, Task 4)
export const SENTIMENTS: Record<Sentiment, { label: string; icon: string; color: string; reasons: string[] }> = {
  positive: { label: "Positive", icon: "👍", color: "rgba(0, 114, 178, 0.30)",
    reasons: ["Strong impact", "Relevant skill", "Clear and specific", "Good formatting"] },
  negative: { label: "Negative", icon: "👎", color: "rgba(230, 120, 0, 0.38)",
    reasons: ["Too vague", "Missing measurable results", "Not relevant to the role", "Formatting issue", "Typo or grammar"] },
};

// Older saved comments may have no type or a type that no longer exists
export const getSentiment = (sentiment?: string) => sentiment && sentiment in SENTIMENTS ? SENTIMENTS[sentiment as Sentiment] : undefined;

// Small tag shown above a comment, e.g. "👎 Negative · Too vague"
export const sentimentTagText = (highlight: { sentiment?: string; reason?: string }) => {
  const info = getSentiment(highlight.sentiment);
  return info ? info.icon + " " + info.label + (highlight.reason ? " · " + highlight.reason : "") : "";
};

export type Decision = "strong" | "consider" | "notfit";

export const DECISIONS: Record<Decision, { label: string; icon: string; text: string; next: string }> = {
  strong: { label: "Strongly Consider", icon: "⭐", text: "We'd like to move forward with this applicant.",
    next: "The employer wants to move forward. Keep an eye out for them reaching out about next steps." },
  consider: { label: "Consider", icon: "🔍", text: "Promising, but some areas need work.",
    next: "You're on the right track. Look at the 👎 negative comments and update your documents before applying again." },
  notfit: { label: "Not a Fit", icon: "✖️", text: "Not the right match for this role.",
    next: "Not a match this time. Use the comments to improve your documents for your next application." },
};

// A follow-up question from the applicant about the feedback, with the employer's reply
export interface FeedbackQuestion {
  id : number;
  about? : string; // the highlighted text the question is about
  text : string;
  askedAt : string;
  reply? : string;
  repliedAt? : string;
}

export interface CommentedHighlight extends Highlight { // Expand this to potential include employer that highlighted
  content: Content;
  comment?: string;
  sentiment?: Sentiment;
  reason?: string;
}
