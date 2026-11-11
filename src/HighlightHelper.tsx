import React, { type MouseEvent, useEffect, useRef, useState } from "react";
import CommentForm from "./CommentForm";
import ContextMenu, { type ContextMenuProps } from "./ContextMenu";
import ExpandableTip from "./ExpandableTip";
import HighlightContainer from "./HighlightContainer";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import {
  type GhostHighlight,
  type Highlight,
  PdfHighlighter,
  type PdfHighlighterUtils,
  PdfLoader,
  type Tip,
  type ViewportHighlight
} from "react-pdf-highlighter-extended";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import type { CommentedHighlight } from "./types.ts";
import { Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";

const getNextId = () => String(Math.random()).slice(2);

// // // Refs for PdfHighlighter utilities
// const highlighterUtilsRef = useRef<PdfHighlighterUtils>();

// urls: string[],

// // Convert into toggleDocument into switvch
// export const toggleDocument = (
//     currentPdfIndexRef: React.MutableRefObject<number>, 
//     setUrl: React.Dispatch<React.SetStateAction<string>>, 
//     setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>) => {
//     const urls = [PRIMARY_PDF_URL, SECONDARY_PDF_URL];
//     currentPdfIndexRef.current = (currentPdfIndexRef.current + 1) % urls.length;
//     setUrl(urls[currentPdfIndexRef.current]);
//     setHighlights(TEST_HIGHLIGHTS[urls[currentPdfIndexRef.current]] ?? []);
// };

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
    setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>, 
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

  export const addHighlight = (setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>, highlights: CommentedHighlight[], highlight: GhostHighlight, comment: string) => {
    // Check here if they are the employer reviewer and if they are they can add highlights and if not don't
    console.log("Saving highlight", highlight);
    setHighlights([{ ...highlight, comment, id: getNextId() }, ...highlights]);
  };

  export const deleteHighlight = (setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>, highlights: CommentedHighlight[], highlight: ViewportHighlight | Highlight) => {
    console.log("Deleting highlight", highlight);
    setHighlights(highlights.filter((h) => h.id != highlight.id));
  };

  export const editHighlight = (
    setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>, 
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

  export const resetHighlights = (setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>) => {
    setHighlights([]);
  };

  export const getHighlightById = (id: string, highlights: CommentedHighlight[]) => {
    return highlights.find((highlight) => highlight.id === id);
  };

  // Open comment tip and update highlight with new user input
  export const editComment = (
    setHighlights: React.Dispatch<React.SetStateAction<CommentedHighlight[]>>, 
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