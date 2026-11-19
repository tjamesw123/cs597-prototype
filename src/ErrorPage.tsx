import type { ReactNode } from "react";
import { Link } from "react-router";
import "./style/ErrorPage.css";

// Shown for any address that doesn't exist, with clear ways out instead of a dead end
function ErrorPage(props: { message?: ReactNode }) {
  return (
    <div className="not-found">
      <div className="not-found-code" aria-hidden="true">404</div>
      <h1>We couldn't find that page</h1>
      <p>The link may be old or mistyped. Your applications and feedback are safe, so head back and pick up where you left off.</p>
      <div className="not-found-actions">
        <Link className="btn primary" to="/">Go to Home</Link>
      </div>
      {props.message ? <p className="not-found-detail">Error: {props.message}</p> : ""}
    </div>
  );
}

export default ErrorPage;
