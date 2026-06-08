"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, CheckCircle, Circle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupformSchema } from "@/types/signupFormType";
import type { signupFormType } from "@/types/signupFormType";
import { authClient } from "@/lib/auth-client";
import SlideToGoogle from "@/components/SlideToGoogle";
import { useAuthStore } from "@/store/useAuthStore";
import { titleFont, textFont } from "@/lib/fonts";


export default function SignupForm() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [viewingPolicies, setViewingPolicies] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuthModalView, closeAuthModal, setOtpEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<signupFormType>({
    resolver: zodResolver(signupformSchema),
  });

  const onSubmit = async (data: signupFormType) => {
    try {
      const { data: signUpData, error } = await authClient.signUp.email({
        name: data.fullname,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (error?.status === 422) {
        toast.error("Email already registered");
        return;
      }
      if (error) {
        toast.error(error.message || "Signup failed. Please try again.");
        return;
      }

      toast.success("Account created! OTP sent to your email.");
      setOtpEmail(data.email);
      setAuthModalView("verify-otp");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      toast.error("Google sign-up failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto relative">
      
      {/* Form View */}
      <div className={`w-full pb-6 sm:pb-8 animate-in fade-in zoom-in-95 duration-300 ${viewingPolicies ? 'hidden' : 'block'}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative overflow-hidden p-5 sm:p-8 md:p-10 pt-10 sm:pt-12">

        {/* Subtle Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <Image src="/svgs/lemon-2-svg.png" alt="lemon" width={80} height={80} className="absolute -top-6 -left-6 rotate-12" />
          <Image src="/svgs/lemon-svg.png" alt="lemon" width={100} height={100} className="absolute top-40 -right-10 -rotate-12" />
          <Image src="/svgs/lemon-2-svg.png" alt="lemon 2" width={70} height={70} className="absolute bottom-32 -left-8 -rotate-45" />
          <Image src="/svgs/lemon-2-svg.png" alt="lemon 2" width={90} height={90} className="absolute -bottom-8 -right-4 rotate-12" />

          {/* Middle / Inner scattered elements */}
          <Image src="/svgs/lemon-svg.png" alt="lemon" width={45} height={45} className="absolute top-1/4 left-10 rotate-90" />
          <Image src="/svgs/lemon-2-svg.png" alt="lemon 2" width={55} height={55} className="absolute top-1/2 right-8 -rotate-45" />
          <Image src="/svgs/lemon-svg.png" alt="lemon" width={75} height={75} className="absolute bottom-1/4 left-1/3 rotate-180" />
        </div>

        <div className="relative z-10">
          <h3 className={`${titleFont.className} text-xl sm:text-2xl md:text-3xl uppercase tracking-wide text-[#15161b] mb-4 sm:mb-6 md:mb-8 text-center`}>
            Join Orake
          </h3>

          {/* Google Slide */}
          {/* <div className="mb-5 sm:mb-6">
            <SlideToGoogle
              onSlideComplete={handleGoogleSignUp}
              disabled={isSubmitting}
              loading={googleLoading}
              label="Slide to Sign up with Google"
            />
          </div> */}

          {/* Divider */}
          {/* <div className="flex items-center gap-4 mb-5 sm:mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className={`${textFont.className} text-gray-400 text-sm uppercase tracking-widest`}>or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div> */}

          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            {/* Name */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>Full Name <span className="text-[#de3e4f]">*</span></label>
              <div className="relative">
                <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  {...register("fullname")}
                  type="text"
                  placeholder="Your name"
                  className={`${textFont.className} w-full border-2 ${errors.fullname ? "border-red-400" : "border-gray-200"} bg-gray-50 pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#dbba53] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
              </div>
              {errors.fullname && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.fullname.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>Email <span className="text-[#de3e4f]">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Your mail"
                  className={`${textFont.className} w-full border-2 ${errors.email ? "border-red-400" : "border-gray-200"} bg-gray-50 pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#dbba53] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
              </div>
              {errors.email && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>Phone Number <span className="text-[#de3e4f]">*</span></label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  {...register("phone")}
                  type="tel"
                  placeholder="Your number"
                  className={`${textFont.className} w-full border-2 ${errors.phone ? "border-red-400" : "border-gray-200"} bg-gray-50 pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#dbba53] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
              </div>
              {errors.phone && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>Password <span className="text-[#de3e4f]">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  {...register("password")}
                  type={showPass ? "text" : "password"}
                  placeholder="Your password"
                  className={`${textFont.className} w-full border-2 ${errors.password ? "border-red-400" : "border-gray-200"} bg-gray-50 pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#dbba53] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15161b] transition-colors pointer-events-auto">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.password.message}</p>}

              {/* Password Strength Indicator */}
              {watch("password") && (
                <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`${textFont.className} font-semibold text-gray-500`}>Password Strength</span>
                    <span className={`${textFont.className} font-bold ${
                      [
                        (watch("password") || "").length >= 8,
                        /[A-Z]/.test(watch("password") || ""),
                        /[a-z]/.test(watch("password") || ""),
                        /[0-9]/.test(watch("password") || "")
                      ].filter(Boolean).length === 4 ? "text-green-500" :
                      [
                        (watch("password") || "").length >= 8,
                        /[A-Z]/.test(watch("password") || ""),
                        /[a-z]/.test(watch("password") || ""),
                        /[0-9]/.test(watch("password") || "")
                      ].filter(Boolean).length >= 2 ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {
                        [
                          (watch("password") || "").length >= 8,
                          /[A-Z]/.test(watch("password") || ""),
                          /[a-z]/.test(watch("password") || ""),
                          /[0-9]/.test(watch("password") || "")
                        ].filter(Boolean).length === 4 ? "Strong" :
                        [
                          (watch("password") || "").length >= 8,
                          /[A-Z]/.test(watch("password") || ""),
                          /[a-z]/.test(watch("password") || ""),
                          /[0-9]/.test(watch("password") || "")
                        ].filter(Boolean).length >= 2 ? "Good" : "Weak"
                      }
                    </span>
                  </div>
                  
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const score = [
                        (watch("password") || "").length >= 8,
                        /[A-Z]/.test(watch("password") || ""),
                        /[a-z]/.test(watch("password") || ""),
                        /[0-9]/.test(watch("password") || "")
                      ].filter(Boolean).length;
                      
                      let color = "bg-red-500";
                      if (score >= 3) color = "bg-yellow-500";
                      if (score === 4) color = "bg-green-500";

                      return (
                        <div 
                          key={level} 
                          className={`flex-1 rounded-full transition-colors duration-300 ${score >= level ? color : 'bg-gray-200'}`}
                        />
                      );
                    })}
                  </div>
                  
                  <div className={`${textFont.className} text-[10px] sm:text-xs text-gray-500 grid grid-cols-2 gap-1.5 pt-1`}>
                    <div className={`flex items-center gap-1.5 transition-colors ${((watch("password") || "").length >= 8) ? 'text-green-600' : ''}`}>
                      {((watch("password") || "").length >= 8) ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-gray-300" />} 8+ characters
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${(/[A-Z]/.test(watch("password") || "")) ? 'text-green-600' : ''}`}>
                      {(/[A-Z]/.test(watch("password") || "")) ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-gray-300" />} Uppercase
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${(/[a-z]/.test(watch("password") || "")) ? 'text-green-600' : ''}`}>
                      {(/[a-z]/.test(watch("password") || "")) ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-gray-300" />} Lowercase
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${(/[0-9]/.test(watch("password") || "")) ? 'text-green-600' : ''}`}>
                      {(/[0-9]/.test(watch("password") || "")) ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-gray-300" />} Number
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className={`${textFont.className} block text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1.5 sm:mb-2`}>Confirm Password <span className="text-[#de3e4f]">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                <input
                  {...register("confirm")}
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Your confirm password"
                  className={`${textFont.className} w-full border-2 ${errors.confirm ? "border-red-400" : "border-gray-200"} bg-gray-50 pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-[#15161b] placeholder-gray-400 focus:border-[#dbba53] focus:bg-white focus:outline-none transition-all rounded-lg sm:rounded-xl`}
                />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#15161b] transition-colors pointer-events-auto">
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm && <p className={`${textFont.className} text-red-500 text-xs mt-1.5 pl-1`}>{errors.confirm.message}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-gray-300 group-hover:border-[#dbba53] flex items-center justify-center transition-colors mt-0.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#dbba53]" />
              </div>
              <span className={`${textFont.className} text-xs sm:text-sm text-gray-500 leading-relaxed`}>
                I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setViewingPolicies(true); }} className="text-[#c25b5e] hover:text-[#15161b] transition-colors font-semibold">Terms and Policies</button>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || googleLoading}
              className={`${textFont.className} w-full bg-[#dbba53] hover:bg-[#c9a940] disabled:opacity-60 disabled:cursor-not-allowed text-[#15161b] py-3 sm:py-3.5 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-[0_10px_30px_rgba(219,186,83,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 sm:gap-3`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </div>
      </form>

      <p className={`${textFont.className} text-center mt-2 px-5 text-gray-500 text-sm sm:text-base md:text-lg`}>
        Already have an account?{" "}
        <button type="button" onClick={() => setAuthModalView("login")} className="text-[#c25b5e] hover:text-[#a84c4f] font-bold uppercase tracking-wider transition-colors">
          Sign In
        </button>
      </p>
      </div>

      {/* Policies View */}
      <div className={`w-full p-6 sm:p-8 md:p-10 pt-10 sm:pt-12 bg-white animate-in fade-in zoom-in-95 duration-300 ${viewingPolicies ? 'block' : 'hidden'}`}>
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); setViewingPolicies(false); }} 
          className="flex items-center gap-2 text-gray-500 hover:text-[#15161b] transition-colors mb-8"
        >
          <ArrowLeft size={16} /> <span className={`${textFont.className} font-semibold uppercase tracking-wider text-sm`}>Back to Sign Up</span>
        </button>
        
        <div className="space-y-6">
          <h3 className={`${titleFont.className} text-xl sm:text-2xl uppercase tracking-wide text-[#15161b] mb-6`}>Terms & Conditions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>1. Use of Website</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>By accessing orake.in, you agree to use the site for lawful purposes only. You may not misuse, copy, or redistribute any content without written permission.</p>
            </div>
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>2. Product Information</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>All product descriptions, nutritional claims, and images are for informational purposes. ORAKE products are food/beverages and are not intended to diagnose or treat any medical condition.</p>
            </div>
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>3. Orders & Pricing</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>ORAKE reserves the right to update prices at any time. Orders are confirmed only after payment is received. We reserve the right to cancel orders in case of pricing errors or stock issues.</p>
            </div>
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>4. Intellectual Property</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>All brand assets, logos, and content on this website are the property of ORAKE. Unauthorized use is strictly prohibited.</p>
            </div>
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>5. Limitation of Liability</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>ORAKE is not liable for any indirect or incidental losses arising from the use of our products or website, beyond the value of the original purchase.</p>
            </div>
            <div>
              <h4 className={`${textFont.className} font-bold text-sm sm:text-base text-[#15161b] mb-1.5`}>6. Governing Law</h4>
              <p className={`${textFont.className} text-sm text-gray-600 leading-relaxed`}>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Bhubaneswar, Odisha, India.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
