import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../config/db.js";
import {
  emailValidTable,
  forgotPasswordTable,
  liveClassTable,
  oauthTable,
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

//Getting all data from usersTable by using email
export const checkEmail = async (email) => {
  return await db.select().from(usersTable).where(eq(usersTable.email, email));
};

//Hashing password using argon
export const hashpass = async (password) => {
  return await argon2.hash(password);
};

//insert register data into database and return id
export const saveData = async ({ name, email, pass }) => {
  return await db
    .insert(usersTable)
    .values({ name, email, pass })
    .$returningId();
};

//Comparing the hashed password and provided password
export const checkPass = async (hash, pass) => {
  return await argon2.verify(hash, pass);
};

//Generation of session using JWT
// export const generateToken = ({ id, name, email, role }) => {
//   return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, {
//     expiresIn: "30d",
//   });
// };

//Storing session on database and return id
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

//Getting all data of planTable using planList
export const getProgram = async (planList) => {
  return await db
    .select()
    .from(planTable)
    .where(inArray(planTable.plan, planList));
};

//Getting all programs from plantable
export const getPrograms = async () => {
  return await db.select().from(planTable);
};

//Getting programs using id
export const getProgramById = async (id) => {
  return await db.select().from(planTable).where(eq(planTable.id, id));
};

//Getting user from usersTable
export const getUser = async () => {
  return await db.select().from(usersTable);
};

//Storing payment data into database and return id
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

//Getting payment data from paymentTable
export const getPayment = async () => {
  return await db.select().from(paymentTable);
};

//Getting subscription data from database using id
export const getSubscription = async (id) => {
  return await db
    .select()
    .from(paymentTable)
    .where(eq(paymentTable.userId, id));
};

//Updating programs using id
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

//deleting data from database using id
export const deleteProgramData = async (id) => {
  return await db.delete(planTable).where(eq(planTable.id, id));
};

//Storing live class data into database and return id
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

//Getting liveclass data from database
export const getLiveClassData = async () => {
  return await db.select().from(liveClassTable);
};

//Getting live class data from database using planList and status is true
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

//Getting live class status from database using id
export const getStatus = async (id) => {
  return await db
    .select()
    .from(liveClassTable)
    .where(eq(liveClassTable.id, id));
};

//Changing status into database using id
export const changeStatus = async (id, value) => {
  await db
    .update(liveClassTable)
    .set({ status: value })
    .where(eq(liveClassTable.id, id));
};

//deleting liveclasses from database using id
export const deleteClassData = async (id) => {
  return await db.delete(liveClassTable).where(eq(liveClassTable.id, id));
};

//Getting all data of users using id
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
};

//Finding session by sessionId
const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, sessionId));

  return session;
};

//Function for authenticateUser
export const authenticateUser = async ({ req, res, user, name, email }) => {
  //Saving sessions into the database
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const role = "User";
  //Create Access Token
  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    role: user.role || role,
    sessionId: session.id,
  });

  //Create Refresh Token
  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  //Setting Access Token to the client PC
  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  //Setting Refresh Token to the client PC
  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

//Function for refreshtoken
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

//Updating usersdata using user id
export const updateNameById = async ({ userId, name, avatarUrl }) => {
  return await db
    .update(usersTable)
    .set({ name, avatarUrl })
    .where(eq(usersTable.id, userId));
};

//Updating user password using userid
export const updatePassword = async ({ userId, pass }) => {
  return await db
    .update(usersTable)
    .set({ pass })
    .where(eq(usersTable.id, userId));
};

//creating reset link to send the user email
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

//Clearing reset token
export const clearResetPasswordToken = async (userId) => {
  return await db
    .delete(forgotPasswordTable)
    .where(eq(forgotPasswordTable.userId, userId));
};

//Function for getUserWithOauthId
export const getUserWithOauthId = async ({ email, provider }) => {
  //Getting all the data of userTable and common data of oauthTable using join
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      isEmailValid: usersTable.isEmailValid,
      providerAccountId: oauthTable.providerAccountId,
      provider: oauthTable.provider,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .leftJoin(
      oauthTable,
      and(
        eq(oauthTable.provider, provider),
        eq(oauthTable.userId, usersTable.id)
      )
    );

  return user;
};

//Function for linkUserWithOauth
export const linkUserWithOauth = async ({
  userId,
  provider,
  providerAccountId,
}) => {
  await db.insert(oauthTable).values({ userId, provider, providerAccountId });
};

//Function for createUserWithOauth
export const createUserWithOauth = async ({
  name,
  email,
  provider,
  providerAccountId,
}) => {
  const user = await db.transaction(async (trx) => {
    //Insert into users table
    const [user] = await trx
      .insert(usersTable)
      .values({ name, email, isEmailValid: true })
      .$returningId();

    //Insert into oauth Table
    await trx.insert(oauthTable).values({
      userId: user.id,
      provider,
      providerAccountId,
    });

    //Return values to the user
    return {
      id: user.id,
      name,
      email,
      provider,
      providerAccountId,
    };
  });

  //Returning the user
  return user;
};
