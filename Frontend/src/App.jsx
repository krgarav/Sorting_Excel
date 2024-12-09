import "react-toastify/dist/ReactToastify.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Result from "./Pages/Result";
import MainPage from "./Pages/MainPage";
import HeaderMatching from "./Pages/HeaderMatching";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/result" element={<Result />} />
        <Route path="/headermatching" element={<HeaderMatching />} />
      </Routes>
    </Router>
  );
}

export default App;
