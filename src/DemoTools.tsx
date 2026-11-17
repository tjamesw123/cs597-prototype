import { useState } from "react";
import "./style/App.css";

interface DemoToolsProps {
    clearSampleData : () => void;
    restoreSampleData : () => void;
}

// Small box on the home page for resetting the app before a demo
const DemoTools = ({clearSampleData, restoreSampleData} : DemoToolsProps) => {
    const [message, setMessage] = useState<string>("");
    return (
        <div className="demo-tools">
            <div className="demo-tools-text">
                <b>Demo tools</b>
                <span>Clear removes all jobs, applications, documents and comments. The Dana and Maya logins stay.</span>
                {message != "" ? <span className="demo-tools-message">{message}</span> : ""}
            </div>
            <div className="demo-tools-buttons">
                <button className="btn secondary" onClick={() => {
                    if (window.confirm("Clear all sample data? Jobs, applications, documents and comments will be removed.")) {
                        clearSampleData();
                        setMessage("✅ Sample data cleared.");
                    }
                }}>Clear sample data</button>
                <button className="btn secondary" onClick={() => {
                    if (window.confirm("Restore the sample data? This replaces the current jobs, applications, documents and accounts, and logs you out.")) {
                        restoreSampleData();
                        setMessage("✅ Sample data restored.");
                    }
                }}>Restore sample data</button>
            </div>
        </div>
    );
};

export default DemoTools;
