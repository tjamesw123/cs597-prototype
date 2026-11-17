import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { FileSource } from '../types';
import { getFile } from './fileStore';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

export async function validatePdf(file: File): Promise<string | null> {
  const nameOk = file.name.toLowerCase().endsWith('.pdf');
  const typeOk = file.type === 'application/pdf' || file.type === '';
  if (!nameOk || !typeOk) return `“${file.name}” is not a PDF. Please choose a file ending in .pdf.`;
  if (file.size === 0) return 'This file is empty. Please choose another PDF.';
  if (file.size > MAX_PDF_BYTES) return `This PDF is ${(file.size / 1048576).toFixed(1)} MB. The limit is 5 MB.`;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...head) !== '%PDF-') return 'This file has a .pdf name but is not a valid PDF document.';
  return null;
}

type TextItem = { str: string; transform: number[]; width: number; height: number };

/** Extract visual text lines (top-to-bottom, left-to-right) from every page. */
export async function extractLines(data: ArrayBuffer): Promise<{ lines: string[]; pages: number }> {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data) }).promise;
  const out: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = (content.items as unknown[]).filter((i): i is TextItem => typeof (i as TextItem).str === 'string' && (i as TextItem).str.trim() !== '');
    const rows: { y: number; items: TextItem[] }[] = [];
    for (const it of items) {
      const y = it.transform[5];
      const tol = Math.max(2, (it.height || 10) * 0.4);
      const row = rows.find((r) => Math.abs(r.y - y) <= tol);
      if (row) row.items.push(it); else rows.push({ y, items: [it] });
    }
    rows.sort((a, b) => b.y - a.y);
    for (const row of rows) {
      row.items.sort((a, b) => a.transform[4] - b.transform[4]);
      let line = '';
      let lastEnd: number | null = null;
      for (const it of row.items) {
        const x = it.transform[4];
        if (lastEnd !== null && x - lastEnd > 1.5 && !line.endsWith(' ') && !it.str.startsWith(' ')) line += ' ';
        line += it.str;
        lastEnd = x + it.width;
      }
      const clean = line.replace(/\s+/g, ' ').trim();
      if (clean) out.push(clean);
    }
  }
  const pages = doc.numPages;
  await doc.destroy();
  return { lines: out, pages };
}

export async function loadPdfBytes(source: FileSource): Promise<ArrayBuffer | null> {
  if (source.type === 'sample') {
    const res = await fetch(source.url);
    return res.ok ? res.arrayBuffer() : null;
  }
  const blob = await getFile(source.blobKey);
  return blob ? blob.arrayBuffer() : null;
}

export { pdfjs };
