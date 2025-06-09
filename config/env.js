import { z } from "zod";

//validation for google,github and host
const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  HOST: z.string().url().trim().min(1),
});

export const env = envSchema.parse(process.env);
