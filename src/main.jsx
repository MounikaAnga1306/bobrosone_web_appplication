import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css"; // Make sure this line is here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
