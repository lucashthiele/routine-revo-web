import { createRoot } from "react-dom/client";
import "./index.css";
import AppProviders from "./providers/AppProviders.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.tsx";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
