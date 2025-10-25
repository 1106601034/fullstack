// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const config = require("./config");
const uploadService = require("./uploadService");

const app = express();

uploadService.ensureUploadDir();

app.use(cors());
app.use(fileUpload());
app.use("/uploads", express.static(config.uploadDir));

app.post("/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    const file = req.files.file;
    uploadService.validateFile(file);

    const filename = await uploadService.saveFile(file);
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    return res.json({ fileName: filename, filePath: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ error: err.message });
  }
});

// error middleware
app.use((err, req, res, next) => {
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Server error." });
});

app.listen(config.port, () =>
  console.log(`API available at http://localhost:${config.port}`)
);
