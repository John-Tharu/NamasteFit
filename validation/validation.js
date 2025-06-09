import { z } from "zod";

//Validation for name
const nameSchema = z
  .string()
  .trim()
  .nonempty({ message: "Fill name field" })
  .max(50);

//validation for email
const emailSchema = z.string().email({ message: "Email not valid" });

//Validation for password
const passwordSchema = z
  .string()
  .min(6, { message: "Password must contain at least 6 characters" });

//validatiob for login Form data
export const loginValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
});

//validation fro registration data
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

//Validation for live classes data
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

//validation for token and email
export const verifyTokenEmail = z.object({
  token: z.string().trim().length(8),
  email: emailSchema,
});

//name validation
export const nameValidation = z.object({
  name: nameSchema,
});

//Validation for change password data
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

//Email validation
export const verifyEmail = z.object({
  email: emailSchema,
});

//Password and Confirmpassword validation
const passSchema = z
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

export const resetPasswordValidation = passSchema;

export const setPasswordValidation = passSchema;
