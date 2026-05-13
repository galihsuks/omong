import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { RoomsPage } from "@/pages/rooms/RoomsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { ProtectedAppLayout } from "@/app/layouts/ProtectedAppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/rooms" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    element: <ProtectedAppLayout />,
    children: [
      { path: "/rooms", element: <RoomsPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);
