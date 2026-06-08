"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form"
import type { loginFormType } from "@/types/loginFormType"
import { loginFormSchema } from "@/types/loginFormType"
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import SlideToGoogle from "@/components/SlideToGoogle";
import { useAuthStore } from "@/store/useAuthStore";
import { titleFont, textFont } from "@/lib/fonts";


import { syncGuestWishlist } from "@/actions/wishlist";
import { syncGuestCartToUser } from "@/actions/cart";
import { useGuestWishlistStore } from "@/store/useGuestWishlistStore";


export default function LoginForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuthModalView, closeAuthModal, setOtpEmail } = useAuthStore();

  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<loginFormType>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit = async (data: loginFormType) => {
    try {
      const { data: signInData, error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // 403 = email not verified
        if (error.status === 403) {
          toast.error("Please verify your email first.");

          await authClient.emailOtp.sendVerificationOtp({
            email: data.email,
            type: "email-verification",
          });
          setOtpEmail(data.email);
          setAuthModalView("verify-otp");
          return;
        }

        toast.error(error.message || "Invalid email or password");
        return;
      }

      if ((signInData?.user as any)?.isDelete) {
        await authClient.signOut();
        toast.error("Your account has been deleted. Please contact support.");
        return;
      }

      // Sync guest data → user account (wishlist + cart)
      const guestSlugs = useGuestWishlistStore.getState().getSlugs();
      await Promise.all([
        guestSlugs.length > 0 ? syncGuestWishlist(guestSlugs) : Promise.resolve(),
        syncGuestCartToUser(),
      ]);
      useGuestWishlistStore.getState().clear();

      toast.success("Welcome back!");
      closeAuthModal();
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirectUrl || "/");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      // the callbackURL handles closing/redirecting naturally or triggers a reload.
    } catch {
      toast.error("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-6 sm:pb-8">
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="relative overflow-hidden p-5 sm:p-8 md:p-10 pt-10 sm:pt-12">

        {/* Subtle Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <Image src="/svgs/flower-sb.png" alt="strawberry" width={100} height={100} className="absolute -top-2 -left-3 rotate-12" />
          <Image src="/svgs/leaf-svg.png" alt="leaf" width={80} height={80} className="absolute top-1/3 -left-8 -rotate-12" />
          <Image src="/svgs/starwbery-svg.png" alt="strawberry" width={70} height={70} className="absolute -bottom-6 right-10 rotate-45" />

          {/* Middle / Inner scattered elements */}
          <Image src="/svgs/starwbery-svg.png" alt="strawberry" width={50} height={50} className="absolute top-1/4 right-1/4 -rotate-12" />
          <Image src="/svgs/starwbery-svg.png" alt="strawberry" width={60} height={60} className="absolute bottom-1/3 left-8 rotate-90" />
        </div>

        <div className="relative z-10">
          <h3 className={`${titleFont.className} text-xl sm:text-2xl md:text-3xl uppercase tracking-wide text-[#15161b] mb-4 sm:mb-6 md:mb-8 text-center`}>
            Welcome Back
          </h3>

          {/* Google Slide */}
          {/* <div className="mb-5 sm:mb-6">
            <SlideToGoogle
              onSlideComplete={handleGoogleSignIn}
              disabled={isSubmitting}
              loading={googleLoading}
              label="Slide to Sign in with Google"
            />
          </div> */}

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-5 sm:mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className={`${textFont.className} text-gray-400 text-sm uppercase tracking-widest`}>or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div> */}

          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Email */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>
                Email Address <span className="text-[#de3e4f]">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Your mail"
                  className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
              </div>
              {errors.email && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>
                Password <span className="text-[#de3e4f]">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  className={`${textFont.className} w-full border-2 border-gray-200 bg-gray-50 pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15161b] transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.password.message}</p>}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => setAuthModalView("forgot-password")} className={`${textFont.className} text-xs md:text-sm text-[#c25b5e] hover:text-[#15161b] uppercase tracking-wider transition-colors font-semibold`}>
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className={`${textFont.className} w-full bg-[#c25b5e] hover:bg-[#a84c4f] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 sm:py-3.5 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_10px_30px_rgba(194,91,94,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sign up link */}
      <p className={`${textFont.className} text-center mt-2 px-5 text-gray-500 text-sm sm:text-base md:text-lg`}>
        Don&apos;t have an account?{" "}
        <button type="button" onClick={() => setAuthModalView("signup")} className="text-[#dbba53] hover:text-[#c9a940] font-bold uppercase tracking-wider transition-colors">
          Sign Up
        </button>
      </p>
    </div>
  );
}
