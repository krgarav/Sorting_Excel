const fs = require("fs");
const XLSX = require("xlsx");
const jsPDF = require("jspdf").jsPDF; // Correct jsPDF import
require("jspdf-autotable");

const convertExcelToPDF = (req, res) => {
  // Path to the Excel file
  const excelFilePath = "./result/processed_data.xlsx";

  // Read the uploaded Excel file
  const data = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(data, { type: "buffer" });

  // Assuming the first sheet contains the data we want
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert the sheet to a JSON object (rows as arrays)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: "landscape", // Portrait orientation
    unit: "pt",
    format: "letter", // Letter size (8.5 x 11 inches)
  });

  // Add a title to the PDF
  pdf.setFontSize(12);
  //   pdf.text("Converted Excel Data", 40, 40);

  // Ensure jsonData has at least one row
  if (jsonData.length === 0) {
    return res.status(404).json({ message: "No data found in the Excel file" });
  }

  // Manually define headers (adjust based on your actual columns)
  const headers = [
    "ROLL NO",
    "SCHOOL CODE",
    "SCHOOL/COLLEGE",
    "NAME",
    "FATHER NAME",
    "CLASS",
    "SECTION",
    "MARKS",
    "STATUS",
  ];

  // Extract the data rows (everything except the first row)
  const dataRows = jsonData.slice(2);

  // Check if headers are valid and data is not empty
  if (!headers || headers.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid headers in the Excel file" });
  }
  // console.log(dataRows);
  // Ensure that rows are not empty
  if (dataRows.length === 0) {
    return res
      .status(400)
      .json({ message: "No data rows found in the Excel file" });
  }
  dataRows.forEach((item) => {
    if (item[2].length > 100) {
      // Truncate to 100 characters and add ellipsis
      item[2] = item[2].substring(0, 100) + "...";
    }
  });
  console.log(dataRows);
  // Use jsPDF-AutoTable to generate a table
  pdf.autoTable({
    head: [headers], // Use manually defined headers
    body: dataRows, // Use the data rows from Excel
    startY: 60,
    styles: { fontSize: 10 }, // Adjust font size
    margin: { left: 40, right: 40 }, // Set margins
    theme: "grid", // Optional: add grid for table
  });

  // Save the PDF to a buffer
  const pdfBuffer = pdf.output("arraybuffer");

  // Set the headers to download the PDF
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=converted_file.pdf"
  );
  res.send(Buffer.from(pdfBuffer));
};

module.exports = { convertExcelToPDF };
