import React, { Fragment, useState } from "react";
import Message from "./Message";
import Progress from "./Progress";

const ImageUpload = () => {
  const [message, setMessage] = useState("test");
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const onSubmit = () => {};
  return (
    <Fragment>
      {message && <Message message={message} setMessage={setMessage} />}
      <form onSubmit={onSubmit}>
        <div className="input-group mb-3">
          <input type="file" className="form-control" />
        </div>
        <Progress precentage={uploadPercentage} />
        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
    </Fragment>
  );
};

export default ImageUpload;
