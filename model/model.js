import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../config/db.js";
import {
  emailValidTable,
  forgotPasswordTable,
  liveClassTable,
  paymentTable,
  planTable,
  sessionTable,
  usersTable,
} from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constant.js";
// import { sendEmail } from "../lib/nodemailer.js";
import { sendEmail } from "../lib/resend-email.js";
import fs from "fs/promises";
import path from "path";
import mjml2html from "mjml";
import ejs from "ejs";

export const checkEmail = async (email) => {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
};

export const hashpass = async (password) => {
  return await argon2.hash(password);
};

export const saveData = async ({ name, email, pass }) => {
  return await db
    .insert(usersTable)
    .values({ name, email, pass })
    .$returningId();
};

export const checkPass = async (hash, pass) => {
  return await argon2.verify(hash, pass);
};

// export const generateToken = ({ id, name, email, role }) => {
//   return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

//Storing session on database
export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionTable)
    .values({ userId, ip, userAgent })
    .$returningId();

  return session;
};

//Create Access Token
export const createAccessToken = ({ id, name, email, role, sessionId }) => {
  return jwt.sign(
    { id, name, email, role, sessionId },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY / MILISECONDS_PER_SECOND, //  15 Minutes
    }
  );
};

//Create Refresh Token
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILISECONDS_PER_SECOND, //  7 days
  });
};

//Verify JWT Token
export const verifytoken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

//Save programs into database
export const saveProgram = async ({ title, slogan, duration, plan, link }) => {
  return await db
    .insert(planTable)
    .values({ title, slogan, duration, plan, link })
    .$returningId();
};

export const getProgram = async (planList) => {
  return await db
    .select()
    .from(planTable)
    .where(inArray(planTable.plan, planList));
};

export const getPrograms = async () => {
  return await db.select().from(planTable);
};

export const getProgramById = async (id) => {
  return await db.select().from(planTable).where(eq(planTable.id, id));
};

export const getUser = async () => {
  return await db.select().from(usersTable);
};

export const paymentdata = async ({
  name,
  email,
  plan,
  pkg,
  total,
  status,
  transId,
  userId,
}) => {
  return await db
    .insert(paymentTable)
    .values({
      name,
      email,
      plan,
      package: pkg,
      amount: total,
      status,
      transId,
      userId,
    })
    .$returningId();
};

export const getPayment = async () => {
  return await db.select().from(paymentTable);
};

export const getSubscription = async (id) => {
  return await db
    .select()
    .from(paymentTable)
    .where(eq(paymentTable.userId, id));
};

export const updateProgramData = async ({
  title,
  slogan,
  duration,
  plan,
  link,
  id,
}) => {
  return await db
    .update(planTable)
    .set({
      title,
      slogan,
      duration,
      plan,
      link,
    })
    .where(eq(planTable.id, id));
};

export const deleteProgramData = async (id) => {
  return await db.delete(planTable).where(eq(planTable.id, id));
};

export const liveClass = async ({
  title,
  slogan,
  instructor,
  plan,
  time,
  link,
}) => {
  return await db
    .insert(liveClassTable)
    .values({ title, slogan, instructor, plan, programTime: time, link })
    .$returningId();
};

export const getLiveClassData = async () => {
  return await db.select().from(liveClassTable);
};

export const getClassLink = async (planList) => {
  return await db
    .select()
    .from(liveClassTable)
    .where(
      and(
        inArray(liveClassTable.plan, planList),
        eq(liveClassTable.status, true)
      )
    );
};

export const getStatus = async (id) => {
  return await db
    .select()
    .from(liveClassTable)
    .where(eq(liveClassTable.id, id));
};

export const changeStatus = async (id, value) => {
  await db
    .update(liveClassTable)
    .set({ status: value })
    .where(eq(liveClassTable.id, id));
};

export const deleteClassData = async (id) => {
  return await db.delete(liveClassTable).where(eq(liveClassTable.id, id));
};

export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};

const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId));

  return session;
};

export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifytoken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid Session");
    }

    const user = await findUserById(currentSession.userId);
    //console.log(user);

    if (!user) throw new Error("Invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sessionId: currentSession.id,
    };

    //Create Access Token
    const newAccessToken = createAccessToken(userInfo);

    //Create Refresh Token
    const newRefreshToken = createRefreshToken(currentSession.id);

    return {
      newAccessToken,
      newRefreshToken,
      userInfo,
    };
  } catch (error) {
    console.log(error.message);
  }
};

//Clear User Session
export const clearUserSession = async (sessionId) => {
  return await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
};

