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
// Controller for handling file upload and processing
// const uploadFile = (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const filePath = path.join(__dirname, "../uploads", req.file.filename);
//     const parsedData = []; // Array to store parsed rows
//     // Read and parse the CSV file
//     // Read and parse the CSV file
//     fs.createReadStream(filePath)
//       .pipe(csvParser())
//       .on("data", (row) => {
//         try {
//           let sl_count = 1;

//           // Extract required fields
//           const serial_no = row["SR_NO"];
//           const name = row["NAME"];
//           const fatherName = row["FATHER_NAME"];
//           const class_code = row["CLASS_CODE"];
//           const section = row["SECTION"];
//           const school = row["SCHOOL"];
//           const tehsil = row["TEHSIL"];
//           const district = row["CITY_NAME"];
//           const state = row["STATE_NAME"];
//           const year = row["YEAR"];
//           const totalMarks = parseInt(row["TOTAL_MARKS"]);

//           const fiftyMarks = totalMarks <= 50 ? "*" : "";
//           const fiftyToEightyMarks =
//             totalMarks >= 51 && totalMarks <= 80 ? "*" : "";
//           const moreThanEightyMarks = totalMarks >= 81 ? "*" : "";

//           // Push the parsed row into the array
//           const school_code = row["SCHOOL_CODE"];
//           parsedData.push({
//             SL_NO: serial_no + "0",
//             ROLL_NO: serial_no,
//             NAME: name,
//             FATHER_NAME: fatherName,
//             CLASS: class_code,
//             SECTION: section,
//             SCHOOL: school,
//             TEHSIL: tehsil,
//             "50 OR LESS": fiftyMarks,
//             "51-80": fiftyToEightyMarks,
//             "81+": moreThanEightyMarks,
//             DISTRICT: district,
//             STATE: state,
//             YEAR: year,
//             TOTAL_MARKS: totalMarks,
//             SCHOOL_CODE: school_code,
//             // Add this field for sorting
//           });
//         } catch (error) {
//           console.error(`Error processing row ${row}: ${error.message}`);
//         }
//       })
//       .on("end", () => {
//         // Sort the data based on multiple fields
//         parsedData.sort((a, b) => {
//           if (a.TEHSIL !== b.TEHSIL) {
//             return a.TEHSIL.localeCompare(b.TEHSIL); // Sort by TEHSIL
//           }
//           if (a.SCHOOL_CODE !== b.SCHOOL_CODE) {
//             return a.SCHOOL_CODE.localeCompare(b.SCHOOL_CODE); // Sort by SCHOOL_CODE
//           }
//           if (a.CLASS !== b.CLASS) {
//             return a.CLASS.localeCompare(b.CLASS); // Sort by CLASS_CODE
//           }
//           if (a.TOTAL_MARKS !== b.TOTAL_MARKS) {
//             return b.TOTAL_MARKS - a.TOTAL_MARKS; // Sort by TOTAL_MARKS (High to Low)
//           }
//           return a.ROLL_NO - b.ROLL_NO; // Sort by SR_NO (Low to High)
//         });

//         // Initialize a variable to keep track of the previous HEADER value
//         let prevHeader = null;
//         let count = 1;

//         parsedData.forEach((item) => {
//           // Reset count when a new HEADER (SCHOOL_CODE) is encountered
//           if (item.SCHOOL_CODE !== prevHeader) {
//             count = 1; // Reset count for a new header group
//           }

//           // Assign SL_NO and HEADER
//           item.SL_NO = count;
//           item.HEADER = `${item.SCHOOL_CODE}/${count}`;
//           // Increment count for the next item in the group
//           count++;

//           // Update previous HEADER for the next comparison
//           prevHeader = item.SCHOOL_CODE;
//         });
//         parsedData.forEach((item) => {
//           // Check some condition if needed (e.g., item.TOTAL_MARKS, item.SCHOOL_CODE, etc.)
//           // If the condition is met, delete the properties
//           if (item.TOTAL_MARKS) {
//             delete item.TOTAL_MARKS; // Delete TOTAL_MARKS property
//           }
//           if (item.SCHOOL_CODE) {
//             delete item.SCHOOL_CODE; // Delete SCHOOL_CODE property
//           }
//         });
//         // Generate CSV filecls
//         try {
//           const csvFilePath = path.join(targetDirectory, "processed_data.csv");

