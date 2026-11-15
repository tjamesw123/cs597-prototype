import type { Highlight, Content } from "react-pdf-highlighter-extended";

export type Sentiment = "positive" | "confused" | "negative";

// Older saved comments have no sentiment, so it stays optional
export const SENTIMENTS: Record<Sentiment, { label: string; icon: string; color: string }> = {
  positive: { label: "Viewed Positively", icon: "👍", color: "rgba(26, 138, 85, 0.35)" },
  confused: { label: "Confused By", icon: "❓", color: "rgba(240, 150, 30, 0.4)" },
  negative: { label: "Did Not Like", icon: "👎", color: "rgba(220, 60, 60, 0.35)" },
};

export interface CommentedHighlight extends Highlight { // Expand this to potential include employer that highlighted
  content: Content;
  comment?: string;
  sentiment?: Sentiment;
}
