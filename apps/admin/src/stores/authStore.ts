import { create } from "zustand";

type AuthState = {
  placeholderUser: string | null;
  setPlaceholderUser: (username: string) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  placeholderUser: null,
  setPlaceholderUser: (username) => set({ placeholderUser: username })
}));
