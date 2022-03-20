import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Provider as AuthProvider } from "./context/authContext";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
