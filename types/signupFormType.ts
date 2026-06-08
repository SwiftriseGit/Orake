import { z } from "zod";

export const signupformSchema = z.object({
  fullname: z.string().min(3, "Full name must be at least 3 characters").trim(),
  email: z.email("Invalid email address").trim(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9\+\-\s]+$/, "Only numbers allowed"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirm: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});

export type signupFormType = z.infer<typeof signupformSchema>;
