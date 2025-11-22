import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import PrivateRoutes from "./PrivateRoutes";
import PublicRoutes from "./PublicRoutes";
import LoginPage from "../pages/Login";
import HomePage from "../pages/Home";
import ForgotPasswordPage from "../pages/ForgotPassword";

// --- Placeholders for future pages ---
function ActivateAccountPage() {
  return <div className="text-gray-900">Activate Account Page</div>;
}
// ------------------------------------

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <PrivateRoutes />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
      {
        element: <PublicRoutes />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/forgot-password",
            element: <ForgotPasswordPage />,
          },
          {
            path: "/activate-account/:token",
            element: <ActivateAccountPage />,
          },
        ],
      },
    ],
  },
]);
