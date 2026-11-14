import "./style/App.css";
import { testHighlights as _testHighlights } from "./test-highlights";
import type {DocumentRec, JobSubmission} from './App.tsx';

interface EmployerProps {
    documentList : DocumentRec[];
    jobSubmissions : JobSubmission[];
}

const Employer = ({documentList, jobSubmissions} : EmployerProps) => {
    
    return (
        <div>
            <h1>Employer</h1>
            <h2>Application resumes to review</h2>
            <ul>
                {jobSubmissions ? jobSubmissions.map((jobSubmission) => <li>{jobSubmission.id.toString()}</li>) : ""}
            </ul>
        </div>
    );
};

export default Employer