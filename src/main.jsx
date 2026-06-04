import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { initSessionGuard } from "./lib/sessionGuard";

// Session guard — ReactDOM render ki MUNDU run avvali.
// BOBROS login "user" + "isLoggedIn" keys set chestుంది (SignIn.jsx) — avే clear cheయyali.
initSessionGuard({ authKeys: ["user", "isLoggedIn"] });

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);