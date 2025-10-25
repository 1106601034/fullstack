import React from "react";

const Message = ({ message, setMessage }) => {
{
  return (
    <div className="alert alert-warning alert-dissmissable fade show">
      {message}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setMessage("")}
      ></button>
    </div>
  );
};

export default Message;
