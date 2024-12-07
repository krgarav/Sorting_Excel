const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

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
const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = filePaths + req.file.filename;
    const parsedData = []; // Array to store parsed rows
    // Read and parse the CSV file
    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        try {
          let sl_count = 1;

          // Extract required fields
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
          const totalMarks = parseInt(row["TOTAL_MARKS"]);

          const fiftyMarks = totalMarks <= 50 ? "*" : "";
          const fiftyToEightyMarks =
            totalMarks >= 51 && totalMarks <= 80 ? "*" : "";
          const moreThanEightyMarks = totalMarks >= 81 ? "*" : "";

          // Push the parsed row into the array
          const school_code = row["SCHOOL_CODE"];
          parsedData.push({
            SL_NO: serial_no + "0",
            ROLL_NO: serial_no,
            NAME: name,
            FATHER_NAME: fatherName,
            CLASS: class_code,
            SECTION: section,
            SCHOOL: school,
            TEHSIL: tehsil,
            "50 OR LESS": fiftyMarks,
            "51-80": fiftyToEightyMarks,
            "81+": moreThanEightyMarks,
            DISTRICT: district,
            STATE: state,
            YEAR: year,
            TOTAL_MARKS: totalMarks,
            SCHOOL_CODE: school_code,
            // Add this field for sorting
          });
        } catch (error) {
          console.error(`Error processing row ${row}: ${error.message}`);
        }
      })
      .on("end", () => {
        // Sort the data based on multiple fields
        parsedData.sort((a, b) => {
          if (a.TEHSIL !== b.TEHSIL) {
            return a.TEHSIL.localeCompare(b.TEHSIL); // Sort by TEHSIL
          }
          if (a.SCHOOL_CODE !== b.SCHOOL_CODE) {
            return a.SCHOOL_CODE.localeCompare(b.SCHOOL_CODE); // Sort by SCHOOL_CODE
          }
          if (a.CLASS !== b.CLASS) {
            return a.CLASS.localeCompare(b.CLASS); // Sort by CLASS_CODE
          }
          if (a.TOTAL_MARKS !== b.TOTAL_MARKS) {
            return b.TOTAL_MARKS - a.TOTAL_MARKS; // Sort by TOTAL_MARKS (High to Low)
          }
          return a.ROLL_NO - b.ROLL_NO; // Sort by SR_NO (Low to High)
        });

        // Initialize a variable to keep track of the previous HEADER value
        let prevHeader = null;
        let count = 1;

        parsedData.forEach((item) => {
          // Reset count when a new HEADER (SCHOOL_CODE) is encountered
          if (item.SCHOOL_CODE !== prevHeader) {
            count = 1; // Reset count for a new header group
          }

          // Assign SL_NO and HEADER
          item.SL_NO = count;
          item.HEADER = `${item.SCHOOL_CODE}/${count}`;
          console.log(`${item.SCHOOL_CODE}/${count}`);
          // Increment count for the next item in the group
          count++;

          // Update previous HEADER for the next comparison
          prevHeader = item.SCHOOL_CODE;
        });
        parsedData.forEach((item) => {
          // Check some condition if needed (e.g., item.TOTAL_MARKS, item.SCHOOL_CODE, etc.)
          // If the condition is met, delete the properties
          if (item.TOTAL_MARKS) {
            delete item.TOTAL_MARKS; // Delete TOTAL_MARKS property
          }
          if (item.SCHOOL_CODE) {
            delete item.SCHOOL_CODE; // Delete SCHOOL_CODE property
          }
        });
        // Generate CSV filecls
        try {
          const csvFilePath = path.join(targetDirectory, "processed_data.csv");

          // Define the desired order of columns (place HEADER before DISTRICT)
          const columnOrder = [
            "SL_NO",
            "ROLL_NO",
            "NAME",
            "FATHER_NAME",
            "CLASS",
            "SECTION",
            "SCHOOL",
            "TEHSIL",
            "50 OR LESS",
            "51-80",
            "81+",
            "HEADER",
            "DISTRICT",
            "STATE",
            "YEAR",
          ];

          // Function to rearrange the columns based on columnOrder
          const rearrangedData = parsedData.map((row) => {
            const reorderedRow = {};
            columnOrder.forEach((key) => {
              if (row.hasOwnProperty(key)) {
                reorderedRow[key] = row[key]; // Add the value from the row in the correct order
              }
            });
            return reorderedRow;
          });

          // Generate CSV headers based on the rearranged data
          const headers = columnOrder.join(",") + "\n"; // Generate CSV headers

          // Generate CSV rows
          const rows = rearrangedData
            .map((row) =>
              Object.values(row)
                .map((value) => `"${value}"`) // Quote each value to handle special characters
                .join(",")
            )
            .join("\n"); // Generate CSV rows

          const csvContent = headers + rows; // Combine headers and rows
          fs.writeFileSync(csvFilePath, csvContent); // Write CSV file

          // Send the CSV file for download
          res.download(csvFilePath, "processed_data.csv", (err) => {
            if (err) {
              res.status(500).json({
                message: "Error downloading file",
                error: err.message,
              });
            }
          });
        } catch (csvError) {
          res.status(500).json({
            message: "Error creating CSV file",
            error: csvError.message,
          });
        }
      })
      .on("error", (error) => {
        res.status(500).json({
          message: "Error processing file",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading file",
      error: error.message,
    });
  }
};

module.exports = { uploadFile };
