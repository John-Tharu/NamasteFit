import { eq } from "drizzle-orm"
import { db } from "../config/db.js"
import { usersTable } from "../drizzle/schema.js"
import argon2 from "argon2"

export const checkEmail = async (email) =>{
    return await db.select().from(usersTable).where(eq(usersTable.email,email));
}

export const hashpass = async (password) =>{
    return await argon2.hash(password);
}

export const saveData = async ({name,email,pass}) =>{
    return await db.insert(usersTable).values({name,email,pass}).$returningId();
}
