// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
// ✅ NUEVO provider
import { AuthProvider } from "@/auth/context/AuthContext";

if (import.meta?.env?.DEV) {
  import("@/debug/attachAuthDebug").then(m => m.attachAuthDebug());
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
      <App />
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  </React.StrictMode>
);
