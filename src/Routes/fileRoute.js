const express = require("express");
const router = express.Router();

// Import the upload middleware and controller
const { upload } = require("../Middleware/uploadMiddleware");
const { uploadFile } = require("../Controller/fileController");
const multipleUploadFile = require("../Controller/uploadMultipleFileConteoller");

// Define the file upload route
router.post("/", upload.single("excelFile"), uploadFile);
router.post(
  "/uploadwithmatchedheader",
  upload.single("excelFile"),
  multipleUploadFile
);
module.exports = router;
