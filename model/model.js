import { eq, inArray } from "drizzle-orm";
import { db } from "../config/db.js";
import {
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
