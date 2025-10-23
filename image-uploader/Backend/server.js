const express = require("express");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");

const server = express();
const port = 8080;

server.get("/", (req, res) => {
  res.send("404 not found");
});

server.listen(port, () => console.log(`http://localhost:${port}`));
