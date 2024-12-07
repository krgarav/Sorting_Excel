const express = require("express");
const router = express.Router();

// Import the upload middleware and controller
const { upload } = require("../Middleware/uploadMiddleware");
const { uploadFile } = require("../Controller/fileController");

// Define the file upload route
router.post("/", upload.single("excelFile"), uploadFile);

module.exports = router;
