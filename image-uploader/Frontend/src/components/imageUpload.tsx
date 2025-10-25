import { Fragment, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { isAxiosError, type AxiosProgressEvent } from "axios";
import Message from "./Message";
import Progress from "./Progress";
import axios from "../request/axios";

type UploadedFile = {
  fileName: string;
  filePath: string;
};

const ImageUpload = () => {
  const [message, setMessage] = useState<string>("");
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
      setMessage("");
      setUploadedFile(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<UploadedFile>("/upload", formData, {
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadPercentage(percentage);
        },
      });

      const { fileName, filePath } = response.data;
      setUploadedFile({ fileName, filePath });
      setMessage("");
      setTimeout(() => setUploadPercentage(0), 1000);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          setMessage(`Bad request: ${data?.error ?? "Unknown error"}`);
        } else if (status === 500) {
          setMessage(`Server error: ${data?.error ?? "Unknown error"}`);
        } else {
          setMessage(data?.error ?? "Upload failed.");
        }
      } else {
        setMessage("Unexpected error occurred.");
      }
      setUploadPercentage(0);
    }
  };

  return (
    <Fragment>
      {message && <Message message={message} setMessage={setMessage} />}
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>
        <Progress percentage={uploadPercentage} />
        <input
          type="submit"
          value="Upload"
          className="btn btn-primary btn-block mt-4"
        />
      </form>
      {uploadedFile && (
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
