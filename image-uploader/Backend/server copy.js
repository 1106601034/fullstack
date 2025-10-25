// server.js
// Implements the Express server that exposes the upload API.
const express = require("express");
// Imports Express to create the HTTP server and routing.
const fileUpload = require("express-fileupload");
// Brings in express-fileupload middleware to handle multipart form data.
const cors = require("cors");
// Enables Cross-Origin Resource Sharing so the frontend can call the API.
const config = require("./config/config");
// Loads configuration values such as port, upload directory, and limits.
const uploadService = require("./src/uploadService");
// Imports helper functions for validating and storing uploaded files.

const app = express();
// Creates the Express application instance.

uploadService.ensureUploadDir();
// Ensures the upload directory exists before serving or storing files.

app.use(cors());
// Applies CORS middleware to all incoming requests.
app.use(fileUpload());
// Registers express-fileupload to populate req.files on uploads.
app.use("/uploads", express.static(config.uploadDir));
// Serves uploaded files as static assets from the configured directory.

app.post("/upload", async (req, res) => {
  // Handles POST /upload requests to process file uploads.
  try {
    if (!req.files || !req.files.file) {
      // Validates that a file field is present in the request.
      return res.status(400).json({ error: "No file uploaded." });
      // Responds with a 400 error when the file is missing.
    }
    const file = req.files.file;
    // Extracts the uploaded file from the request payload.
    uploadService.validateFile(file);
    // Verifies the file meets size and MIME type requirements.

    const filename = await uploadService.saveFile(file);
    // Persists the uploaded file and returns the stored filename.
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    // Builds an absolute URL that the client can use to access the file.
    return res.json({ fileName: filename, filePath: fileUrl });
    // Sends back the stored filename and its public URL.
  } catch (err) {
    console.error("Upload error:", err);
    // Logs the error for server monitoring.
    return res.status(400).json({ error: err.message });
    // Returns a 400 response with the error message for client visibility.
  }
});

// error middleware
app.use((err, req, res, next) => {
  // Catches unhandled errors in the middleware chain.
  console.error("Unexpected server error:", err);
  // Logs unexpected exceptions to the console.
  res.status(500).json({ error: "Server error." });
  // Sends a generic 500 response to the client.
});

app.listen(config.port, () =>
  console.log(`API available at http://localhost:${config.port}`)
);
// Starts the HTTP server listening on the configured port and logs the URL.
