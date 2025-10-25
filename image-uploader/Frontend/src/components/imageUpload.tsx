import { Fragment, useState } from "react";
import Message from "./Message";
import Progress from "./Progress";
import axios from "../request/axios";
import { isEmpty } from "lodash";

const ImageUpload = () => {
  const [message, setMessage] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [file, setFile] = useState("");
  const [uploadedFile, setUpLpoadedFile] = useState({});
  const onChange = (e) => {
    if (e.target.files.length) {
      setFile(e.target.files[0]);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/upload", formData, {
        onUploadProgress: (ProgressEvent) => {
          setUploadPercentage(
            parseInt(
              Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total)
            )
          );
        },
      });
      const { fileName, filePath } = res.data;
      setTimeout(() => {
        setUploadPercentage(0);
        setUpLpoadedFile({ fileName, filePath });
      }, 5000);
    } catch (error) {
      if (error.responmse) {
        const [status, data] = error.responmse;
        if (status === 400) {
          setMessage(`Bad request: ${data.error}`);
        } else if (status === 500) {
          setMessage(`Server error: ${data.error}`);
        } else {
          setMessage(data.error);
        }
      } else {
        setMessage("Unexpected error occured");
      }
    }
  };
  return (
    <Fragment>
      {message && <Message message={message} setMessage={setMessage} />}
      <form onSubmit={onSubmit}>
        <div className="input-group mb-3">
          <input type="file" className="form-control" onChange={onChange} />
        </div>
        <Progress precentage={uploadPercentage} />
        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {!isEmpty(uploadedFile) && (
        <div className="row mt-5">
          <div className="col-md-6 m-auto">
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            <img
              src={uploadedFile.filePath}
              alt="uploaded file"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ImageUpload;
