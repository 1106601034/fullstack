// uploadService.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

function ensureUploadDir() {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
}

function validateFile(file) {
  if (file.size > config.maxFileSize) {
    throw new Error(`File size exceeds ${config.maxFileSize} bytes`);
  }
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}`);
  }
}

function saveFile(file) {
  const ext = path.extname(file.name);
  const filename = `${uuidv4()}${ext}`;
  const dest = path.join(config.uploadDir, filename);
  return new Promise((resolve, reject) => {
    file.mv(dest, (err) => {
      if (err) return reject(err);
      resolve(filename);
    });
  });
}

module.exports = {
  ensureUploadDir,
  validateFile,
  saveFile,
};
