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

// TODO - These pages need to be migrated from POC and implemented
// Each should use the DashboardLayout component
function ClientManagementPage() {
  return <div className="text-gray-900">Client Management Page - TODO</div>;
}

function RoutineBuilderPage() {
  return <div className="text-gray-900">Routine Builder Page - TODO</div>;
}

function ExerciseLibraryPage() {
  return <div className="text-gray-900">Exercise Library Page - TODO</div>;
}

function UserManagementPage() {
  return <div className="text-gray-900">User Management Page - TODO</div>;
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
          {
            path: "/clients",
            element: <ClientManagementPage />,
          },
          {
            path: "/routines",
            element: <RoutineBuilderPage />,
          },
          {
            path: "/exercises",
            element: <ExerciseLibraryPage />,
          },
          {
            path: "/users",
            element: <UserManagementPage />,
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
