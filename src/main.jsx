import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import App from "./App.jsx";
import Assignment_1 from "./assignments/Assignment_1.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/assignment_1" element={<Assignment_1 />} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
