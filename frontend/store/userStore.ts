import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
    id: string | null;
    email: string | null;
    nama: string | null;
    token: string | null;
    setUser: (id: string, email: string, nama: string, token: string) => void;
    clearUser: () => void;
}

const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            id: null,
            email: null,
            nama: null,
            token: null,
            setUser: (id, email, nama, token) =>
                set({ id, email, nama, token }),
            clearUser: () =>
                set({ id: null, email: null, nama: null, token: null }),
        }),
        {
            name: "user-storage", // Nama key di localStorage
            partialize: (state) => ({
                id: state.id,
                email: state.email,
                nama: state.nama,
                token: state.token,
            }), // Menyimpan hanya idUser dan emailUser
        }
    )
);

export default useUserStore;
