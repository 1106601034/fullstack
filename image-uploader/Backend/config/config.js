// config.js
const path = require("path");
module.exports = {
  port: process.env.PORT || 8080,
  uploadDir: path.join(__dirname, "..", "Frontend", "public", "uploads"),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
};
