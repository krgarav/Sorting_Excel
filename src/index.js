const { app: electronApp, BrowserWindow } = require("electron");
const express = require("express");
const cors = require("cors");
const path = require("path");

// Create the Express app
const expressApp = express();
const PORT = 7000;

// Import routes
const fileRoutes = require("./Routes/fileRoute");

// Path to frontend build
const builtPath = path.join(__dirname, "../Frontend/dist");

// Express middleware
expressApp.use(express.static(builtPath));
expressApp.use(cors());
expressApp.use("/upload", fileRoutes);

// Serve React's index.html for all other routes
expressApp.get("*", (req, res) => {
  res.sendFile(path.join(builtPath, "index.html"));
});

// Start the Express server
expressApp.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle Electron-specific setup
const createWindow = () => {
  // Create the Electron browser window
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.setMenu(null);
  // Load the frontend through the Express server
  mainWindow.loadURL(`http://localhost:${PORT}`);
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron is ready
electronApp.whenReady().then(() => {
  createWindow();

  electronApp.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the Electron app when all windows are closed
electronApp.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electronApp.quit();
  }
});

// Handle creating/removing shortcuts on Windows during install/uninstall
if (require("electron-squirrel-startup")) {
  electronApp.quit();
}
