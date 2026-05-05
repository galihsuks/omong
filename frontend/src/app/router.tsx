import { Navigate, createBrowserRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { RoomsPage } from "@/pages/rooms/RoomsPage";
import { RoomDetailPage } from "@/pages/chat/RoomDetailPage";
import { useAuthStore } from "@/store/auth.store";

function AuthGuard({ children }: { children: ReactElement }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

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
    path: "/rooms",
    element: (
      <AuthGuard>
        <RoomsPage />
      </AuthGuard>
    ),
  },
  {
    path: "/rooms/:id",
    element: (
      <AuthGuard>
        <RoomDetailPage />
      </AuthGuard>
    ),
  },
]);
