import { z } from "zod";
const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .toLowerCase()
  .email("Enter a valid email")
  .regex(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, "Enter a valid email");

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: emailField,
    password: z.string().min(9, "Password must be at least 9 characters"),
    confirmPassword: z.string(),
    phone: z.string().min(11, "Phone number must be at least 11 digits"),
    country: z.string().min(3, "Nationality must be at least 3 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(9, "Password is required"),
});
