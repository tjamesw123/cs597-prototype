import type { Highlight, Content } from "react-pdf-highlighter-extended";

export type Sentiment = "positive" | "confused" | "negative";

// Older saved comments have no sentiment, so it stays optional
export const SENTIMENTS: Record<Sentiment, { label: string; icon: string; color: string }> = {
  positive: { label: "Viewed Positively", icon: "👍", color: "rgba(26, 138, 85, 0.35)" },
  confused: { label: "Confused By", icon: "❓", color: "rgba(240, 150, 30, 0.4)" },
  negative: { label: "Did Not Like", icon: "👎", color: "rgba(220, 60, 60, 0.35)" },
};

export type Decision = "strong" | "consider" | "notfit";

export const DECISIONS: Record<Decision, { label: string; icon: string; text: string; next: string }> = {
  strong: { label: "Strongly Consider", icon: "🟢", text: "We'd like to move forward with this applicant.",
    next: "The employer wants to move forward. Keep an eye out for them reaching out about next steps." },
  consider: { label: "Consider", icon: "🟡", text: "Promising, but some areas need work.",
    next: "You're on the right track. Look at the ❓ and 👎 comments and update your documents before applying again." },
  notfit: { label: "Not a Fit", icon: "🔴", text: "Not the right match for this role.",
    next: "Not a match this time. Use the comments to improve your documents for your next application." },
};

export interface CommentedHighlight extends Highlight { // Expand this to potential include employer that highlighted
  content: Content;
  comment?: string;
  sentiment?: Sentiment;
}
