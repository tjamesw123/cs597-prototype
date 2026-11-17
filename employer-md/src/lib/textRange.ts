import type { TextRange } from '../types';

/** Find the first occurrence of `quote` (single line) within document lines. */
export function rangeForQuote(lines: string[], quote: string): TextRange | null {
  for (let i = 0; i < lines.length; i++) {
    const idx = lines[i].indexOf(quote);
    if (idx >= 0) return { startLine: i, startOffset: idx, endLine: i, endOffset: idx + quote.length };
  }
  return null;
}

export function quoteFromRange(lines: string[], r: TextRange): string {
  if (r.startLine === r.endLine) return lines[r.startLine]?.slice(r.startOffset, r.endOffset) ?? '';
  const parts: string[] = [lines[r.startLine]?.slice(r.startOffset) ?? ''];
  for (let i = r.startLine + 1; i < r.endLine; i++) parts.push(lines[i] ?? '');
  parts.push(lines[r.endLine]?.slice(0, r.endOffset) ?? '');
  return parts.join(' ');
}

/** Portion [start,end) of line `i` covered by range, or null. */
export function coverageOnLine(r: TextRange, i: number, lineLength: number): [number, number] | null {
  if (i < r.startLine || i > r.endLine) return null;
  const start = i === r.startLine ? r.startOffset : 0;
  const end = i === r.endLine ? r.endOffset : lineLength;
  return end > start ? [start, end] : null;
}

export function rangesOverlap(a: TextRange, b: TextRange): boolean {
  const before = (l1: number, o1: number, l2: number, o2: number) => l1 < l2 || (l1 === l2 && o1 <= o2);
  // a ends before b starts, or b ends before a starts
  return !(before(a.endLine, a.endOffset, b.startLine, b.startOffset) || before(b.endLine, b.endOffset, a.startLine, a.startOffset));
}

/** Trim leading/trailing whitespace and bullet glyphs from a range. */
export function tidyRange(lines: string[], r: TextRange): TextRange | null {
  let { startLine, startOffset, endLine, endOffset } = r;
  const startText = lines[startLine] ?? '';
  while (startOffset < startText.length && /[\s•]/.test(startText[startOffset])) startOffset++;
  const endText = lines[endLine] ?? '';
  while (endOffset > 0 && /\s/.test(endText[endOffset - 1])) endOffset--;
  if (startLine === endLine && endOffset <= startOffset) return null;
  return { startLine, startOffset, endLine, endOffset };
}

/** Full meaningful text of a line (skipping the bullet glyph). */
export function wholeLineRange(lines: string[], i: number): TextRange | null {
  return tidyRange(lines, { startLine: i, startOffset: 0, endLine: i, endOffset: (lines[i] ?? '').length });
}

/** Convert a DOM Selection inside the document viewer into a line/offset range. */
export function selectionToRange(container: HTMLElement): TextRange | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;
  const pos = (node: Node, offset: number) => {
    const el = (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement)?.closest('[data-line]') as HTMLElement | null;
    if (!el) return null;
    const line = Number(el.dataset.line);
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(node, offset);
    return { line, offset: pre.toString().length };
  };
  let a = pos(range.startContainer, range.startOffset);
  let b = pos(range.endContainer, range.endOffset);
  // Selections that begin/end on non-line elements: snap to nearest line boundary.
  if (!a || !b) {
    const lineEls = Array.from(container.querySelectorAll<HTMLElement>('[data-line]')).filter((el) => range.intersectsNode(el));
    if (!lineEls.length) return null;
    const first = lineEls[0], last = lineEls[lineEls.length - 1];
    a = a ?? { line: Number(first.dataset.line), offset: 0 };
    b = b ?? { line: Number(last.dataset.line), offset: (last.textContent ?? '').length };
  }
  if (a.line > b.line || (a.line === b.line && a.offset > b.offset)) [a, b] = [b, a];
  return { startLine: a.line, startOffset: a.offset, endLine: b.line, endOffset: b.offset };
}