//Function to genereate email verification token
export const generateEmailToken = (digit = 8) => {
  const min = 10 ** (digit - 1); //10000000
  const max = 10 ** digit; //100000000

  return crypto.randomInt(min, max).toString();
};

//Function to insert generated token and user id into database
export const insertEmailToken = async ({ userId, token }) => {
  //Using transaction for rollback if there is any error
  return db.transaction(async (tx) => {
    try {
      //Delete Expired tokens
      await tx
        .delete(emailValidTable)
        .where(lt(emailValidTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      //Delete All tokens of user
      await tx
        .delete(emailValidTable)
        .where(eq(emailValidTable.userId, userId));

      //Inserted new Tokens
      await tx.insert(emailValidTable).values({ userId, token });
    } catch (error) {
      console.error("Failed to insert verification token: ", error);
      throw new Error("Unable to create vcerification token");
    }
  });
};

//Function to create email link to verify
export const createEmailLink = ({ token, email }) => {
  //Creating new URL
  const url = new URL(`${process.env.HOST}/verify-email-token`);

  //Adding parameters on URL
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

//Function for findVerificationToken
export const findVerificationToken = async ({ token, email }) => {
  //Marge Two tables and get output from two tables
  return await db
    .select({
      token: emailValidTable.token,
      expiresAt: emailValidTable.expiresAt,
      userId: usersTable.id,
      email: usersTable.email,
    })
    .from(emailValidTable)
    .where(
      and(
        eq(emailValidTable.token, token),
        gte(emailValidTable.expiresAt, sql`CURRENT_TIMESTAMP`),
        eq(usersTable.email, email)
      )
    )
    .innerJoin(usersTable, eq(usersTable.id, emailValidTable.userId));
};

//Function of VerifyEmailAndUpdate
export const verifyEmailAndUpdate = async (email) => {
  return await db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

//Function of clearVerifyEmailTokens
export const clearVerifyEmailTokens = async (userId) => {
  return await db
    .delete(emailValidTable)
    .where(eq(emailValidTable.userId, userId));
};

export const newEmailLink = async ({ userId, email }) => {
  //Calling function to find user by it's ID
  const user = await findUserById(userId);

  //Checking email is true or not
  if (!user || user.isEmailValid) return res.redirect("/");

  //Calling function to generate email verification token
  const emailVerifyToken = generateEmailToken();

  //Calling function to insert generated token and user id into database
  await insertEmailToken({
    userId,
    token: emailVerifyToken,
  });

  //Calling function to create email link to verify
  const verifyEmailLink = createEmailLink({
    token: emailVerifyToken,
    email,
  });

  //Reading verify-email.mjml file (Email Template)
  const emailTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8"
  );

  //Replacing placeholders with actual data
  const filledTemplete = ejs.render(emailTemplate, {
    code: emailVerifyToken,
    link: verifyEmailLink,
  });

  //Converting mjml file to html
  const htmlOutput = mjml2html(filledTemplete).html;

  //Calling funtion to sending email to loggedin user
  sendEmail({
    to: email,
    subject: "Verify your Email",
    html: htmlOutput,
  }).catch(console.error);
};

export const updateNameById = async ({ userId, name }) => {
  return await db
    .update(usersTable)
    .set({ name })
    .where(eq(usersTable.id, userId));
};

export const updatePassword = async ({ userId, pass }) => {
  return await db
    .update(usersTable)
    .set({ pass })
    .where(eq(usersTable.id, userId));
};

export const createResetPasswordLink = async ({ userId }) => {
  //Generate Random 64 character token
  const randomToken = crypto.randomBytes(32).toString("hex");

  //hashing the token
  const hashToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  //Delete previous token of user
  await db
    .delete(forgotPasswordTable)
    .where(eq(forgotPasswordTable.userId, userId));

  //Insert into the database
  await db.insert(forgotPasswordTable).values({ userId, hashToken });

  //Create a link and return
  return `${process.env.HOST}/reset-password/${randomToken}`;
};

//Reset Passsword Token
export const resetPasswordData = async (token) => {
  //Hashing the token
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");

  //Getting all data where hashToken matched and token not expired
  const [user] = await db
    .select()
    .from(forgotPasswordTable)
    .where(
      and(
        eq(forgotPasswordTable.hashToken, hashToken),
        gte(forgotPasswordTable.expiresAt, sql`CURRENT_TIMESTAMP`)
      )
    );

  //Returning the data in user
  return user;
};

export const clearResetPasswordToken = async (userId) => {
  return await db
    .delete(forgotPasswordTable)
    .where(eq(forgotPasswordTable.userId, userId));
};
