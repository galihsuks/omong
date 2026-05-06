import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers/AppProviders";
import { ToastViewport } from "@/components/common/ToastViewport";
import { router } from "@/app/router";
import "@/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
      <ToastViewport />
    </AppProviders>
  </React.StrictMode>,
);
