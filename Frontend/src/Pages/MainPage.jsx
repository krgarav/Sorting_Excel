import { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
// import "./App.css";
import UploadBtn from "../Component/UploadBtn";
import "react-toastify/dist/ReactToastify.css";
// Inline styles
import axios from "axios";
import "./Mainpage.css";
import { useNavigate } from "react-router-dom";
import Loader from "../Component/Loader";
const styles = {
  container: {
    width: "400px",
    padding: "20px",
    background: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    textAlign: "center",
    margin: "auto",
    marginTop: "50px",
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
  },
  fileInputDiv: {
    display: "flex",
    flexDirection: "column",
    color: "black",
    margin: "10px",
  },
};

function MainPage() {
  const [file, setFile] = useState(null);
  const [directoryPath, setDirectoryPath] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  // Handle file input change
  const handleFileChange = (data) => {
    const selectedFile = data;
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setMessage(""); // Clear previous messages
    } else {
      setFile(null);
      setMessage("Please select a valid CSV file.");
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
      formData.append("sourceDirectory", directoryPath); // Append directory path

      const res = await axios.post("http://localhost:7000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });
      // Create a download link for the file
      const blob = res.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "processed_data.csv"; // Set the name of the file to be downloaded
      link.click(); // Trigger download

      // Optionally, you can clean up the link element after download
      URL.revokeObjectURL(link.href);

      // On successful upload
      toast.success("File uploaded and downloaded successfully!");
      // navigate("/result", { state: res.data });
    } catch (error) {
      // On error, display toast and log error to console
      toast.error("An error occurred while processing the file.");
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={{ color: "black" }}>Upload and Process CSV</h2>
        <form style={styles.form}>
          <UploadBtn
            onChange={(data) => {
              handleFileChange(data);
            }}
          />
          {/* <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            // style={styles.fileInput}
          />
          <br /> */}
          {/* <div style={styles.fileInputDiv}>
            <label>Enter Directory Path</label>
            <input
              type="text"
              onChange={handleDirectoryChange}
              ref={directoryRef}
            />
          </div> */}
          <br />
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
    </div>
  );
}

export default MainPage;
