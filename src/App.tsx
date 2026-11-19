import React from "react";
import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import type { CommentedHighlight, Decision, FeedbackQuestion } from "./types.ts";
import { Link, NavLink, Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import JobSubmissionReview from "./JobSubmissionReview.tsx";
import LoginSignUpPage from "./LoginSignup.tsx";
import type { User } from "./LoginSignup.tsx";
import ApplicantResumeCoverLetterUpload from "./ApplicantResumeCoverLetterUpload.tsx";
import { useLocalStorage } from "@uidotdev/usehooks";
import ApplicantFeedback from "./ApplicantFeedback.tsx";
import ApplicantApplyToJobs from "./ApplicantApplyToJobs.tsx";
import ApplicantApplyToJob from "./ApplicantApplyToJob.tsx";
import EmployerApplicationReview from "./EmployerApplicationReview.tsx";
import EmployerPostJob from "./EmployerPostJob.tsx";
import FullDocumentReview from "./FullDocumentReview.tsx";
import DemoTools from "./DemoTools.tsx";
import DocumentHistory from "./DocumentHistory.tsx";
import BackButton from "./BackButton.tsx";



const TEST_HIGHLIGHTS = _testHighlights;
// Sample documents live in public/samples
const RESUME_URL = "/samples/Maya_Shah_Resume.pdf";
const RESUME_DATA_URL = "/samples/Maya_Shah_Resume_Data.pdf";
const COVER_LETTER_NORTHWIND_URL = "/samples/Maya_Shah_Cover_Letter_Northwind.pdf";
const COVER_LETTER_BRIGHTPATH_URL = "/samples/Maya_Shah_Cover_Letter_Brightpath.pdf";

export type DocumentRec = {
  id : number;
  userId : number;
  fileName : string;
  name: string;
  type: "coverletter" | "resume";
  pdfData : string | null;
  pdfURL : string | null;
};

export type Job = {
  id : number;
  company : string;
  position : string;
  reviewerId : number;
}

// The highlights are per submission
export type JobSubmission = {
  id : number;
  userId : number;
  jobId : number;
  date : string;
  resumeId : number | null;
  coverLetterId : number | null;
  reviewed : boolean;
  decision? : Decision; // Older submissions have no decision
  questions? : FeedbackQuestion[]; // Follow-up questions from the applicant, older submissions have none
  resumeCommentedHighlights : CommentedHighlight[];
  coverLetterCommentedHighlights : CommentedHighlight[];
}

export type getJobType = {
  (jobList : Job[], id : number) : Job
}

const getJob = (jobList : Job[],  id : number) => {
  const job = jobList.find((job) => job.id == id);
  if (job == undefined) {
    throw Error("job is undefined!");
  }
  return job;
}

const getNextDocumentRecId = (documents : DocumentRec[]) => documents.map((document) => document.id).reduce((x, y) => x > y ? x : y, -1)+1; // -1 so an empty list starts at id 0
const getNextUserId = (users : User[]) => users.map((user) => user.id).reduce((x, y) => x > y ? x : y, -1)+1; // -1 so an empty list starts at id 0
const getNextJobId = (jobs : Job[]) => jobs.map((job) => job.id).reduce((x, y) => x > y ? x : y, -1)+1; // -1 so an empty list starts at id 0
const getNextJobSubmission = (jobSubmissions : JobSubmission[]) => jobSubmissions.map((jobSubmission) => jobSubmission.id).reduce((x, y) => x > y ? x : y, -1)+1; // -1 so an empty list starts at id 0

// const getNextDocumentRecId: (documents: DocumentRec[]) => number
// Documents

export type addDocumentType = {
    (fileName : string, name: string, file: File, type: "coverletter" | "resume", userId : number) : Promise<DocumentRec | null>
}
const addDocument = async (getNextDocumentRecId: (documents: DocumentRec[]) => number, documentList: DocumentRec[], setDocumentList: React.Dispatch<React.SetStateAction<DocumentRec[]>>, fileName : string, name: string, file: File, type: "coverletter" | "resume", userId : number) : Promise<DocumentRec | null> => {
  if (name == undefined) { // Empty names can go through they just won't be rendered
    return null;
  }  
  const idV = getNextDocumentRecId(documentList);
  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);

          reader.readAsDataURL(file);
      });
  };
  const base64File = await fileToBase64(file);
  // const pdf = await file.bytes();
  setDocumentList([{ id: idV, userId: userId, fileName: fileName, name: name, type: type, pdfData: base64File, pdfURL: null}, ...documentList]);
  return { id: idV, userId: userId, fileName: fileName, name: name, type: type, pdfData: base64File, pdfURL: null};
};

