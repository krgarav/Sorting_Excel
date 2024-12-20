const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const targetDirectory = "./result"; // Target directory to move files
const filePaths = "uploads/";
const nameChange = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const parseExcelFile = (filePath) => {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });

      // Capture headers from the first row
      if (rows.length > 0) {
        csvHeaders = Object.keys(rows[0]);
      }

      return rows;
    };
    const generateExcel = async (data) => {
      if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
      }
      // Check if data is empty or undefined
      if (!data || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No data available to generate Excel file.",
        });
      }

      // Check if data[0] has the necessary properties
      if (!data[0].CITY_NAME || !data[0].STATE_NAME) {
        return res.status(400).json({
          success: false,
          message: "Missing required information (CITY_NAME or STATE_NAME).",
        });
      }
      const excelFilePath = path.join(targetDirectory, `processed_data.xlsx`);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Processed Data");

      const headers = [
        { header: "ROLL NO", key: "ROLL_NO", width: 10 },
        { header: "SCHOOL_CODE", key: "SCHOOL_CODE", width: 15 },
        { header: "SCHOOL/COLLEGE", key: "SCHOOL", width: 50 },
        { header: "NAME", key: "NAME", width: 30 },
        { header: "FATHER_NAME", key: "FATHER_NAME", width: 30 },
        { header: "CLASS", key: "CLASS", width: 10 },
        { header: "SECTION", key: "SECTION", width: 15 },
        { header: "MARKS", key: "MARKS", width: 10 },
        { header: "STATUS", key: "STATUS", width: 10 },
      ];

      worksheet.columns = headers;

      // Add the extra top row for district and state
      worksheet.mergeCells(1, 1, 1, headers.length); // Merge from first to last column
      const extraRow = worksheet.getRow(1);
      extraRow.getCell(
        1
      ).value = `DISTRICT: ${data[0]["CITY_NAME"]}AMETHI, STATE: ${data[0]["STATE_NAME"]}`;
      extraRow.font = { bold: true, size: 16, color: { argb: "black" } };
      extraRow.alignment = { horizontal: "center", vertical: "middle" };
      extraRow.height = 20; // Optional: Adjust row height

      // Add headers on the second row
      worksheet.addRow(headers.map((header) => header.header));
      const headerRow = worksheet.getRow(2);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "black" } };
        cell.alignment = { horizontal: "center" };
      });

      // Find the maximum length of ROLL_NO
      const maxRollNoLength = data.reduce((max, row) => {
        const rollNoLength = row.ROLL_NO?.toString().length || 0;
        return Math.max(max, rollNoLength);
      }, 0);

      // Preprocess data to pad ROLL_NO to the maximum length
      const formattedData = data.map((row) => {
        const formattedRow = { ...row };
        if (row.ROLL_NO) {
          formattedRow.ROLL_NO = row.ROLL_NO.toString().padStart(
            maxRollNoLength,
            "0"
          );
        }
        return formattedRow;
      });

      // Add data rows starting from row 3
      formattedData.forEach((row) => {
        const formattedRow = {};
        for (const key in row) {
          formattedRow[key] = row[key]?.toString() || ""; // Ensure all values are strings
        }
        worksheet.addRow(formattedRow);
      });

      // Set ROLL_NO column as text to preserve leading zeros
      worksheet
        .getColumn("ROLL_NO")
        .eachCell({ includeEmpty: true }, (cell) => {
          cell.numFmt = "@"; // Ensure Excel treats the column as text
        });
      // Set all columns as text
      worksheet.columns.forEach((column) => {
        column.eachCell({ includeEmpty: true }, (cell) => {
          cell.numFmt = "@"; // Ensure Excel treats all cells in the column as text
        });
      });
      await workbook.xlsx.writeFile(excelFilePath);

      return res.status(200).json({
        success: true,
        message: "Successfully converted the excel file",
      });
      // return res.download(excelFilePath, "processed_data.xlsx", (err) => {
      //   if (err) {
      //     return res.status(500).json({
      //       message: "Error downloading file",
      //       error: err.message,
      //     });
      //   }
      // });
    };

    const processParsedData = (data) => {
      data.forEach((row, index) => {
        try {
          const serial_no = row["SR_NO"];
          const name = row["NAME"];
          const fatherName = row["FATHER_NAME"];
          const class_code = row["CLASS_CODE"];
          const section = row["SECTION"];
          const school = row["SCHOOL"];
          const tehsil = row["TEHSIL"];
          const district = row["CITY_NAME"];
          const state = row["STATE_NAME"];
          const year = row["YEAR"];
          const totalMarks = parseInt(row["TOTAL_MARKS"] || 0);

          // Check if any required field is missing or undefined
          if (
            typeof name === "undefined" ||
            typeof fatherName === "undefined" ||
            typeof class_code === "undefined" ||
            typeof section === "undefined" ||
            typeof school === "undefined" ||
            typeof tehsil === "undefined" ||
            typeof district === "undefined" ||
            typeof state === "undefined" ||
            typeof year === "undefined"
          ) {
            // Early return to stop further processing
            return res.status(404).json({
              success: "false",
              message: "Header not found. Some required fields are missing.",
            });
          }

          const fiftyMarks = totalMarks <= 50 ? "*" : "";
          const fiftyToEightyMarks =
            totalMarks >= 51 && totalMarks <= 80 ? "*" : "";
          const moreThanEightyMarks = totalMarks >= 81 ? "*" : "";

          let school_code = row["SCHOOL_CODE"];
          if (typeof school_code === "undefined") {
            // Early return to stop further processing
            return res
              .status(404)
              .json({ success: "false", message: "SCHOOL_CODE is missing." });
          }
          school_code = String(school_code).padStart(4, "0");
          // Directly update the current row in data
          row["ROLL_NO"] = serial_no;
          row["SCHOOL_CODE"] = school_code;
          row["SCHOOL"] = school;
          row["NAME"] = name;
          row["fATHER_NAME"] = fatherName;
          row["CLASS"] = class_code;
          row["SECTION"] = section;
          row["MARKS"] = totalMarks;
          row["STATUS"] = "Y";
        } catch (error) {
          console.error(`Error processing row: ${error.message}`);
        }
      });

      data.sort((a, b) => {
        // Compare TEHSIL as strings
        if (a.TEHSIL !== b.TEHSIL) {
          return a.TEHSIL.localeCompare(b.TEHSIL); // Sort by TEHSIL (string comparison)
        }

        // Compare CLASS as numbers or strings (depends on your data type)
        if (a.CLASS_CODE !== b.CLASS_CODE) {
          return a.CLASS_CODE - b.CLASS_CODE; // Sort by CLASS_CODE (numeric comparison if CLASS is a number)
        }
      });
      // Clean up unnecessary fields (TOTAL_MARKS, SCHOOL_CODE)
      data.forEach((item) => {
        delete item.TEHSIL;
      });

      // Return the updated data
      return data;
    };
    const filePath = filePaths + req.file.filename;
    const fileExtension = path.extname(req.file.filename).toLowerCase();
    if (fileExtension === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => parsedData.push(row))
        .on("end", () => {
          try {
            const processedData = processParsedData(parsedData);
            generateExcel(processedData);
          } catch (error) {
            if (!res.headersSent) {
              return res.status(400).json({
                success: "false",
                message: error.message,
                csvHeaders,
              });
            }
          }
        })
        .on("error", (error) => {
          if (!res.headersSent) {
            return res.status(500).json({
              success: "false",
              message: "Error processing file",
              error: error.message,
              csvHeaders,
            });
          }
        });
    } else if (fileExtension === ".xls" || fileExtension === ".xlsx") {
      try {
        const data = parseExcelFile(filePath);
        generateExcel(processParsedData(data));
      } catch (error) {
        if (!res.headersSent) {
          return res.status(300).json({
            success: "false",
            message: error.message,
          });
        }
      }
    } else {
      return res.status(400).json({
        success: "false",
        message: "Unsupported file type",
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = nameChange;
