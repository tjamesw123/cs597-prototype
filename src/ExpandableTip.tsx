import { useLayoutEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import {
  type GhostHighlight,
  type PdfSelection,
  usePdfHighlighterContext,
} from "react-pdf-highlighter-extended";
import "./style/ExpandableTip.css";
import type { Sentiment } from "./types.ts";

interface ExpandableTipProps {
  addHighlight: (highlight: GhostHighlight, comment: string, sentiment?: Sentiment) => void;
}

const ExpandableTip = ({ addHighlight }: ExpandableTipProps) => {
  const [compact, setCompact] = useState(true);
  const selectionRef = useRef<PdfSelection | null>(null);

  const {
    getCurrentSelection,
    removeGhostHighlight,
    setTip,
    updateTipPosition,
  } = usePdfHighlighterContext();

  useLayoutEffect(() => {
    updateTipPosition!();
  }, [compact]);

  return (
    <div className="Tip">
      {compact ? (
        <button
          className="Tip__compact"
          onClick={() => {
            setCompact(false);
            selectionRef.current = getCurrentSelection();
            selectionRef.current!.makeGhostHighlight();
          }}
        >
          Add highlight
        </button>
      ) : (
        <CommentForm
          placeHolder="Your comment..."
          showSentiment
          onSubmit={(input, sentiment) => {
            addHighlight(
              {
                content: selectionRef.current!.content,
                type: selectionRef.current!.type,
                position: selectionRef.current!.position,
              },
              input,
              sentiment,
            );

            removeGhostHighlight();
            setTip(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpandableTip;