//           // Define the desired order of columns (place HEADER before DISTRICT)
//           const columnOrder = [
//             "SL_NO",
//             "ROLL_NO",
//             "NAME",
//             "FATHER_NAME",
//             "CLASS",
//             "SECTION",
//             "SCHOOL",
//             "TEHSIL",
//             "50 OR LESS",
//             "51-80",
//             "81+",
//             "HEADER",
//             "DISTRICT",
//             "STATE",
//             "YEAR",
//           ];

//           // Function to rearrange the columns based on columnOrder
//           const rearrangedData = parsedData.map((row) => {
//             const reorderedRow = {};
//             columnOrder.forEach((key) => {
//               if (row.hasOwnProperty(key)) {
//                 reorderedRow[key] = row[key]; // Add the value from the row in the correct order
//               }
//             });
//             return reorderedRow;
//           });

//           // Generate CSV headers based on the rearranged data
//           const headers = columnOrder.join(",") + "\n"; // Generate CSV headers

//           // Generate CSV rows
//           const rows = rearrangedData
//             .map((row) =>
//               Object.values(row)
//                 .map((value) => `"${value}"`) // Quote each value to handle special characters
//                 .join(",")
//             )
//             .join("\n"); // Generate CSV rows

//           const csvContent = headers + rows; // Combine headers and rows
//           fs.writeFileSync(csvFilePath, csvContent); // Write CSV file

//           // Send the CSV file for download
//           res.download(csvFilePath, "processed_data.csv", (err) => {
//             if (err) {
//               res.status(500).json({
//                 message: "Error downloading file",
//                 error: err.message,
//               });
//             }
//           });
//         } catch (csvError) {
//           res.status(500).json({
//             message: "Error creating CSV file",
//             error: csvError.message,
//           });
//         }
//       })
//       .on("error", (error) => {
//         res.status(500).json({
//           message: "Error processing file",
//           error: error.message,
//         });
//       });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error uploading file",
//       error: error.message,
//     });
//   }
// };

const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const expectedHeaders = [
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

    let csvHeaders = []; // Store headers of uploaded file

    const validateHeaders = (data) => {
      const fileHeaders = Object.keys(data[0]);
      csvHeaders = fileHeaders; // Capture headers of the uploaded file
      const missingHeaders = expectedHeaders.filter(
        (header) => !fileHeaders.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`
        );
      }
    };

    const generateExcel = async (data) => {
      // const targetDirectory = path.join(__dirname, "../result");
      if (!fs.existsSync(targetDirectory)) {
        fs.mkdirSync(targetDirectory, { recursive: true });
      }

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
    const filePath = filePaths + req.file.filename;
    const fileExtension = path.extname(req.file.filename).toLowerCase();
    const parsedData = [];

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

      // // Sort data as per the given logic
      // data.sort((a, b) => {
      //   const tehsilA = a.TEHSIL ? a.TEHSIL.toString() : "";
      //   const tehsilB = b.TEHSIL ? b.TEHSIL.toString() : "";

      //   const schoolCodeA = a.SCHOOL_CODE ? parseInt(a.SCHOOL_CODE, 10) : 0; // Convert to number
      //   const schoolCodeB = b.SCHOOL_CODE ? parseInt(b.SCHOOL_CODE, 10) : 0; // Convert to number

      //   const classA = a.CLASS ? a.CLASS.toString() : "";
      //   const classB = b.CLASS ? b.CLASS.toString() : "";

      //   // Compare tehsil
      //   if (tehsilA !== tehsilB) return tehsilA.localeCompare(tehsilB);

      //   // Compare schoolCode as number
      //   if (schoolCodeA !== schoolCodeB) return schoolCodeA - schoolCodeB; // Numerical comparison

      //   // Compare class
      //   if (classA !== classB) return classA.localeCompare(classB);

      //   // Compare totalMarks
      //   if (a.TOTAL_MARKS !== b.TOTAL_MARKS)
      //     return b.TOTAL_MARKS - a.TOTAL_MARKS;

      //   // Compare roll numbers
      //   return a.ROLL_NO - b.ROLL_NO;
      // });

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
        const data = parseExcelFile(filePath);
        validateHeaders(data);
        generateExcel(processParsedData(data));
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
    if (!res.headersSent) {
      return res.status(500).json({
        success: "false",
        message: "Error uploading file",
        error: error.message,
        csvHeaders,
      });
    }
  }
};

module.exports = { uploadFile };
