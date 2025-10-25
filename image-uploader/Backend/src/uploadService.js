// uploadService.js
// Encapsulates reusable helpers for validating and storing uploaded files.
const fs = require("fs");
// Loads Node's filesystem module to inspect and create directories.
const path = require("path");
// Provides path utilities for deriving file extensions and destination paths.
const { v4: uuidv4 } = require("uuid");
// Imports the UUID v4 generator and aliases it to uuidv4 for unique filenames.
const config = require("./config");
// Pulls in shared configuration values like upload directory and limits.

function ensureUploadDir() {
  // Guarantees the upload directory exists before saving files.
  if (!fs.existsSync(config.uploadDir)) {
    // Checks for the directory presence and creates it when missing.
    fs.mkdirSync(config.uploadDir, { recursive: true });
    // Recursively creates the upload directory path to avoid errors.
  }
}

function validateFile(file) {
  // Verifies a file adheres to size and MIME type rules before saving.
  if (file.size > config.maxFileSize) {
    // Throws when the file exceeds the configured maximum size.
    throw new Error(`File size exceeds ${config.maxFileSize} bytes`);
  }
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    // Ensures uploaded files match the allowed MIME type whitelist.
    throw new Error(`Invalid file type: ${file.mimetype}`);
  }
}

function saveFile(file) {
  // Persists an uploaded file to disk and returns the generated filename.
  const ext = path.extname(file.name);
  // Extracts the original file extension to preserve type information.
  const filename = `${uuidv4()}${ext}`;
  // Builds a unique filename by prefixing a UUID.
  const dest = path.join(config.uploadDir, filename);
  // Resolves the absolute destination path within the upload directory.
  return new Promise((resolve, reject) => {
    // Wraps the async move operation in a Promise for await compatibility.
    file.mv(dest, (err) => {
      // Uses express-fileupload's mv helper to move the file.
      if (err) return reject(err);
      // Rejects the promise when moving fails.
      resolve(filename);
      // Resolves with the stored filename on success.
    });
  });
}

module.exports = {
  ensureUploadDir,
  validateFile,
  saveFile,
};
// Exports the upload helpers for use in route handlers.
