import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { usersTable } from "../drizzle/schema.js";
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
