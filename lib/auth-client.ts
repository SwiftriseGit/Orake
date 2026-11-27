import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    emailOTPClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Invalid email or password. Please check your credentials and try again.",
  INVALID_PASSWORD: "Incorrect password. Please try again.",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
  USER_NOT_FOUND: "No account found with this email address.",
  USER_ALREADY_EXISTS: "An account with this email already exists.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists.",
  INVALID_OTP: "Invalid verification code. Please check the code and try again.",
  OTP_EXPIRED: "Your verification code has expired. Please request a new one.",
  TOO_MANY_ATTEMPTS: "Too many failed attempts. Please request a new code.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a moment before trying again.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "This account uses Google Sign-In. Please continue with Google.",
  PASSWORD_TOO_SHORT: "Password is too short. Please use at least 8 characters.",
  PASSWORD_TOO_LONG: "Password is too long.",
  INVALID_EMAIL: "Please enter a valid email address.",
  FAILED_TO_CREATE_USER: "Could not create your account. Please try again.",
};

/**
 * Extracts a clear, user-friendly error message from a Better Auth response error or thrown exception.
 */
export function getAuthErrorMessage(
  error: unknown,
  fallback = "Unable to complete your request. Please check your details and try again."
): string {
  if (!error) return fallback;
  if (typeof error === "string") return error.trim() || fallback;

  if (typeof error === "object") {
    const err = error as Record<string, any>;
    const code =
      typeof err.code === "string"
        ? err.code
        : typeof err.error?.code === "string"
          ? err.error.code
          : undefined;

    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }

    const msg =
      (typeof err.message === "string" && err.message.trim()) ||
      (typeof err.error?.message === "string" && err.error.message.trim()) ||
      (typeof err.statusText === "string" && err.statusText.trim() && err.statusText !== "OK"
        ? err.statusText.trim()
        : "");

    if (msg) {
      if (msg === "Failed to fetch" || msg === "Load failed") {
        return "Network error. Please check your internet connection and try again.";
      }
      return msg;
    }
  }

  return fallback;
}

// Export commonly used methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  emailOtp,
} = authClient;