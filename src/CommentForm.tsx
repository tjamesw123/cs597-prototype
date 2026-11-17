import { useState } from "react";
import { SENTIMENTS, type Sentiment } from "./types.ts";

interface CommentFormProps {
  onSubmit: (input: string, sentiment?: Sentiment, reason?: string) => void;
  placeHolder?: string;
  showSentiment?: boolean;
}

const CommentForm = ({ onSubmit, placeHolder, showSentiment }: CommentFormProps) => {
  const [input, setInput] = useState<string>("");
  const [sentiment, setSentiment] = useState<Sentiment>("positive");
  const [reason, setReason] = useState<string>("");

  return (
    <form
      className="Tip__card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(input, showSentiment ? sentiment : undefined, showSentiment ? reason : undefined);
      }}
    >
      {showSentiment && (
        <>
          <div className="sentiment-picker">
            {(Object.keys(SENTIMENTS) as Sentiment[]).map((key) => (
              <button
                type="button"
                key={key}
                className={"sentiment-option s-" + key + (sentiment == key ? " active" : "")}
                onClick={() => { setSentiment(key); setReason(""); }}
              >
                {SENTIMENTS[key].icon} {SENTIMENTS[key].label}
              </button>
            ))}
          </div>
          {/* Predefined reasons so the employer doesn't have to write everything */}
          <div className="reason-picker">
            {SENTIMENTS[sentiment].reasons.map((option) => (
              <button
                type="button"
                key={option}
                className={"reason-option" + (reason == option ? " active" : "")}
                onClick={() => setReason(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
      <div>
        <textarea
          placeholder={showSentiment ? "Optional explanation..." : placeHolder}
          autoFocus
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </div>
      <div>
        <input type="submit" value="Save" disabled={showSentiment && reason == ""} title={showSentiment && reason == "" ? "Pick a reason first" : undefined} />
      </div>
    </form>
  );
};

export default CommentForm;
