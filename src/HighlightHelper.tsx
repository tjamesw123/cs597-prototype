import React, { type MouseEvent } from "react";
import CommentForm from "./CommentForm";
import { type ContextMenuProps } from "./ContextMenu";
import {
  type GhostHighlight,
  type Highlight,
  type PdfHighlighterUtils,
  type Tip,
  type ViewportHighlight
} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import type { CommentedHighlight, Sentiment } from "./types.ts";

const getNextId = () => String(Math.random()).slice(2);

export const parseIdFromHash = () => {
  return document.location.hash.slice("#highlight-".length);
};

export const resetHash = () => {
  document.location.hash = "";
};

export const handleContextMenu = (
    event: MouseEvent<HTMLDivElement>,
    highlight: ViewportHighlight<CommentedHighlight>,
    setContextMenu : React.Dispatch<React.SetStateAction<ContextMenuProps | null>>,
    setHighlights: (highlight : CommentedHighlight[]) => void, 
    highlights: CommentedHighlight[],
    highlighterUtilsRef: React.MutableRefObject<PdfHighlighterUtils | undefined>
  ) => {
    event.preventDefault();

    setContextMenu({
      xPos: event.clientX,
      yPos: event.clientY,
      deleteHighlight: () => deleteHighlight(setHighlights, highlights, highlight),
      editComment: () => editComment(setHighlights, highlights, highlight, highlighterUtilsRef),
    });
  };

  export const addHighlight = (setHighlights: (highlight : CommentedHighlight[]) => void, highlights: CommentedHighlight[], highlight: GhostHighlight, comment: string, sentiment?: Sentiment, reason?: string) => {
    // Check here if they are the employer reviewer and if they are they can add highlights and if not don't
    console.log("Saving highlight", highlight);
    setHighlights([{ ...highlight, comment, ...(sentiment ? { sentiment } : {}), ...(reason ? { reason } : {}), id: getNextId() }, ...highlights]);
  };

  export const deleteHighlight = (setHighlights: (highlight : CommentedHighlight[]) => void, highlights: CommentedHighlight[], highlight: ViewportHighlight | Highlight) => {
    console.log("Deleting highlight", highlight);
    setHighlights(highlights.filter((h) => h.id != highlight.id));
  };

  export const editHighlight = (
    setHighlights: (highlight : CommentedHighlight[]) => void, 
    highlights: CommentedHighlight[],
    idToUpdate: string,
    edit: Partial<CommentedHighlight>,
  ) => {
    // Check here if they are the employer reviewer and if they are they can edit highlights and if not don't
    console.log(`Editing highlight ${idToUpdate} with `, edit);
    setHighlights(
      highlights.map((highlight) =>
        highlight.id === idToUpdate ? { ...highlight, ...edit } : highlight,
      ),
    );
  };

  export const resetHighlights = (setHighlights: (highlight : CommentedHighlight[]) => void ) => {
    setHighlights([]);
  };

  export const getHighlightById = (id: string, highlights: CommentedHighlight[]) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  // Open comment tip and update highlight with new user input
  export const editComment = (
    setHighlights: (highlight : CommentedHighlight[]) => void, 
    highlights: CommentedHighlight[], 
    highlight: ViewportHighlight<CommentedHighlight>, highlighterUtilsRef: React.MutableRefObject<PdfHighlighterUtils | undefined>) => {
    if (!highlighterUtilsRef.current) return;

    const editCommentTip: Tip = {
      position: highlight.position,
      content: (
        <CommentForm
          placeHolder={highlight.comment}
          onSubmit={(input) => {
            editHighlight(setHighlights, highlights, highlight.id, { comment: input });
            highlighterUtilsRef.current!.setTip(null);
            highlighterUtilsRef.current!.toggleEditInProgress(false);
          }}
        ></CommentForm>
      ),
    };

    highlighterUtilsRef.current.setTip(editCommentTip);
    highlighterUtilsRef.current.toggleEditInProgress(true);
  };

  // Scroll to highlight based on hash in the URL
  export const scrollToHighlightFromHash = (highlights: CommentedHighlight[], highlighterUtilsRef: React.MutableRefObject<PdfHighlighterUtils | undefined>) => {
    const highlight = getHighlightById(parseIdFromHash(), highlights);

    if (highlight && highlighterUtilsRef.current) {
      highlighterUtilsRef.current.scrollToHighlight(highlight);
    }
  };