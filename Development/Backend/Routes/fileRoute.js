const express = require("express");
const router = express.Router();

// Import the upload middleware and controller
const { upload } = require("../Middleware/uploadMiddleware");
const { uploadFile } = require("../Controller/fileController");
const multipleUploadFile = require("../Controller/uploadMultipleFileConteoller");
const nameChange = require("../Controller/nameChangeController");
const { convertExcelToPDF } = require("../Controller/excelTopdf");
const downloadExcel = require("../Controller/excelDownload");

// Define the file upload route
router.post("/", upload.single("excelFile"), uploadFile);
router.post(
  "/uploadwithmatchedheader",
  upload.single("excelFile"),
  multipleUploadFile
);
router.post("/uploadandProcessData", upload.single("excelFile"), nameChange);

router.get("/downloadPdf", convertExcelToPDF);
router.get("/downloadExcel", downloadExcel);
module.exports = router;