// Jobs

const addJob = (getNextJobId: (jobs: Job[]) => number, jobList: Job[], setJobList: React.Dispatch<React.SetStateAction<Job[]>>, company : string, position : string, reviewerId : number) => {
  if (company == "" || position == "") { // Empty names can go through they just won't be rendered
    return null;
  }  
  const idV = getNextJobId(jobList);
  setJobList([{ id: idV, company : company, position : position, reviewerId : reviewerId}, ...jobList]);
  return { id: idV, company : company, position : position, reviewerId : reviewerId};
};

// Job Submission

const applyToJob = (getNextJobSubmissionId: (jobSubmission: JobSubmission[]) => number, jobSubmissionList: JobSubmission[], setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, userId : number, jobId : number, date : string, resumeId : number | null, coverLetterId : number | null) : JobSubmission | null => {
  if (jobId == undefined || date == undefined) {
    return null;
  }  
  if (resumeId == null && coverLetterId == null) {
    return null;
  }
  // One application per job per applicant
  if (jobSubmissionList.some((jobSubmission) => jobSubmission.userId == userId && jobSubmission.jobId == jobId)) {
    return null;
  }
  const idV = getNextJobSubmissionId(jobSubmissionList);
  setJobSubmissionList([{ id: idV, userId: userId, jobId: jobId, date: date, resumeId: resumeId, coverLetterId: coverLetterId, reviewed: false, coverLetterCommentedHighlights: [], resumeCommentedHighlights: []}, ...jobSubmissionList]);
  return { id: idV, userId: userId, jobId: jobId, date: date, resumeId: resumeId, coverLetterId: coverLetterId, reviewed: false, coverLetterCommentedHighlights: [], resumeCommentedHighlights: []};
};

const reviewedSubmission = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number) => {
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      t.reviewed = true;
      return t;
    } else {
      return t;
    }
  }));
}

// Saves the employer's overall decision and marks the submission as reviewed
const askQuestion = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number, text : string, about? : string) => {
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      const questions = t.questions ?? [];
      t.questions = [...questions, { id: questions.length, text: text, ...(about ? { about: about } : {}), askedAt: new Date().toLocaleDateString() }];
      return t;
    } else {
      return t;
    }
  }));
}

const replyToQuestion = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number, questionId : number, reply : string) => {
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      t.questions = (t.questions ?? []).map((question) => question.id === questionId ? { ...question, reply: reply, repliedAt: new Date().toLocaleDateString() } : question);
      return t;
    } else {
      return t;
    }
  }));
}

const submitDecision = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number, decision : Decision) => {
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      t.reviewed = true;
      t.decision = decision;
      return t;
    } else {
      return t;
    }
  }));
}

const getDocumentRec = (documentList : DocumentRec[], id : number) => {
  const document = documentList.find((document) => document.id == id);
  console.log(document);
  if (document == undefined) {
      throw Error("document undefined!");
  }
  return document;
}

const getJobSubmission = (jobSubmissionList: JobSubmission[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  return jobSubmission;
}

const isCoverLetterPresentInJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
    const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
    console.log(jobSubmission);
    if (jobSubmission == undefined) {
        throw Error("jobSubmission undefined!");
    }
    const document = documentList.find((document) => document.id == jobSubmission.coverLetterId);
    if (document == undefined) {
        return false;
    } else {
        return true;
    }
}

const isResumePresentInJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
    const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
    console.log(jobSubmission);
    if (jobSubmission == undefined) {
        throw Error("jobSubmission undefined!");
    }
    const document = documentList.find((document) => document.id == jobSubmission.resumeId);
    if (document == undefined) {
        return false;
    } else {
        return true;
    }
}

const getResumePdfByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.resumeId);
  if (document == undefined) {
      throw Error("document undefined!");
  }

  return document.pdfData;
}

const getCoverLetterPdfByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.coverLetterId);
  if (document == undefined) {
      throw Error("document undefined!");
  }

  return document.pdfData;
}


const getResumePdfLinkByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.resumeId);
  if (document == undefined) {
      throw Error("document undefined!");
  }
  
  return document.pdfURL;
}

const getCoverLetterPdfLinkByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.coverLetterId);
  if (document == undefined) {
      throw Error("document undefined!");
  }
  
  return document.pdfURL;
}


const getAllHighlightsForDocumentId = (documentList : DocumentRec[], jobSubmissionList: JobSubmission[], id : number) => {
  const document = documentList.find((document) => document.id == id);
  let highlights : CommentedHighlight[][] = [];
  let finalHighlights : CommentedHighlight[] = [];
  if (document?.type == "coverletter") {
    highlights = jobSubmissionList
    .filter((jobSubmission) => jobSubmission.coverLetterId == id)
    .map((jobSubmission) => jobSubmission.coverLetterCommentedHighlights)
    if (highlights.length >= 1) {
      finalHighlights = highlights.reduce((highlightPrev, highlight) => highlightPrev.concat(highlight));
    }
  } else {
    highlights = jobSubmissionList
    .filter((jobSubmission) => jobSubmission.resumeId == id)
    .map((jobSubmission) => jobSubmission.resumeCommentedHighlights);
    if (highlights.length >= 1) {
      finalHighlights = highlights.reduce((highlightPrev, highlight) => highlightPrev.concat(highlight));
    }
  }
  return finalHighlights;
}
const getHighlightByJobSubmissionId = (jobSubmissionList: JobSubmission[], type: "coverletter" | "resume", id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  // console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  if (type == "coverletter") {
    return jobSubmission.coverLetterCommentedHighlights
  } else {
    return jobSubmission.resumeCommentedHighlights;
  }
  
}

const setHighlightByJobSubmissionId = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], type: "coverletter" | "resume", id : number, commentedHighlights : CommentedHighlight[]) => {
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      if (type == "coverletter") {
        t.coverLetterCommentedHighlights = commentedHighlights;
      } else {
        t.resumeCommentedHighlights = commentedHighlights;
      }
      return t;
    } else {
      return t;
    }
  }));
}

// Login, signup, and log out system
const loginUser = (setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>, users: User[], username: string, password: string) : User | null => {
    
    if (username == undefined || password == undefined || username == "" || password == "") {
      return null;
    }

    const foundUser = users.find((user) => (user.username == username));
    if (foundUser == undefined || foundUser.password != password) {
      return null;
    } else {
      setCurrentUser(foundUser);
      return foundUser;
    }
};

const addUser = (getNextUserId: (users: User[]) => number, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, first_name: string, last_name: string, username: string, password: string, isEmployer: boolean) : User | null => {
  if (first_name == undefined || last_name == undefined || username == undefined || password == undefined || first_name == "" || last_name == "" || username == "" || password == "") {
    return null;
  }  
  // Each email can only have one account
  if (users.some((user) => user.username.trim().toLowerCase() == username.trim().toLowerCase())) {
    return null;
  }
  const idV = getNextUserId(users);
  setUsers([{ id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer }, ...users]);
  return { id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer };
};

const logOut = (setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  setCurrentUser(null);
}

