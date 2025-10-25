import { Fragment, useState } from "react";
// Pulls Fragment for grouping elements without extra nodes and useState for state management.
import type { ChangeEvent, FormEvent } from "react";
// Imports type definitions for input change and form submit events to type handlers.
import { isAxiosError, type AxiosProgressEvent } from "axios";
// Brings in axios helpers to detect axios-specific errors and type upload progress events.
import Message from "./Message";
// Imports the Message component used to display user feedback.
import Progress from "./Progress";
// Imports the Progress component to show upload percentage.
import axios from "../request/axios";
// Reuses the preconfigured axios instance pointed at the backend.

type UploadedFile = {
  fileName: string;
  filePath: string;
};
// Declares the shape of the upload response containing the file name and accessible URL.

const ImageUpload = () => {
  // Defines the ImageUpload functional component that wraps the upload workflow.
  const [message, setMessage] = useState<string>("");
  // Stores the current status or error message to surface to the user.
  const [uploadPercentage, setUploadPercentage] = useState<number>(0);
  // Tracks upload progress as a percentage for the progress bar.
  const [file, setFile] = useState<File | null>(null);
  // Holds the file selected by the user or null when none is chosen.
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  // Keeps the uploaded file info to render preview details after a successful upload.

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Handles the file input change event when the user picks a file.
    if (event.target.files?.length) {
      // Checks that the input has at least one file before proceeding.
      setFile(event.target.files[0]);
      // Stores the first selected file for upload.
      setMessage("");
      // Clears any previous status or error message.
      setUploadedFile(null);
      // Resets the uploaded file info so old previews disappear.
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Handles form submission by triggering the upload request.
    event.preventDefault();
    // Prevents the default page reload on form submission.

    if (!file) {
      // Guards against submissions without a selected file.
      setMessage("Please select a file to upload.");
      // Notifies the user that they must pick a file first.
      return;
      // Stops execution when no file is available.
    }

    const formData = new FormData();
    // Creates a FormData payload to send multipart data.
    formData.append("file", file);
    // Appends the selected file under the 'file' key for the backend to read.

    try {
      // Attempts the upload and handles errors via the catch block.
      const response = await axios.post<UploadedFile>("/upload", formData, {
        // Posts the form data to the backend upload endpoint.
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          // Receives periodic progress updates during the upload.
          if (!progressEvent.total) {
            // Skips updates when the total size is missing.
            return;
            // Exits early without updating the progress bar.
          }

          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Calculates the integer percentage of bytes uploaded.
          setUploadPercentage(percentage);
          // Updates the progress bar with the latest percentage.
        },
      });

      const { fileName, filePath } = response.data;
      // Destructures the uploaded file information from the response.
      setUploadedFile({ fileName, filePath });
      // Stores the uploaded file info to display a preview.
      setMessage("");
      // Clears any lingering message after a successful upload.
      setTimeout(() => setUploadPercentage(0), 1000);
      // Resets the progress bar to zero after a short delay.
    } catch (error) {
      // Handles failures from the upload request.
      if (isAxiosError(error) && error.response) {
        // Checks whether the error is an Axios error with a response payload.
        const { status, data } = error.response;
        // Extracts response status and payload for detailed messaging.

        if (status === 400) {
          // Detects client-side errors returned by the server.
          setMessage(`Bad request: ${data?.error ?? "Unknown error"}`);
          // Provides a specific message for 400-level errors.
        } else if (status === 500) {
          // Detects server-side failures.
          setMessage(`Server error: ${data?.error ?? "Unknown error"}`);
          // Communicates that the server failed processing the upload.
        } else {
          setMessage(data?.error ?? "Upload failed.");
          // Falls back to a generic error message for other statuses.
        }
      } else {
        setMessage("Unexpected error occurred.");
        // Handles non-Axios or network errors with a generic notice.
      }
      setUploadPercentage(0);
      // Resets the progress bar because the upload did not complete.
    }
  };

  return (
    // Renders the component UI for the upload flow.
    <Fragment>
      {/* Groups multiple top-level elements without adding extra DOM nodes. */}
      {message && <Message message={message} setMessage={setMessage} />}
      {/* Conditionally renders the Message component when feedback exists. */}
      <form onSubmit={handleSubmit}>
        {/* Wraps the inputs in a form that triggers submission logic. */}
        <div className="input-group mb-3">
          {/* Uses Bootstrap input-group styling with bottom margin. */}
          <input
            type="file"
            /* Configures the input to accept file selections. */
            className="form-control"
            /* Applies Bootstrap form-control styling. */
            onChange={handleFileChange}
            /* Hooks up the change handler to capture selected files. */
          />
          {/* Renders the file picker input element. */}
        </div>
        <Progress percentage={uploadPercentage} />
        {/* Shows the upload progress bar with the latest percentage. */}
        <input
          type="submit"
          /* Specifies that clicking triggers form submission. */
          value="Upload"
          /* Sets the button label. */
          className="btn btn-primary btn-block mt-4"
          /* Applies Bootstrap button styles with top margin. */
        />
        {/* Renders the submission button. */}
      </form>
      {uploadedFile && (
        // Conditionally renders the preview section after a successful upload.
        <div className="row mt-5">
          {/* Aligns the preview content using Bootstrap grid with top margin. */}
          <div className="col-md-6 m-auto">
            {/* Centers the preview column within the row. */}
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            {/* Displays the uploaded file name centered. */}
            <img
              src={uploadedFile.filePath}
              /* Points the image source to the uploaded file URL. */
              alt="uploaded file"
              /* Provides alt text for accessibility. */
              style={{ width: "100%" }}
              /* Forces the image to fill the width of its container. */
            />
            {/* Shows the uploaded image preview. */}
          </div>
        </div>
      )}
      {/* Ends the conditional preview wrapper. */}
    </Fragment>
  );
};

export default ImageUpload;
// Exports the ImageUpload component as the module default.
