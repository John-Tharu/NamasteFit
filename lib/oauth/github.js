import { GitHub } from "arctic";
import { env } from "../../config/env.js";

//Creating github for callback after clicking continue button
export const github = new GitHub(
  env.GITHUB_CLIENT_ID,
  env.GITHUB_CLIENT_SECRET,
  `${env.HOST}/github/callback` //We will create this route to verify after login
);
