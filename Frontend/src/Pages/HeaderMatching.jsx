import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
const HeaderMatching = () => {
  const [predefinedHeader, setPreDefinedHeader] = useState([
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
  ]);
  const [uploadedHeader, setUploadedHeader] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState({});

  const location = useLocation();
  const [submitLoading, setSubmitLoading] = useState(false);

  const { jsonData, file } = location.state || {};
  const navigate = useNavigate();
  useEffect(() => {
    const { csvHeaders } = jsonData;
    setUploadedHeader(csvHeaders);
  }, []);
  function validateHeaderMapping(headerMapping) {
    const totalKeys = 13; // Expected number of indices

    // Check if the object has all required indices
    const keys = Object.keys(headerMapping);
    console.log(keys.length);
    if (keys.length !== totalKeys) {
      return {
        isValid: false,
        message: `Header mapping must contain exactly ${totalKeys} keys.`,
      };
    }

    // Check if all indices have non-empty values
    const values = Object.values(headerMapping);
    if (
      values.includes("") ||
      values.includes(null) ||
      values.includes(undefined)
    ) {
      return {
        isValid: false,
        message: "All indices in the header mapping must be filled.",
      };
    }

    // Check if all values are unique
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
      return {
        isValid: false,
        message: "All values in the header mapping must be unique.",
      };
    }

    // If all checks pass
    return {
      isValid: true,
      message: "Header mapping is valid.",
    };
  }
  // console.log(state);
  // Handle change event for each select
  const handleCsvHeaderChange = (key, value) => {
    // Check if the value is already present in uploadedHeader
    // if (!uploadedHeader.includes(value)) {
    //   setUploadedHeader((prev) => [...prev, value]); // Add the value if not present
    // }

    // Update selected headers
    setSelectedHeaders((prev) => ({
      ...prev,
      [key]: value, // Update only the relevant key
    }));

    // Remove any previous selection of this key if changed
    // setUploadedHeader((prev) =>
    //   prev.filter((item) => item != value)
    // );
  };

  const submitHandler = async () => {
    const val = validateHeaderMapping(selectedHeaders);
    if (!val.isValid) {
      toast.error(val.message);
      return;
    }
    setSubmitLoading(true);
    const formData = new FormData();
    formData.append("excelFile", file);
    formData.append("matchedHeader", JSON.stringify(selectedHeaders));
    try {
      const response = await axios.post(
        "http://localhost:7000/upload/uploadwithmatchedheader",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );
      const blob = response.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "processed_data.xlsx"; // Set the name of the file to be downloaded
      link.click(); // Trigger download

      // Optionally, you can clean up the link element after download
      URL.revokeObjectURL(link.href);

      // On successful upload
      navigate("/", { replace: true });
      toast.success("File uploaded and downloaded successfully!");
      console.log(response);
    } catch (error) {
      if (error?.response?.status === 400) {
        error.response.data
          .text()
          .then((text) => {
            const jsonData = JSON.parse(text);
            // navigate("/headermatching", { state: jsonData, file: file });
            console.log(jsonData); // Logs the parsed JSON object
          })
          .catch((error) => {
            console.error("Error parsing Blob to JSON:", error);
          });
      }
      console.error("Error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };
  // console.log(uploadedHeader);
  return (
    <div>
      <div
        className="min-h-[100dvh] overflow-y-auto overflow-x-auto flex justify-center items-center templatemapping pt-10 pb-5 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bgcolor.jpg')" }}
      >
        <div className="w-[900px] bg-white p-6 rounded-lg shadow-md relative">
          <h1 className="text-blue-800 text-4xl text-center mb-10">Mapping</h1>
          <div className="relative">
            <div>
              <div className="flex w-full justify-around mb-4">
                <div className="w-1/3 text-center">
                  <label className="block text-xl text-black font-semibold">
                    Result CSV/Excel Header
                  </label>
                </div>
                <div className="w-1/3 text-center">
                  <label className="block text-xl text-black font-semibold">
                    Uploaded CSV/Excel Header
                  </label>
                </div>
              </div>
              <div className="h-[50vh] overflow-y-auto">
                {Array.from({ length: 13 }).map((csvHeader, index) => {
                  return (
                    <div
                      key={index}
                      className="flex w-full justify-around mb-3"
                    >
                      <div className="block w-1/3 py-1 me-10 text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                        <span>{predefinedHeader[index]}</span>
                      </div>
                      <div>----&gt;</div>
                      <select
                        className="block w-1/3 py-1 ms-10 text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        aria-label="Template Header"
                        onChange={(e) =>
                          handleCsvHeaderChange(index, e.target.value)
                        }
                        value={selectedHeaders[index] || ""}
                      >
                        <option disabled value="">
                          Select CSV Header Name
                        </option>
                        {uploadedHeader &&
                          uploadedHeader.map((template, idx) => (
                            <option key={idx} value={template}>
                              {template}
                            </option>
                          ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse items-center justify-center ">
            <button
              // onClick={() => {
              //   onMapSubmitHandler();
              // }}
              type="button"
              className={`my-3 ml-3 w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 bg-teal-600 text-base leading-6 font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:border-teal-700 focus:shadow-outline-teal transition ease-in-out duration-150 sm:text-sm sm:leading-5 ${
                submitLoading ? "cursor-not-allowed" : ""
              }`}
              disabled={submitLoading}
              onClick={submitHandler}
            >
              {submitLoading ? (
                <div className="flex items-center space-x-2">
                  {/* Tailwind CSS spinner */}
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Submit and Process"
              )}
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default HeaderMatching;