// Sample data shown on first load (and when "Restore sample data" is used)
const SAMPLE_JOBS : Job[] = [{id: 0, company: "Northwind Health", position: "Software Engineering Intern", reviewerId: 0}, {id: 1, company: "Brightpath Analytics", position: "Data Analyst Intern", reviewerId: 0}];
const SAMPLE_SUBMISSIONS : JobSubmission[] = [
    {id: 0, userId: 1, jobId: 0, date: "11/11/2026", resumeId: 0, coverLetterId: 1, reviewed: true, decision: "consider", questions: [{id: 0, about: "Responsible for various tasks related to the website", text: "Would it help if I listed the pages I updated and how many customers used them?", askedAt: "11/14/2026"}], resumeCommentedHighlights: TEST_HIGHLIGHTS[RESUME_URL], coverLetterCommentedHighlights: TEST_HIGHLIGHTS[COVER_LETTER_NORTHWIND_URL]}, 
    {id: 1, userId: 1, jobId: 1, date: "11/12/2026", resumeId: 3, coverLetterId: 2, reviewed: false, resumeCommentedHighlights: TEST_HIGHLIGHTS[RESUME_DATA_URL], coverLetterCommentedHighlights: TEST_HIGHLIGHTS[COVER_LETTER_BRIGHTPATH_URL]}
  ];
const SAMPLE_DOCUMENTS : DocumentRec[] = [
    {id: 0, fileName : "Maya_Shah_Resume.pdf", name: "Resume - Software", userId: 1, pdfData: null, pdfURL: RESUME_URL, type: "resume"}, 
    {id: 1, fileName : "Maya_Shah_Cover_Letter_Northwind.pdf", name: "Cover Letter - Northwind Health", userId: 1, pdfData: null, pdfURL: COVER_LETTER_NORTHWIND_URL, type: "coverletter"},
    {id: 2, fileName : "Maya_Shah_Cover_Letter_Brightpath.pdf", name: "Cover Letter - Brightpath Analytics", userId: 1, pdfData: null, pdfURL: COVER_LETTER_BRIGHTPATH_URL, type: "coverletter"},
    {id: 3, fileName : "Maya_Shah_Resume_Data.pdf", name: "Resume - Data", userId: 1, pdfData: null, pdfURL: RESUME_DATA_URL, type: "resume"}
  ];

// Personas from our Assignment 4 (Maya the applicant, Dana the employer)
const SAMPLE_USERS : User[] = [
  {id: 0, first_name: "Dana", last_name: "Miller", username: "dana@example.com", password: "1234", isEmployer: true}, 
  {id: 1, first_name: "Maya", last_name: "Shah", username: "maya@example.com", password: "1234", isEmployer: false}
];

// Demo tools: clearing keeps the user accounts so Dana and Maya can still log in
const clearSampleData = (setJobList: React.Dispatch<React.SetStateAction<Job[]>>, setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, setDocumentList: React.Dispatch<React.SetStateAction<DocumentRec[]>>) => {
  setJobList([]);
  setJobSubmissionList([]);
  setDocumentList([]);
}

const restoreSampleData = (setJobList: React.Dispatch<React.SetStateAction<Job[]>>, setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, setDocumentList: React.Dispatch<React.SetStateAction<DocumentRec[]>>, setUsers: React.Dispatch<React.SetStateAction<User[]>>, setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  // Also resets the accounts so older saved data picks up the persona names
  setUsers(SAMPLE_USERS);
  setCurrentUser(null);
  setJobList(SAMPLE_JOBS);
  setJobSubmissionList(SAMPLE_SUBMISSIONS);
  setDocumentList(SAMPLE_DOCUMENTS);
}

