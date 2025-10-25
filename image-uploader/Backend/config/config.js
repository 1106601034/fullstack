// config.js
// Identifies this module as the application configuration entry point.
const path = require("path");
// Loads Node's path utility to construct platform-safe directory paths.
module.exports = {
  // Exports the configuration object used throughout the backend.
  port: process.env.PORT || 8080,
  // Chooses the listening port from env or defaults to 8080.
  uploadDir: path.join(__dirname, "..", "Frontend", "public", "uploads"),
  // Resolves the absolute path for storing uploaded files in the frontend public folder.
  maxFileSize: 10 * 1024 * 1024, // 10MB
  // Sets the maximum allowed upload size to 10MB in bytes.
  allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  // Defines a whitelist of acceptable MIME types for uploads.
};
// Ends the configuration object export.
