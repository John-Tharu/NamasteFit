import { z } from 'zod';

export const registerValidate = z
  .object({
    name: z.string().trim().nonempty({ message: "Fill name field" }).max(50),
    email: z.string().email({ message: "Email not valid" }),
    password: z.string().min(6, { message: "Password must contain at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must contain at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
