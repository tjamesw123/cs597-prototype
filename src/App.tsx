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
import { Link, Route, Routes } from "react-router";
import ErrorPage from "./ErrorPage.tsx";
import { addHighlight, editHighlight, handleContextMenu, resetHash, resetHighlights, scrollToHighlightFromHash} from "./HighlightHelper.tsx";
import DocumentReview from "./DocumentReview.tsx";
import { NavLink } from "react-router";
import LoginSignUpPage from "./LoginSignup.tsx";
import type { addUserType, User } from "./LoginSignup.tsx";
import type { DocumentInitParameters, TypedArray } from "pdfjs-dist/types/src/display/api";
import ApplicantResumeCoverLetterUpload from "./ApplicantResumeCoverLetterUpload.tsx";
import { useLocalStorage } from "@uidotdev/usehooks";
import ApplicantFeedback from "./ApplicantFeedback.tsx";


// import * as pdfjs from 'pdfjs-dist';

// import * as pdfjs from 'pdfjs-dist';
// pdfjs.GlobalWorkerOptions.workerSrc =
//   `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const TEST_HIGHLIGHTS = _testHighlights;
const PRIMARY_PDF_URL = "https://arxiv.org/pdf/2203.11115";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480";

// export default function useLocalStorage<T>(key: string, initialValue: T) {
//   const [value, setValue] = useState(() => {
//     const data = window.localStorage.getItem(key);
//     return (data || initialValue) as T;
//   });
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
  reviewerId : number; // Who's job it is to review it, would be a user id
}

// The highlights are per submission
export type JobSubmission = {
  id : number;
  jobId : number;
  date : string;
  docId : number;
  reviewed : boolean;
  commentedHighlights : CommentedHighlight[];
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

const getJobSubmission = (jobSubmissionList : JobSubmission[], id : number) => {

}

// const getNextDocumentRecId = () => String(Math.random()).slice(2);
// const getNextUserId = () => String(Math.random()).slice(2);
// const getNextJobId = () => String(Math.random()).slice(2);
// const getNextJobSubmission = () => String(Math.random()).slice(2);


const getNextDocumentRecId = (documents : DocumentRec[]) => documents.map((document) => document.id).reduce((x, y) => x > y ? x : y)+1;
const getNextUserId = (users : User[]) => users.map((user) => user.id).reduce((x, y) => x > y ? x : y)+1;
const getNextJobId = (jobs : Job[]) => jobs.map((job) => job.id).reduce((x, y) => x > y ? x : y)+1;
const getNextJobSubmission = (jobSubmissions : JobSubmission[]) => jobSubmissions.map((jobSubmission) => jobSubmission.id).reduce((x, y) => x > y ? x : y)+1;

// const getNextDocumentRecId: (documents: DocumentRec[]) => number
// Documents

export type addDocumentType = {
    (fileName : string, name: string, file: File, type: "coverletter" | "resume") : Promise<DocumentRec | null>
}
const addDocument = async (getNextDocumentRecId: (documents: DocumentRec[]) => number, documentList: DocumentRec[], setDocumentList: React.Dispatch<React.SetStateAction<DocumentRec[]>>, fileName : string, name: string, file: File, type: "coverletter" | "resume") : Promise<DocumentRec | null> => {
  if (name == undefined || name == "") {
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
  setDocumentList([{ id: idV, userId: idV, fileName: fileName, name: name, type: type, pdfData: base64File, pdfURL: null}, ...documentList]);
  return { id: idV, userId: idV, fileName: fileName, name: name, type: type, pdfData: base64File, pdfURL: null};
};

// Jobs


// Job Submission



const applyToJob = (getNextJobId: (users: User[]) => number, jobs: Job[], setJobs: React.Dispatch<React.SetStateAction<Job[]>>, jobId : number, date : string, docId : number) : User | null => {
  if (first_name == undefined || last_name == undefined || username == undefined || password == undefined || first_name == "" || last_name == "" || username == "" || password == "") {
    return null;
  }  
  const idV = getNextJobId(users);
  setUsers([{ id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer }, ...users]);
  return { id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer };
};

const reviewedSubmission = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number) => {
  // const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  // if (jobSubmission == undefined) {
  //     throw Error("jobSubmission undefined!");
  // }
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      t.reviewed = true;
      return t;
    } else {
      return t;
    }
  }));
}

const getPdfByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.docId);
  if (document == undefined) {
      throw Error("document undefined!");
  }

  return document.pdfData;
  // return jobSubmission.commentedHighlights;
}

