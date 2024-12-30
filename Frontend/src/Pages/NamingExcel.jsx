import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
// import "./App.css";
import UploadBtn from "../Component/UploadBtn";
import "react-toastify/dist/ReactToastify.css";
// Inline styles
import axios from "axios";
import "./Mainpage.css";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../Component/Loader";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx";
const styles = {
  container: {
    width: "400px",
    padding: "20px",
    background: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    textAlign: "center",
    margin: "auto",
    marginTop: "10rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  fileInput: {
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    border: "none",
    borderRadius: "5px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "10px",
    width: "100%",
  },
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#454545",
    minHeight: "100vh",
    backgroundImage: "url('/bgcolor.jpg')", // Reference the image in the public folder
    backgroundSize: "cover", // Ensure the image covers the entire background
    backgroundPosition: "center", // Center the image
    backgroundRepeat: "no-repeat", // Avoid repeating the image
  },
  fileInputDiv: {
    display: "flex",
    flexDirection: "column",
    color: "black",
    margin: "10px",
  },
  h2: {
    fontSize: "80px",
  },
};
const NamingExcel = () => {
  const [file, setFile] = useState(null);
  const [directoryPath, setDirectoryPath] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [show, setShow] = useState(false);
  const [sheetName, setSheetName] = useState(0);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();
  // Handle file input change
  const handlePdfDownload = async () => {
    try {
      const res = await axios.get("http://localhost:7000/upload/downloadPdf", {
        responseType: "blob",
      });

      const blob = res.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "processed_data.pdf"; // Set the name of the file to be downloaded
      link.click(); // Trigger download

      // Optionally, you can clean up the link element after download
      URL.revokeObjectURL(link.href);
    } catch (error) {
      toast.error("An error occurred while processing the file.");
    }
  };
  const handleExcelDownload = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/upload/downloadExcel",
        { responseType: "blob" }
      );
      console.log(res);
      const blob = res.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "processed_data.xlsx"; // Set the name of the file to be downloaded
      link.click(); // Trigger download

      // Optionally, you can clean up the link element after download
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while processing the file.");
    }
  };
  const handleFileChange = (data) => {
    const selectedFile = data;
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
    } else {
      setFile(null);
      setMessage("Please select a valid CSV/Excel file.");
    }
  };
  // Handle file upload (simulated)
  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected!!!");
      return;
    }

    try {
      setIsProcessing(true);
      if (!file) {
        toast.error("Please provide both a file and a directory path.");
        return;
      }

      const formData = new FormData();
      formData.append("excelFile", file);
      formData.append("sheetName", sheetName);

      const res = await axios.post(
        "http://localhost:7000/upload/uploadandProcessData",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      setShow(true);
    } catch (error) {
      // On error, display toast and log error to console
      toast.error("An error occurred while processing the file.");
      if (error?.response?.status === 300) {
        error.response.data
          .text()
          .then((text) => {
            const jsonData = JSON.parse(text);
            navigate("/headermatching", { state: { jsonData, file } });
            console.log(jsonData); // Logs the parsed JSON object
          })
          .catch((error) => {
            console.error("Error parsing Blob to JSON:", error);
          });
      }
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2
          style={{
            color: "black",
            fontSize: "2.0rem",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          {location.state.title}
        </h2>
        <form style={styles.form}>
          <UploadBtn
            onChange={(data) => {
              handleFileChange(data);
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              margin: "10px 0",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#f9f9f9",
            }}
          >
            <label
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Enter sheet name
            </label>
            <input
              type="text"
              style={{
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
                boxSizing: "border-box",
              }}
              value={sheetName}
              onChange={(event) => {
                setSheetName(event.target.value);
              }}
            />
            <small>Leave blank for default sheet name</small>
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={isProcessing}
            style={styles.button}
          >
            {isProcessing ? "Uploading And Processing" : "Upload And Process"}
          </button>
        </form>
        {message && <p style={{ marginTop: 20, color: "green" }}>{message}</p>}
        <div>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "orangered",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "10px",
              // width: "100%",
            }}
            onClick={() => {
              navigate("/", { replace: "true" });
            }}
          >
            Return to home
          </button>
        </div>
      </div>
      <ToastContainer />
      {isProcessing && (
        <div
          style={{
            position: "fixed", // Fixed position to cover the entire viewport
            top: 0,
            left: 0,
            width: "100vw", // Full width of the viewport
            height: "100vh", // Full height of the viewport
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
            display: "flex", // Flexbox to center the loader
            justifyContent: "center", // Center horizontally
            alignItems: "center", // Center vertically
            zIndex: 9999, // Ensure it's above all other content
            pointerEvents: "none", // Prevent interactions with elements below
          }}
        >
          <Loader />
        </div>
      )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Download Processed File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Click Below to download pdf or excel file!
          <div className="d-flex justify-content-start">
            {/* PDF Button with Bootstrap Icons */}
            <button onClick={handlePdfDownload} className="btn btn-danger me-2">
              <i className="bi bi-file-earmark-pdf me-2"></i>
              PDF
            </button>

            {/* Excel Button with Bootstrap Icons */}
            <button onClick={handleExcelDownload} className="btn btn-success">
              <i className="bi bi-file-earmark-excel me-2"></i>
              EXCEL
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NamingExcel;