const App = () => {
  // useLocalStorage()
  const [jobList, setJobList] = useLocalStorage<Array<Job>>("jobList", SAMPLE_JOBS);
  const [jobSubmissionList, setJobSubmissionList] = useLocalStorage<Array<JobSubmission>>("jobSubmissionList", SAMPLE_SUBMISSIONS);
  const [documentList, setDocumentList] = useLocalStorage<Array<DocumentRec>>("documentList", SAMPLE_DOCUMENTS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("currentUser", null);
  const [users, setUsers] = useLocalStorage<Array<User>>("users", SAMPLE_USERS);

  return (
    <>
        <div className="navbar">
        <Link to="/" className="brand" aria-label="Employer.MD home"><span className="brand-mark" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 14l2 2 4-4" /></svg></span><span>Employer<b>.MD</b></span></Link>
        <NavLink to="/" end>Home</NavLink>
        {currentUser && currentUser.isEmployer ?
            <>
            <NavLink to="/employer/applications/">Applications</NavLink>
            <NavLink to="/employer/jobposting/">Post Jobs</NavLink>
            </>
        : ""}

        {currentUser && !currentUser.isEmployer ?
        <>
            <NavLink to="/applicant/resumecoverletterupload">Resume and Cover Letters</NavLink>
            <NavLink to="/applicant/feedback">Feedback</NavLink>
            <NavLink to="/applicant/history">Document History</NavLink>
            <NavLink to="/applicant/apply">Apply</NavLink>
        </>
          : ""}
        <div className="right">
          {currentUser ? <p>{currentUser.first_name}</p> : ""}
          {currentUser ?
            <Link onClick={() => logOut(setCurrentUser)} to="/">Log Out</Link>
          : ""}
        </div>
    </div>
  <main className="app-page">
    <BackButton />
    <Routes>
      <Route path='/' element={<>{currentUser ? <h1>{`Welcome back, ${currentUser.first_name}! 👋`}</h1> : ""} 
      <LoginSignUpPage 
        currentUser={currentUser}
        jobList={jobList}
        jobSubmissionList={jobSubmissionList}
        documentList={documentList}
        loginUser={(username: string, password: string) => loginUser(setCurrentUser, users, username, password)} 
        resetDemoAndLogin={(username: string) => {
          // Older saved data may not have the demo accounts, so bring back the sample data and sign in
          restoreSampleData(setJobList, setJobSubmissionList, setDocumentList, setUsers, setCurrentUser);
          setCurrentUser(SAMPLE_USERS.find((user) => user.username == username) ?? null);
        }}
        addUser={(first_name: string, last_name: string, username: string, password: string, isEmployer: boolean) => addUser(getNextUserId, users, setUsers, first_name, last_name, username, password, isEmployer)}  
      />
      {currentUser ? <DemoTools clearSampleData={() => clearSampleData(setJobList, setJobSubmissionList, setDocumentList)} restoreSampleData={() => restoreSampleData(setJobList, setJobSubmissionList, setDocumentList, setUsers, setCurrentUser)}/> : ""}
      </>
      }/>
      <Route path="/employer/applications/" element={<><EmployerApplicationReview currentUser={currentUser} documentList={documentList} jobSubmissionList={jobSubmissionList} jobList={jobList} getJob={(id) => getJob(jobList, id)}/></>} />
      <Route path="/employer/jobposting/" element={<><EmployerPostJob documentList={documentList} currentUser={currentUser} jobList={jobList} addJob={(company, position, reviewerId) => addJob(getNextJobId, jobList, setJobList, company, position, reviewerId)}/></>} />
      <Route path='/applicant/resumecoverletterupload' element={<><ApplicantResumeCoverLetterUpload currentUser={currentUser} documentList={documentList} addDocument={(fileName : string, name: string, file: File, type: "coverletter" | "resume", userId : number) => addDocument(getNextDocumentRecId, documentList, setDocumentList, fileName, name, file, type, userId)}/> </>} />
      <Route path='/applicant/apply' element={<><ApplicantApplyToJobs currentUser={currentUser} jobSubmissionList={jobSubmissionList} documentList={documentList} jobList={jobList}/></>} />
      <Route path='/applicant/apply/:id' element={<><ApplicantApplyToJob currentUser={currentUser} documentList={documentList} jobSubmissionList={jobSubmissionList} getJob={(id) => getJob(jobList, id)} applyToJob={(jobId, date, resumeId, coverLetterId) => applyToJob(getNextJobSubmission, jobSubmissionList, setJobSubmissionList, currentUser?.id == undefined ? -1 : currentUser?.id, jobId, date, resumeId, coverLetterId)}/></>} />
      <Route path='/applicant/feedback' element={<><ApplicantFeedback currentUser={currentUser} documentList={documentList} jobSubmissionList={jobSubmissionList} jobList={jobList} getJob={(id) => getJob(jobList, id)}/></>} />
      <Route path='/applicant/submission/:id' element={<>
      <JobSubmissionReview 
        getJob={(id) => getJob(jobList, id)}
        getDocumentRec={(id) => getDocumentRec(documentList, id)}
        getJobSubmission={(id) => getJobSubmission(jobSubmissionList, id)}
        isCoverLetterPresentInJobSubmissionId={(id) => isCoverLetterPresentInJobSubmissionId(jobSubmissionList, documentList, id)}
        isResumePresentInJobSubmissionId={(id) => isResumePresentInJobSubmissionId(jobSubmissionList, documentList, id)}
        getResumePdfLinkByJobSubmissionId={(id) => getResumePdfLinkByJobSubmissionId(jobSubmissionList, documentList, id)} 
        getResumePdfByJobSubmissionId={(id) => getResumePdfByJobSubmissionId(jobSubmissionList, documentList, id)}
        getCoverLetterPdfLinkByJobSubmissionId={(id) => getCoverLetterPdfLinkByJobSubmissionId(jobSubmissionList, documentList, id)} 
        getCoverLetterPdfByJobSubmissionId={(id) => getCoverLetterPdfByJobSubmissionId(jobSubmissionList, documentList, id)}
        getHighlightByJobSubmissionId={(id, type) => getHighlightByJobSubmissionId(jobSubmissionList, type, id)} 
        setHighlightByJobSubmissionId={(id, type, commentedHighlights) => setHighlightByJobSubmissionId(setJobSubmissionList, jobSubmissionList, type, id, commentedHighlights)} 
        jobList={jobList} 
        jobSubmissionList={jobSubmissionList} 
        documentList={documentList} 
        currentUser={currentUser}
        reviewedSubmission={(id) => reviewedSubmission(setJobSubmissionList, jobSubmissionList, id)}
        submitDecision={(id, decision) => submitDecision(setJobSubmissionList, jobSubmissionList, id, decision)}
        askQuestion={(id, text, about) => askQuestion(setJobSubmissionList, jobSubmissionList, id, text, about)}
        replyToQuestion={(id, questionId, reply) => replyToQuestion(setJobSubmissionList, jobSubmissionList, id, questionId, reply)}/></>} 
      />
      <Route path='/applicant/history' element={<DocumentHistory currentUser={currentUser} documentList={documentList} jobSubmissionList={jobSubmissionList}/>} />
      <Route path='/applicant/document/:id' element={<>
      <FullDocumentReview getJob={(id) => getJob(jobList, id)}
        getDocumentRec={(id) => getDocumentRec(documentList, id)}
        getJobSubmission={(id) => getJobSubmission(jobSubmissionList, id)}
        isCoverLetterPresentInJobSubmissionId={(id) => isCoverLetterPresentInJobSubmissionId(jobSubmissionList, documentList, id)}
        isResumePresentInJobSubmissionId={(id) => isResumePresentInJobSubmissionId(jobSubmissionList, documentList, id)}
        getResumePdfLinkByJobSubmissionId={(id) => getResumePdfLinkByJobSubmissionId(jobSubmissionList, documentList, id)} 
        getResumePdfByJobSubmissionId={(id) => getResumePdfByJobSubmissionId(jobSubmissionList, documentList, id)}
        getCoverLetterPdfLinkByJobSubmissionId={(id) => getCoverLetterPdfLinkByJobSubmissionId(jobSubmissionList, documentList, id)} 
        getCoverLetterPdfByJobSubmissionId={(id) => getCoverLetterPdfByJobSubmissionId(jobSubmissionList, documentList, id)}
        getAllHighlightsForDocumentId={(id) => getAllHighlightsForDocumentId(documentList, jobSubmissionList.filter((jobSubmission) => jobSubmission.reviewed), id)}
        jobList={jobList} 
        jobSubmissionList={jobSubmissionList} 
        documentList={documentList} 
        currentUser={currentUser}
        reviewedSubmission={(id) => reviewedSubmission(setJobSubmissionList, jobSubmissionList, id)}/></>} />
      <Route path='*' element={<ErrorPage message="404 not found"/>}/>
    </Routes>
        </main>
    </>
    
  );
};

export default App;
