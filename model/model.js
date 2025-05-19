import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { paymentTable, planTable, usersTable } from "../drizzle/schema.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

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

export const generateToken = ({ id, name, email, role }) => {
  return jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const verifytoken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const saveProgram = async ({ title, slogan, duration, plan, link }) => {
  return await db
    .insert(planTable)
    .values({ title, slogan, duration, plan, link })
    .$returningId();
};

export const getProgram = async () => {
  return await db.select().from(planTable);
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
