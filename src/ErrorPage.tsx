import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

function ErrorPage(props: { message: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) {
  return (
    <div className='entry'>
      <h2 className='error'>Error</h2>
      <p>{props.message ? props.message : ""}</p>
    </div>
  );
}

export default ErrorPage;