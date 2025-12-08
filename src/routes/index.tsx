import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import PrivateRoutes from "./PrivateRoutes";
import PublicRoutes from "./PublicRoutes";
import LoginPage from "../pages/Login";
import ForgotPasswordPage from "../pages/ForgotPassword";
import OnboardingPage from "../pages/Onboarding";
import ClientManagementPage from "../pages/ClientManagement";
import ClientReportPage from "../pages/ClientReport";
import RoutineBuilderPage from "../pages/RoutineBuilder";
import ExerciseLibraryPage from "../pages/ExerciseLibrary";
import UserManagementPage from "../pages/UserManagement";

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
            element: <Navigate to="/clients" replace />,
          },
          {
            path: "/clients",
            element: <ClientManagementPage />,
          },
          {
            path: "/clients/:clientId/report",
            element: <ClientReportPage />,
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
        ],
      },
      // Onboarding route - outside PublicRoutes to work regardless of auth state
      {
        path: "/onboarding",
        element: <OnboardingPage />,
      },
    ],
  },
]);
