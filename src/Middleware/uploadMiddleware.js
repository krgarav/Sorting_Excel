const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename
  },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/vnd.ms-excel" || // .xls
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
    file.mimetype === "text/csv" || // .csv
    file.mimetype === "application/csv" // Some systems may use this
  ) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error("Invalid file type. Only Excel and CSV files are allowed!"),
      false
    ); // Reject file
  }
};

// Initialize multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = { upload };
