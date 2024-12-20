const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");
const fs = require("fs");

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

// Convert Excel to CSV
const convertExcelToCsv = (filePath, outputDir) => {
  try {
    const workbook = xlsx.readFile(filePath);
    workbook.SheetNames.forEach((sheetName) => {
      const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      const outputFileName = path.join(outputDir, `${sheetName}.csv`);
      fs.writeFileSync(outputFileName, csvData, "utf8");
      console.log(`Converted ${sheetName} to CSV: ${outputFileName}`);
    });
  } catch (error) {
    console.error("Error converting Excel to CSV:", error.message);
  }
};

module.exports = {
  upload,
  handleFileConversion: (req, res) => {
    if (req.file) {
      const filePath = path.join(__dirname, "uploads", req.file.filename);
      const outputDir = path.join(__dirname, "uploads/csv");

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Check file extension
      const ext = path.extname(req.file.filename).toLowerCase();
      if (ext === ".xls" || ext === ".xlsx") {
        convertExcelToCsv(filePath, outputDir);
      }

      res.status(200).json({ message: "File uploaded and converted (if needed)." });
    } else {
      res.status(400).json({ error: "No file uploaded or invalid file type." });
    }
  },
};
