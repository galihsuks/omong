import { create } from "zustand";
import type { UserAuth } from "@/types/domain";

type AuthState = {
  user: UserAuth | null;
  setUser: (user: UserAuth | null) => void;
  logout: () => void;
};

const persisted = localStorage.getItem("omong:user");

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted ? (JSON.parse(persisted) as UserAuth) : null,
  setUser: (user) => {
    if (user) localStorage.setItem("omong:user", JSON.stringify(user));
    else localStorage.removeItem("omong:user");
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("omong:user");
    set({ user: null });
  },
}));