const getPdfLinkByJobSubmissionId = (jobSubmissionList: JobSubmission[], documentList : DocumentRec[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  // console.log(documentList);
  const document = documentList.find((document) => document.id == jobSubmission.docId);
  if (document == undefined) {
      throw Error("document undefined!");
  }
  
  return document.pdfURL;
  // return jobSubmission.commentedHighlights;
}

const getHighlightByJobSubmissionId = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number) => {
  const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  // console.log(jobSubmission);
  if (jobSubmission == undefined) {
      throw Error("jobSubmission undefined!");
  }
  return jobSubmission.commentedHighlights;
}

const setHighlightByJobSubmissionId = (setJobSubmissionList: React.Dispatch<React.SetStateAction<JobSubmission[]>>, jobSubmissionList: JobSubmission[], id : number, commentedHighlights : CommentedHighlight[]) => {
  // const jobSubmission = jobSubmissionList.find((jobSubmission) => jobSubmission.id == id);
  // if (jobSubmission == undefined) {
  //     throw Error("jobSubmission undefined!");
  // }
  setJobSubmissionList(jobSubmissionList.map(t => {
    if (t.id === id) {
      t.commentedHighlights = commentedHighlights;
      return t;
    } else {
      return t;
    }
  }));
}

// setTodos(todos.map(t => {
//       if (t.id === nextTodo.id) {
//         return nextTodo;
//       } else {
//         return t;
//       }
//     }));

// Login, signup, and log out system
const loginUser = (setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, username: string, password: string) : User | null => {
    
    if (username == undefined || password == undefined || username == "" || password == "") {
      return null;
    }

    const foundUsers = users.filter((user) => (user.username == username));
    if (foundUsers.length == 0 && foundUsers[0].password != password) {
      return null;
    } else {
      setCurrentUser(foundUsers[0]);
      return foundUsers[0];
    }
};

const addUser = (getNextUserId: (users: User[]) => number, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, first_name: string, last_name: string, username: string, password: string, isEmployer: boolean) : User | null => {
  if (first_name == undefined || last_name == undefined || username == undefined || password == undefined || first_name == "" || last_name == "" || username == "" || password == "") {
    return null;
  }  
  const idV = getNextUserId(users);
  setUsers([{ id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer }, ...users]);
  return { id: idV, first_name: first_name, last_name: last_name, username: username, password: password, isEmployer: isEmployer };
};

const logOut = (setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  setCurrentUser(null);
}

