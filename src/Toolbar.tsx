import { useState } from "react";

import "./style/Toolbar.css";
import type { User } from "./LoginSignup";

interface ToolbarProps {
  setPdfScaleValue: (value: number) => void;
  currentUser: User | null;
}

const Toolbar = ({ setPdfScaleValue, currentUser}: ToolbarProps) => {
  const [zoom, setZoom] = useState<number | null>(null);

  const zoomIn = () => {
    if (zoom) {
      if (zoom < 4) {
        setPdfScaleValue(zoom + 0.1);
        setZoom(zoom + 0.1);
      }
    } else {
      setPdfScaleValue(1);
      setZoom(1);
    }
  };

  const zoomOut = () => {
    if (zoom) {
      if (zoom > 0.2) {
        setPdfScaleValue(zoom - 0.1);
        setZoom(zoom - 0.1);
      }
    } else {
      setPdfScaleValue(1);
      setZoom(1);
    }
  };

  return (
    <div className="Toolbar">
      <div className="ZoomControls">
        <span className="ZoomLabel">Zoom</span>
        <button title="Zoom out" aria-label="Zoom out" onClick={zoomOut}>−</button>
        <span className="ZoomValue">{zoom ? `${(zoom * 100).toFixed(0)}%` : "Auto"}</span>
        <button title="Zoom in" aria-label="Zoom in" onClick={zoomIn}>+</button>
      </div>
      {currentUser?.isEmployer ? 
      <span className="HighlightHint">Select any text on the document to add a comment</span>
      : ""}
    </div>
  );
};

export default Toolbar;
