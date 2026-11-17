# Employer.MD

A two-sided job application and **human resume-feedback** platform, built as an interactive frontend prototype for an HCI course.

Employers highlight specific parts of a submitted resume, attach structured feedback (category + predefined reason + optional explanation) and send an overall evaluation. Applicants read that feedback pinned to the exact text it refers to, and track every resume version they've submitted over time.

> **Prototype notice.** All people, companies, jobs and feedback are fictional sample data. Nothing is sent to a server, real employer, job platform or email service. Data lives only in your browser.

---

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 18 + Vite 6 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (design tokens in `src/index.css`) |
| Routing | React Router 6 (`HashRouter`, so the build works on any static host) |
| Icons | Lucide React |
| PDF | PDF.js (`pdfjs-dist`) for text extraction and page rendering |
| Persistence | `localStorage` (app state) + IndexedDB (uploaded PDF bytes) |
| Font | Inter (self-hosted via `@fontsource/inter`) |

Recharts was not needed: dashboards use stat cards and lists, which communicate the counts more directly than charts at this data size.

## Getting started

Requires **Node.js 18+**.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run typecheck  # TypeScript only
npm run generate:pdfs   # regenerate public/samples/*.pdf (needs: pip install reportlab)
```

## Demo walkthrough (the 25-step scenario)

Open the app and use the **Continue as Maya / Continue as Dana** buttons. Switch accounts at any time with the button at the bottom of the sidebar.

**As Maya (applicant)**
1. Open Employer.MD → **Continue as Maya — Applicant**.
2. **Resumes & Cover Letters** → click **Use sample resume** (or **Choose PDF** and pick `public/samples/maya-shah-resume-office.pdf`) → **Upload Resume**. Text is extracted from the PDF so employers can highlight it.
3. **Browse Jobs** → search "Office Intern" → **View details** → **Apply**.
4. Your newest resume is pre-selected; optionally add a cover letter → **Review application** → **Submit application**.
5. **View My Applications** — the new row shows status **Submitted** and employer review **Awaiting review**.

**As Dana (employer)**
6. Sidebar → **Switch to Dana (Employer)** → **Review Pending Applications** → **Review** on Maya Shah.
7. Drag to select *"Helped with various office tasks and supported the team with daily operations."* (keyboard: Tab to the line and press **Enter**).
8. Choose **Areas for Improvement** → **Too vague** → add a suggestion about measurable details → **Save comment**. The panel shows **"Comment saved — not sent yet."**
9. **Continue to Overall Decision** → **Strongly Consider** → **Send Feedback and Decision** → confirm.
10. The confirmation shows Maya's name, the decision and the number of comments sent.

**Back as Maya**
11. **Switch to Maya** → **My Applications** → **View feedback (1)** on the Office Intern row.
12. Click the highlighted resume text (or its numbered marker) to activate the matching comment; click a comment to jump to its highlight.
13. **Open in Document History** to see the exact resume version used for that application and the feedback it received.

**Reset Demo Data** (sidebar) restores all sample data and removes uploaded PDFs. Two browser tabs (one Maya, one Dana) stay in sync automatically.

## Key design decisions (from the HCI research)

- **Evaluation ≠ status.** Employer evaluations (Strongly Consider / Consider / Unlikely / Reject) are kept separate from application status (Submitted / Under Review / Interview Invited / Rejected / Closed). Every evaluation is shown with a plain-language explanation and an explicit "Action required?" answer, so wording like "Strongly Consider" is never mistaken for an interview invitation.
- **Drafts are private.** Comments stay in draft (labelled "Draft — not sent") until the employer explicitly sends the decision after a confirmation dialog. Sent feedback is read-only.
- **Exact versions.** Every application references the specific `DocumentVersion` submitted; every annotation references an application, a document version and a text range. Feedback is never mixed across versions — including in the side-by-side comparison view.
- **Human-centered.** No AI scoring or rankings. Feedback reasons are editable defaults (Candidate Review → *Edit reasons*, or add a custom reason inline).
- **Accessibility.** Visible focus rings, skip link, keyboard text selection, focus-trapped dialogs, labelled controls, `aria-live` updates, and status badges that always pair colour with an icon and text. Respects `prefers-reduced-motion`.

## Project structure

```
src/
  App.tsx                     Routes + role guards
  types.ts                    Domain model (User, Job, Document, DocumentVersion,
                              Application, FeedbackAnnotation, EmployerEvaluation)
  state/store.tsx             Shared store + actions (mock service layer) + selectors
  services/pdf.ts             PDF validation, text-line extraction, loading
  services/fileStore.ts       IndexedDB storage for uploaded PDFs
  data/seed.ts                Sample users, jobs, versions, applications, feedback
  data/sampleDocuments.json   Text of every sample PDF (single source of truth)
  lib/                        Labels/explanations, text ranges, formatting
  components/
    ui.tsx                    Button, Badge, Card, Modal, ConfirmDialog, Segmented, …
    Layout.tsx                Sidebar / mobile navigation shell
    DocumentViewer.tsx        Highlightable text view + original PDF view
    FeedbackCard.tsx          Feedback item
    Toast.tsx
  pages/
    Welcome.tsx
    applicant/  Dashboard, Documents, BrowseJobs, JobDetail, Apply,
                MyApplications, Feedback, DocumentHistory
    employer/   Dashboard, Applications, CandidateReview, OverallDecision,
                FeedbackSent, ReviewHistory
public/samples/               Generated sample PDFs
scripts/generate_sample_pdfs.py
```

### How highlighting works

When a PDF is uploaded, PDF.js extracts its text and groups it into visual lines. Those lines are saved with the `DocumentVersion`. The **Highlights view** renders the lines; a text selection is converted into a `{startLine, startOffset, endLine, endOffset}` range, so a highlight always maps to the same characters of the same version. The **Original PDF** tab renders the untouched file with PDF.js. Scanned (image-only) PDFs are rejected with an explanation, because they have no selectable text to annotate.

### Connecting a real backend

All reads and writes go through the actions in `src/state/store.tsx`. Replace those action bodies with API calls (and the `fileStore` service with object storage) — components don't need to change.

## Limitations

- Authentication is simulated; the login form only recognises the two demo emails, and sign-up does not create accounts.
- Data is per-browser. Clearing site data removes uploads; the extracted text and highlights survive in `localStorage` until reset.
- Employers annotate the resume; cover letters are viewable but not annotatable in this version.
