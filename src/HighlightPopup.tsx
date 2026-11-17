// import React from "react";
import type { ViewportHighlight } from "react-pdf-highlighter-extended";

import "./style/HighlightPopup.css";
import { getSentiment, sentimentTagText, type CommentedHighlight } from "./types.ts";

interface HighlightPopupProps {
  highlight: ViewportHighlight<CommentedHighlight>;
}

const HighlightPopup = ({ highlight }: HighlightPopupProps) => {
  const tag = getSentiment(highlight.sentiment) ? <span className={"sentiment-tag s-" + highlight.sentiment}>{sentimentTagText(highlight)}</span> : null;
  return highlight.comment ? (
    <div className="Highlight__popup">{tag}{highlight.comment}</div>
  ) : (
    <div className="Highlight__popup">Comment has no Text</div>
  );
};

export default HighlightPopup;
