const express = require("express");
// Imports Express to build the HTTP server framework.
const fileUpload = require("express-fileupload");
// Pulls in express-fileupload so multipart form data can be parsed and managed.
const { v4: uuidv4 } = require("uuid");
// Imports the UUID v4 generator and aliases it to uuidv4 for unique filenames.
const cors = require("cors");
// Brings in CORS middleware so the API can accept cross-origin requests.
const path = require("path");
// Uses Node's path utility to construct safe, platform-independent file paths.
const fs = require("fs");
// Loads the filesystem module to check for and create directories when needed.

const app = express();
// Instantiates the Express application.
const port = 8080;
// Hard-codes the server port to 8080; consider env configuration if needed.
const uploadDir = path.join(__dirname, "..", "Frontend", "public", "uploads");
// Computes the absolute path to the uploads directory within the frontend's public assets.

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Ensures the upload directory exists, creating nested folders when missing.

app.use(cors());
// Enables CORS for all routes with default settings (wide open access).
app.use(fileUpload());
// Registers express-fileupload with default options (no per-file size limit, temp directory, etc.).
app.use("/uploads", express.static(uploadDir));
// Serves uploaded files statically at /uploads, exposing saved files via HTTP.

app.post("/upload", (req, res) => {
  // Defines the POST /upload endpoint that handles incoming file uploads.
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Validates the presence of a file field, returning HTTP 400 if absent.

  const file = req.files.file;
  const maxSize = 10 * 1024 * 1024;
  // Sets a 10MB cap for uploads in bytes.

  if (file.size > maxSize) {
    return res
      .status(400)
      .json({ error: "File size too large. Maximum allowed is 10MB." });
  }
  // Enforces the size cap, responding with a descriptive 400 error on violation.

  const fileName = `${uuidv4()}${path.extname(file.name)}`;
  const destinationPath = path.join(uploadDir, fileName);
  // Generates a random filename while preserving the original extension and builds the storage path.

  file.mv(destinationPath, (err) => {
    if (err) {
      console.error("Failed to move uploaded file:", err);
      return res.status(500).json({ error: "Failed to save uploaded file." });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    res.json({ fileName, filePath: fileUrl });
  });
});
// Moves the uploaded file from temp storage, handles errors, and returns the public URL.

app.use((err, req, res, next) => {
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Server error." });
});
// Registers a catch-all error handler that logs unexpected errors and responds with HTTP 500.

app.listen(port, () =>
  console.log(`API available at http://localhost:${port}`)
);
// Starts the server and logs the local URL when listening begins.
