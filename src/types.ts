import type { Highlight, Content } from "react-pdf-highlighter-extended";

export interface CommentedHighlight extends Highlight { // Expand this to potential include employer that highlighted
  content: Content;
  comment?: string;
}
