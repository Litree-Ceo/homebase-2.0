import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./styles/main.css";
import "./styles/honeycomb-theme.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
