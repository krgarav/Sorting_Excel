import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Result from "./Pages/Result";
import MainPage from "./Pages/MainPage";
import HeaderMatching from "./Pages/HeaderMatching";
import LandingPage from "./Pages/LandingPage";
import NamingExcel from "./Pages/NamingExcel";
import "./App.css";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/excel-naming" element={<NamingExcel />} />
        <Route path="/excel-sorting" element={<MainPage />} />
        <Route path="/result" element={<Result />} />
        <Route path="/headermatching" element={<HeaderMatching />} />
      </Routes>
    </Router>
  );
}

export default App;
