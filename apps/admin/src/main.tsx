import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "./styles.css";
import { AppProviders } from "./app/AppProviders";
import { AppRouter } from "./routes/AppRouter";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
);
