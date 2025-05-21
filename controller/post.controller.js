import { z } from "zod";
import {
  checkEmail,
  checkPass,
  createAccessToken,
  createRefreshToken,
  createSession,
  deleteProgramData,
  // generateToken,
  hashpass,
  paymentdata,
  saveData,
  saveProgram,
  updateProgramData,
} from "../model/model.js";
import { loginValidation, registerValidate } from "../validation/validation.js";
import { randomBytes } from "crypto";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constant.js";

export const savedata = async (req, res) => {
  if (req.user) return res.redirect("/");
  //console.log(req.body);
  const { data, error } = registerValidate.safeParse(req.body);
  if (error) {
    console.log(error);
    req.flash("errors", error.errors[0].message);
    return res.redirect("/register");
  }

  const { name, email, password } = data;

  const [checkedEmail] = await checkEmail(email);
  console.log(checkedEmail);

  if (checkedEmail) {
    req.flash("errors", "Email already exists !!!!");
    return res.redirect("/register");
  }

  const pass = await hashpass(password);

  const [id] = await saveData({ name, email, pass });
  console.log(id);

  res.redirect("/login");
};

export const loginData = async (req, res) => {
  if (req.user) return res.redirect("/");
  //console.log(req.body);

  const { data, error } = loginValidation.safeParse(req.body);

  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/login");
  }

  const { email, password } = data;

  const [user] = await checkEmail(email);
  //console.log(user);

  if (!user) {
    req.flash("errors", "Please check email and password");
    return res.redirect("/login");
  }

  const checkedPass = await checkPass(user.pass, password);

  if (!checkedPass) {
    req.flash("errors", "Please check email or password");
    return res.redirect("/login");
  }

  // const token = generateToken({
  //   id: checkedEmail.id,
  //   name: checkedEmail.name,
  //   email: checkedEmail.email,
  //   role: checkedEmail.role,
  // });

  // res.cookie("access_token", token);

  //Saving sessions into the database
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  //Create Access Token
  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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

  res.redirect("/");
};

export const addprogram = async (req, res) => {
  console.log(req.body);
  const { title, slogan, duration, plan, link } = req.body;

  const saveprogram = await saveProgram({
    title,
    slogan,
    duration,
    plan,
    link,
  });

  console.log(saveprogram);

  res.redirect("/admin");
};

export const payment = async (req, res) => {
  console.log(req.body);
  const { name, email } = req.user;
  const { plan, pkg, total } = req.body;
  const status = "Active";
  const transId = randomBytes(4).toString("hex");
  const paymentData = await paymentdata({
    name,
    email,
    plan,
    pkg,
    total,
    status,
    transId,
    userId: req.user.id,
  });
  console.log(paymentData);
  res.redirect("/subscription");
};

export const updateProgram = async (req, res) => {
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.status(404).send("Page not found");
  }

  try {
    const { title, slogan, duration, plan, link } = req.body;
    const newUpdateProgram = await updateProgramData({
      title,
      slogan,
      duration,
      plan,
      link,
      id,
    });
  } catch (error) {
    return res.status(200).send("Internal Server Erro");
  }

  res.redirect("/admin");
};

export const deleteProgram = async (req, res) => {
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.status(200).send("Something missing");
  }
  try {
    await deleteProgramData(id);
    res.redirect("/admin");
  } catch (error) {
    return res.status(200).send("Internal server error");
  }
};
