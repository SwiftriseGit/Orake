import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "./db";
import type { Db } from "mongodb";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "./mailer";
import { createAuthMiddleware, APIError } from "better-auth/api";

export const auth = betterAuth({
  database: mongodbAdapter(db as unknown as Db),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn:true
  },

  emailVerification: {
    autoSignInAfterVerification: true,
  },
// ─── AUTH HOOKS ───
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			const email = ctx.body?.email;
			if (!email || typeof email !== "string") return;

			// 1. Sign-up duplicate / deactivated check
			if (ctx.path === "/sign-up/email") {
				const existing = await ctx.context.internalAdapter.findUserByEmail(email);
				if (existing) {
					if ((existing.user as any)?.isDelete) {
						throw new APIError("FORBIDDEN", {
							message: "This account has been deactivated. Please contact support.",
						});
					}
					throw new APIError("UNPROCESSABLE_ENTITY", {
						message: "Email already registered",
					});
				}
			}

			// 2. Sign-in validation: missing account, deactivated account, or Google-only account
			if (ctx.path === "/sign-in/email") {
				const existing = await ctx.context.internalAdapter.findUserByEmail(email, {
					includeAccounts: true,
				});
				if (!existing) {
					throw new APIError("UNAUTHORIZED", {
						message: "No account found with this email address. Please sign up first.",
					});
				}
				if ((existing.user as any)?.isDelete) {
					throw new APIError("FORBIDDEN", {
						message: "Your account has been deactivated. Please contact support.",
					});
				}
				const accounts = existing.accounts ?? [];
				const hasCredential = accounts.some((acc: any) => acc.providerId === "credential");
				if (accounts.length > 0 && !hasCredential) {
					throw new APIError("BAD_REQUEST", {
						message: "This email is registered with Google Sign-In. Please continue with Google.",
					});
				}
			}

			// 3. Forgot-password OTP checks
			if (ctx.path === "/email-otp/send-verification-otp" && ctx.body?.type === "forget-password") {
				const existing = await ctx.context.internalAdapter.findUserByEmail(email, {
					includeAccounts: true,
				});
				if (!existing) {
					throw new APIError("NOT_FOUND", {
						message: "No account found with this email address.",
					});
				}
				if ((existing.user as any)?.isDelete) {
					throw new APIError("FORBIDDEN", {
						message: "Your account has been deactivated. Please contact support.",
					});
				}
				const accounts = existing.accounts ?? [];
				const hasCredential = accounts.some((acc: any) => acc.providerId === "credential");
				if (accounts.length > 0 && !hasCredential) {
					throw new APIError("BAD_REQUEST", {
						message: "This account uses Google Sign-In and does not have a password to reset.",
					});
				}
			}
		}),
	},
  plugins: [
    emailOTP({
      otpLength: 4,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendOTPEmail(email, otp);
        } else if (type === "forget-password") {
          await sendOTPEmail(email, otp, "Password Reset");
        } 
      },
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      isDelete: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});