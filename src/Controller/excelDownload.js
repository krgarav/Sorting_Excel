const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const jsPDF = require("jspdf");
const express = require("express");
const multer = require("multer");
// Path to the existing Excel file
const excelFilePath = "./result/processed_data.xlsx";
const downloadExcel = (req, res) => {
  // Check if the file exists
  if (fs.existsSync(excelFilePath)) {
    // Use fs.readFile to read the file
    fs.readFile(excelFilePath, (err, data) => {
      if (err) {
        return res.status(500).json({
          message: "Error reading the Excel file",
          error: err.message,
        });
      }

      // Set the appropriate headers for downloading the file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=processed_data.xlsx"
      );

      // Send the file as a download
      res.send(data);
    });
  } else {
    return res.status(404).json({
      message: "File not found",
    });
  }
};

module.exports = downloadExcel;
