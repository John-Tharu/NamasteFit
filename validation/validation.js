import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .nonempty({ message: "Fill name field" })
  .max(50);

const emailSchema = z.string().email({ message: "Email not valid" });

const passwordSchema = z
  .string()
  .min(6, { message: "Password must contain at least 6 characters" });

export const loginValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerValidate = loginValidation
  .extend({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(6, {
      message: "Confirm password must contain at least 6 characters",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const liveClassValidation = z.object({
  title: z.string().trim().nonempty({ message: "Fill Title field" }).max(50),
  slogan: z.string().nonempty({ message: "Fill slogan field" }).max(50),
  instructor: z.string().nonempty({ message: "Fill instructor field" }),
  plan: z.enum(["Free", "Basic", "Standard", "Premium"], {
    errorMap: () => ({ message: "Choose a valid plan" }),
  }),
  time: z.string().nonempty({ message: "Please enter time" }),
  link: z.string().url({ message: "Invalid URL format" }),
});

export const verifyTokenEmail = z.object({
  token: z.string().trim().length(8),
  email: emailSchema,
});

export const nameValidation = z.object({
  name: nameSchema,
});

export const verifyChangePassword = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current Password Required" }),
    newPassword: z
      .string()
      .min(6, { message: "New Password must containt atleast 6 character" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must containt atleast 6 character",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password not matched",
    path: ["confirmPassword"],
  });

export const verifyEmail = z.object({
  email: emailSchema,
});

export const resetPasswordValidation = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must containt atleast 6 character" }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must containt atleast 6 character",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password not matched",
    path: ["confirmPassword"],
  });
