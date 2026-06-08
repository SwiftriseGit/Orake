"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { titleFont, textFont } from "@/lib/fonts";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";

import { syncGuestWishlist } from "@/actions/wishlist";
import { syncGuestCartToUser } from "@/actions/cart";
import { useGuestWishlistStore } from "@/store/useGuestWishlistStore";

export default function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { otpEmail, closeAuthModal } = useAuthStore();
  const email = otpEmail || searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, 3)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      toast.error("Please enter the complete 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: otpString,
      });

      if (error) {
        toast.error(error.message || "Invalid OTP. Please try again.");
      } else {
        // Sync guest data → user account (wishlist + cart)
        const guestSlugs = useGuestWishlistStore.getState().getSlugs();
        await Promise.all([
          guestSlugs.length > 0 ? syncGuestWishlist(guestSlugs) : Promise.resolve(),
          syncGuestCartToUser(),
        ]);
        useGuestWishlistStore.getState().clear();

        toast.success("Email verified! Signing you in...");
        closeAuthModal();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message || "Failed to resend OTP");
      } else {
        toast.success("New OTP sent to your email!");
        setResendCooldown(60);
        setOtp(["", "", "", ""]);
        inputsRef.current[0]?.focus();
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-6 sm:pb-8">
      <div className="relative overflow-hidden p-5 sm:p-8 md:p-10 pt-6 sm:pt-8 text-center">
        <div className="relative z-10">
          <h3 className={`${titleFont.className} text-2xl uppercase tracking-wide text-[#15161b] mb-3`}>
            Verification Code
          </h3>
          <p className={`${textFont.className} text-gray-400 text-sm mb-8`}>
            We sent a code to <span className="text-[#15161b] font-semibold">{email}</span>
          </p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`${textFont.className} w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${digit
                  ? "border-emerald-400 bg-emerald-50 text-[#15161b]"
                  : "border-gray-200 bg-gray-50 text-gray-400 focus:border-[#dbba53] focus:bg-white"
                  }`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || resendLoading || otp.join("").length !== 4}
            className={`${textFont.className} w-full bg-[#15161b] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-full text-xl font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_10px_30px_rgba(52,211,153,0.3)] active:scale-[0.98] flex items-center justify-center gap-3`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-6">
            <p className={`${textFont.className} text-gray-400 text-sm`}>
              Didn&apos;t receive the code?{" "}
              {resendCooldown > 0 ? (
                <span className="text-gray-500 font-semibold">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading||loading}
                  className="text-[#c25b5e] hover:text-[#15161b] font-bold uppercase tracking-wider transition-colors"
                >
                  Resend OTP
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
