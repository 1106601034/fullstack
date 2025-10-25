const express = require("express");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 8080;
const uploadDir = path.join(__dirname, "..", "Frontend", "public", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(fileUpload());
app.use("/uploads", express.static(uploadDir));

app.post("/upload", (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const file = req.files.file;
  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    return res
      .status(400)
      .json({ error: "File size too large. Maximum allowed is 10MB." });
  }

  const fileName = `${uuidv4()}${path.extname(file.name)}`;
  const destinationPath = path.join(uploadDir, fileName);

  file.mv(destinationPath, (err) => {
    if (err) {
      console.error("Failed to move uploaded file:", err);
      return res.status(500).json({ error: "Failed to save uploaded file." });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;

    res.json({ fileName, filePath: fileUrl });
  });
});

app.use((err, req, res, next) => {
  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Server error." });
});

app.listen(port, () =>
  console.log(`API available at http://localhost:${port}`)
);
