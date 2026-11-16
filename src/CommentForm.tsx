import { useState } from "react";
import { SENTIMENTS, type Sentiment } from "./types.ts";

interface CommentFormProps {
  onSubmit: (input: string, sentiment?: Sentiment) => void;
  placeHolder?: string;
  showSentiment?: boolean;
}

const CommentForm = ({ onSubmit, placeHolder, showSentiment }: CommentFormProps) => {
  const [input, setInput] = useState<string>("");
  const [sentiment, setSentiment] = useState<Sentiment>("positive");

  return (
    <form
      className="Tip__card"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(input, showSentiment ? sentiment : undefined);
      }}
    >
      {showSentiment && (
        <div className="sentiment-picker">
          {(Object.keys(SENTIMENTS) as Sentiment[]).map((key) => (
            <button
              type="button"
              key={key}
              className={"sentiment-option s-" + key + (sentiment == key ? " active" : "")}
              onClick={() => setSentiment(key)}
            >
              {SENTIMENTS[key].icon} {SENTIMENTS[key].label}
            </button>
          ))}
        </div>
      )}
      <div>
        <textarea
          placeholder={placeHolder}
          autoFocus
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
      </div>
      <div>
        <input type="submit" value="Save" />
      </div>
    </form>
  );
};

export default CommentForm;
