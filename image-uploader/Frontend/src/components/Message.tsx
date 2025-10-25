import React from "react";

export default function Message({ message, setMessage }) {
  return (
    <div
      className="alert alert-warning alert-dissmissable fade show"
      role="alert"
    >
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setMessage("")}
      ></button>
    </div>
  );
}
