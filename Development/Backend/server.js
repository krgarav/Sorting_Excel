const express = require("express");
const app = express();
const PORT = 7000;
const cors = require("cors");
const path = require("path");

// Import routes
const fileRoutes = require("./Routes/fileRoute");

// Path to frontend build
const builtPath = path.join("../", "./Frontend", "dist");

app.use(express.static(builtPath));
app.use(cors());

// Use file upload routes
app.use("/upload", fileRoutes);

// Serve React's index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(builtPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
