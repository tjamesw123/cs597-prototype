import { useLocation, useNavigate } from "react-router";
import "./style/BackButton.css";

// Back button shown at the top of every page except Home
const BackButton = () => {
    const location = useLocation();
    const navigate = useNavigate();

    if (location.pathname == "/") {
        return null;
    }

    return (
        <button
            type="button"
            className="back-button"
            aria-label="Go back to the previous page"
            onClick={() => {
                // If the page was opened directly there is nothing to go back to, so go Home
                if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1);
                } else {
                    navigate("/");
                }
            }}
        >
            <span aria-hidden="true">←</span> Back
        </button>
    );
};

export default BackButton;
