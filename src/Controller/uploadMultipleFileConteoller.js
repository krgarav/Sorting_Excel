const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const targetDirectory = "./result"; // Target directory to move files
const filePaths = "uploads/";
// Ensure target directory exists
if (!fs.existsSync(targetDirectory)) {
  fs.mkdirSync(targetDirectory, { recursive: true });
}
if (!fs.existsSync(filePaths)) {
  fs.mkdirSync(filePaths, { recursive: true });
}
const multipleUploadFile = (req, res) => {
  try {
    const { matchedHeader } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!matchedHeader) {
      return res.status(400).json({ message: "No matchedHeader provided" });
    }

    // Parse the JSON string into an object
    const parsedMatchedHeader = JSON.parse(matchedHeader);
    const parsedData = [];
    const filePath = filePaths + req.file.filename;
    const fileExtension = path.extname(req.file.filename).toLowerCase();

    const predefinedHeader = [
      "SR_NO",
      "NAME",
      "FATHER_NAME",
      "CLASS_CODE",
      "SECTION",
      "SCHOOL_CODE",
      "SCHOOL",
      "TEHSIL",
      "CITY_NAME",
      "STATE_NAME",
      "IMAGE",
      "TOTAL_MARKS",
      "YEAR",
    ];
    const generateExcel = async (data) => {
      // const targetDirectory = path.join(__dirname, "../result");
      // if (!fs.existsSync(targetDirectory)) {
      //   fs.mkdirSync(targetDirectory, { recursive: true });
      // }

      const currentTime = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace("T", "_")
        .split(".")[0];
      const excelFilePath = path.join(targetDirectory, `processed_data.xlsx`);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Processed Data");

      const headers = [
        { header: "SL_NO", key: "SL_NO", width: 10 },
        { header: "ROLL_NO", key: "ROLL_NO", width: 10 },
        { header: "NAME", key: "NAME", width: 20 },
        { header: "FATHER_NAME", key: "FATHER_NAME", width: 20 },
        { header: "CLASS", key: "CLASS_CODE", width: 10 },
        { header: "SECTION", key: "SECTION", width: 10 },
        { header: "SCHOOL", key: "SCHOOL", width: 20 },
        { header: "TEHSIL", key: "TEHSIL", width: 15 },
        { header: "50 OR LESS", key: "50 OR LESS", width: 12 },
        { header: "51-80", key: "51-80", width: 12 },
        { header: "81+", key: "81+", width: 12 },
        { header: "HEADER", key: "HEADER", width: 20 },
        { header: "DISTRICT", key: "DISTRICT", width: 15 },
        { header: "STATE", key: "STATE", width: 15 },
        { header: "YEAR", key: "YEAR", width: 10 },
      ];

      worksheet.columns = headers;

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "008000" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.alignment = { horizontal: "center" };
      });

      data.forEach((row) => {
        worksheet.addRow(row);
      });

      await workbook.xlsx.writeFile(excelFilePath);

      return res.download(excelFilePath, "processed_data.xlsx", (err) => {
        if (err) {
          return res.status(500).json({
            message: "Error downloading file",
            error: err.message,
          });
        }
      });
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

          // Ensure SCHOOL_CODE is always 3 digits (e.g., 001, 023)
          // school_code = String(school_code).padStart(3, "0");

          // Directly update the current row in data
          row["SL_NO"] = serial_no + "0";
          row["ROLL_NO"] = serial_no;
          row["50 OR LESS"] = fiftyMarks;
          row["51-80"] = fiftyToEightyMarks;
          row["81+"] = moreThanEightyMarks;
          row["DISTRICT"] = district;
          row["STATE"] = state;
          row["YEAR"] = year;
          row["CLASS_CODE"] = class_code;
          row["SCHOOL_CODE"] = school_code;
        } catch (error) {
          console.error(`Error processing row: ${error.message}`);
        }
      });

      data.sort((a, b) => {
        // Compare TEHSIL as strings
        if (a.TEHSIL !== b.TEHSIL) {
          return a.TEHSIL.localeCompare(b.TEHSIL); // Sort by TEHSIL (string comparison)
        }

        // Compare SCHOOL_CODE as numbers
        if (a.SCHOOL_CODE !== b.SCHOOL_CODE) {
          return a.SCHOOL_CODE - b.SCHOOL_CODE; // Sort by SCHOOL_CODE (numeric comparison)
        }

        // Compare CLASS as numbers or strings (depends on your data type)
        if (a.CLASS_CODE !== b.CLASS_CODE) {
          return a.CLASS_CODE - b.CLASS_CODE; // Sort by CLASS_CODE (numeric comparison if CLASS is a number)
        }

        // Compare TOTAL_MARKS as numbers
        if (a.TOTAL_MARKS !== b.TOTAL_MARKS) {
          return b.TOTAL_MARKS - a.TOTAL_MARKS; // Sort by TOTAL_MARKS (High to Low)
        }

        // Compare ROLL_NO as numbers (assuming it's a numeric field)
        return a.ROLL_NO - b.ROLL_NO; // Sort by ROLL_NO (Low to High)
      });

      let prevHeader = null;
      let count = 1;

      // Modify the current data array with sequential numbers and headers
      data.forEach((item) => {
        if (item.SCHOOL_CODE !== prevHeader) count = 1;

        item.SL_NO = count;
        item.HEADER = `${item.SCHOOL_CODE}/${count}`;
        count++;
        prevHeader = item.SCHOOL_CODE;
      });

      // Clean up unnecessary fields (TOTAL_MARKS, SCHOOL_CODE)
      data.forEach((item) => {
        delete item.TOTAL_MARKS;
        delete item.SCHOOL_CODE;
      });

      // Return the updated data
      return data;
    };
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
    // if (fileExtension === ".csv") {
    //   fs.createReadStream(filePath)
    //     .pipe(csvParser())
    //     .on("data", (row) => {
    //         console.log(row)
    //       // Map the row keys based on the predefined header
    //       let mappedRow = {};

    //       // Iterate over the predefined header and map the values from row to the new keys
    //       predefinedHeader.forEach((header, index) => {
    //         // Assuming the original row keys are based on index (like 0, 1, 2,...)
    //         const originalKey = index.toString(); // Convert the index to string (since csv-parser uses index strings as keys)

    //         if (row[originalKey] !== undefined) {
    //           // Assign the value from the original row to the mapped row using the new header
    //           mappedRow[header] = row[originalKey];
    //         }
    //       });

    //       // Push the mapped row to parsedData
    //       parsedData.push(mappedRow);
    //       console.log(parsedData)
    //     })
    //     .on("end", () => {
    //       try {
    //         console.log(parsedData)
    //         // validateHeaders(parsedData);
    //         // const processedData = processParsedData(parsedData);
    //         // generateExcel(processedData);
    //       } catch (error) {
    //         if (!res.headersSent) {
    //           return res.status(400).json({
    //             success: "false",
    //             message: error.message,
    //             csvHeaders,
    //           });
    //         }
    //       }
    //     })
    //     .on("error", (error) => {
    //       if (!res.headersSent) {
    //         return res.status(500).json({
    //           success: "false",
    //           message: "Error processing file",
    //           error: error.message,
    //           csvHeaders,
    //         });
    //       }
    //     });
    // }
    // res.json({
    //   success: true,
    //   matchedHeader: parsedMatchedHeader,
    // });

    if (fileExtension === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => parsedData.push(row))
        .on("end", () => {
          try {
            validateHeaders(parsedData);
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
        const data = parseExcelFile(filePath); // Parsed data from Excel file
        let parsedData = []; // Initialize an array to store mapped rows

        data.forEach((row, rowIndex) => {
          let mappedRow = {}; // Initialize a new object for the mapped row

          // Iterate over the predefinedHeader and map values based on parsedMatchedHeader
          predefinedHeader.forEach((key, index) => {
            //  console.log(key);
            //  return
            const mappedKey = parsedMatchedHeader[index]; // Get the corresponding key from parsedMatchedHeader

            // return
            if (row[mappedKey] !== undefined) {
              mappedRow[key] = row[mappedKey]; // Assign the value to the new key
            } else {
              console.warn(
                `Row ${
                  rowIndex + 1
                }: Missing value for key "${key}" mapped from "${mappedKey}"`
              );
            }
          });

          // Push the mapped row into parsedData
          parsedData.push(mappedRow);
        });

        // return
        // Validation: Check if all required headers are present
        // try {
        //   validateHeaders(parsedData);
        // } catch (error) {
        //   console.error("Header Validation Error:", error.message);
        //   throw error; // Re-throw the error to stop execution if validation fails
        // }

        // Generate Excel from the processed data
        generateExcel(processParsedData(parsedData));
      } catch (error) {
        if (!res.headersSent) {
          return res.status(300).json({
            success: "false",
            message: error.message,
            csvHeaders,
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
    console.log(error);
    res.status(500).json({ message: "Error uploading file", error });
  }
};

module.exports = multipleUploadFile;
