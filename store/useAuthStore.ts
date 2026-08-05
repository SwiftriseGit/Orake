import { create } from "zustand";





interface AuthState {
  isAuthModalOpen: boolean;
  authModalView: "login" | "signup" | "forgot-password" | "verify-otp";
  otpEmail: string;
  openAuthModal: (view?: "login" | "signup" | "forgot-password" | "verify-otp") => void;
  closeAuthModal: () => void;
  setAuthModalView: (view: "login" | "signup" | "forgot-password" | "verify-otp") => void;
  setOtpEmail: (email: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthModalOpen: false,
  authModalView: "login",
  otpEmail: "",
  openAuthModal: (view = "login") => set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalView: (view) => set({ authModalView: view }),
  setOtpEmail: (email) => set({ otpEmail: email }),
}));