const App = () => {
  // const [url, setUrl] = useState(PRIMARY_PDF_URL);

// DocumentAndHighlights -> Document and Highlights
  // useLocalStorage()
  const [jobList, setJobList] = useLocalStorage<Array<Job>>("jobList", [{id: 0, company: "Company 1", position: "Intern", reviewerId: 0}, {id: 1, company: "Company 2", position: "Intern", reviewerId: 0}]);
  // const [jobList, setJobList] = useState<Array<Job>>([{id: 0, company: "Company 1", position: "Intern", reviewerId: 0}, {id: 1, company: "Company 2", position: "Intern", reviewerId: 0}]);
  const [jobSubmissionList, setJobSubmissionList] = useLocalStorage<Array<JobSubmission>>("jobSubmissionList", [{id: 0, jobId: 0, date: "11/11/2026", docId: 0, reviewed: false, commentedHighlights: TEST_HIGHLIGHTS[PRIMARY_PDF_URL]}, {id: 1, jobId: 1, date: "11/12/2026", docId: 1, reviewed: false, commentedHighlights: TEST_HIGHLIGHTS[SECONDARY_PDF_URL]}, {id: 2, jobId: 1, date: "11/12/2026", docId: 2, reviewed: false, commentedHighlights: []}]);
  // const [jobSubmissionList, setJobSubmissionList] = useState<Array<JobSubmission>>([{id: 0, jobId: 0, date: "11/11/2026", docId: 0, reviewed: false, commentedHighlights: TEST_HIGHLIGHTS[PRIMARY_PDF_URL]}, {id: 1, jobId: 1, date: "11/12/2026", docId: 1, reviewed: false, commentedHighlights: TEST_HIGHLIGHTS[SECONDARY_PDF_URL]}, {id: 2, jobId: 1, date: "11/12/2026", docId: 2, reviewed: false, commentedHighlights: []}]);
  const [documentList, setDocumentList] = useLocalStorage<Array<DocumentRec>>("documentList", [{id: 0, fileName : "testPdf.pdf", name: "test", userId: 0, pdfData: null, pdfURL: PRIMARY_PDF_URL, type: "resume"}, {id: 1, fileName : "test2Pdf.pdf", name: "test2", userId: 0, pdfData: null, pdfURL: SECONDARY_PDF_URL, type: "resume"}]);
  // const [documentList, setDocumentList] = useState<Array<DocumentRec>>([{id: 0, name: "test", userId: 0, pdf: PRIMARY_PDF_URL, type: "resume"}, {id: 1, name: "test2", userId: 0, pdf: SECONDARY_PDF_URL, type: "resume"}]);

  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("currentUser", null);
  const [users, setUsers] = useLocalStorage<Array<User>>("users", [{id: 0, first_name: "James", last_name: "James", username: "TJames", password: "1234", isEmployer: true}, {id: 1, first_name: "Bob", last_name: "James", username: "bob1", password: "1234", isEmployer: false}]);

  
// /applicant/feedback
// navbar
  return (
    <>
    <div className="navbar">
        <Link to={{
              pathname: "/"
            }}>Home</Link>
        {currentUser && currentUser.isEmployer ?
            <Link to={{
              pathname: "/employer/"
            }}>Employer</Link>
        : ""}
        {currentUser && !currentUser.isEmployer ?
        <>
            <Link to={{
              pathname: "/applicant/resumecoverletterupload"
            }}>Resume and Cover Letters</Link>
            <Link to={{
              pathname: "/applicant/feedback"
            }}>Feedback</Link>
        </>
          : ""}
        <div className="right">
          {currentUser ?
            <Link onClick={() => logOut(setCurrentUser)} to={{
              pathname: "/"
            }}>Log Out</Link>
          : ""}
          {currentUser ?
            <p>{currentUser.first_name}</p>
          : ""}
        </div>
        
    </div>
    <Routes>
      <Route path='/' element={<><h1>Welcome to EmployerMD!</h1> 
      <LoginSignUpPage 
        currentUser={currentUser}
        loginUser={(username: string, password: string) => loginUser(setCurrentUser, users, setUsers, username, password)} 
        addUser={(first_name: string, last_name: string, username: string, password: string, isEmployer: boolean) => addUser(getNextUserId, users, setUsers, first_name, last_name, username, password, isEmployer)}  />
        </>} 
      />
      <Route path='/employer/' element={<><h1>Hi there employer</h1></>} />
      <Route path='/applicant/' element={<><h1>Hi there applicant</h1></>} />
      <Route path='/applicant/resumecoverletterupload' element={<><ApplicantResumeCoverLetterUpload documentList={documentList} addDocument={(fileName : string, name: string, file: File, type: "coverletter" | "resume") => addDocument(getNextDocumentRecId, documentList, setDocumentList, fileName, name, file, type)}/> </>} />
      <Route path='/applicant/apply' element={<><h1>Apply to posted positions</h1></>} />
      <Route path='/applicant/apply/:id' element={<><h1>Apply to a position</h1></>} />
      <Route path='/applicant/feedback' element={<><ApplicantFeedback currentUser={currentUser} documentList={documentList} jobSubmissionList={jobSubmissionList} jobList={jobList} getJob={(id) => getJob(jobList, id)}/></>} />
      <Route path='/applicant/submission/:id' element={<>
      <DocumentReview 
        getJob={(id) => getJob(jobList, id)}
        getPdfLinkByJobSubmissionId={(id) => getPdfLinkByJobSubmissionId(jobSubmissionList, documentList, id)} 
        getPdfByJobSubmissionId={(id) => getPdfByJobSubmissionId(jobSubmissionList, documentList, id)}
        getHighlightByJobSubmissionId={(id) => getHighlightByJobSubmissionId(setJobSubmissionList, jobSubmissionList, id)} 
        setHighlightByJobSubmissionId={(id, commentedHighlights) => setHighlightByJobSubmissionId(setJobSubmissionList, jobSubmissionList, id, commentedHighlights)} 
        jobList={jobList} 
        jobSubmissionList={jobSubmissionList} 
        documentList={documentList} 
        currentUser={currentUser}
        reviewedSubmission={(id) => reviewedSubmission(setJobSubmissionList, jobSubmissionList, id)}/></>} 
        
      />
      <Route path='/applicant/document/:id' element={<><h1>Review all feedback on a submitted document</h1></>} />
      <Route path='*' element={<ErrorPage message="404 not found"/>}/>
    </Routes>
    </>
    
  );
};

export default App;
