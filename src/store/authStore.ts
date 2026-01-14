import { create } from "zustand";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, username: string) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAuthenticated: false,

  initAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (token && username) {
        set({ token, username, isAuthenticated: true });
      }
    }
  },

  setAuth: (token: string, username: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);

    // Set cookie untuk middleware
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

    set({ token, username, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Clear cookie
    document.cookie = "token=; path=/; max-age=0";

    set({ token: null, username: null, isAuthenticated: false });
  },
}));
