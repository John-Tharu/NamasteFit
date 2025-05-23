import { z } from "zod";

export const loginValidation = z.object({
  email: z.string().email({ message: "Email not valid" }),
  password: z
    .string()
    .min(6, { message: "Password must contain at least 6 characters" }),
});

export const registerValidate = loginValidation
  .extend({
    name: z.string().trim().nonempty({ message: "Fill name field" }).max(50),
    email: z.string().email({ message: "Email not valid" }),
    password: z
      .string()
      .min(6, { message: "Password must contain at least 6 characters" }),
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
