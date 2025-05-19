import {
  checkEmail,
  checkPass,
  generateToken,
  hashpass,
  paymentdata,
  saveData,
  saveProgram,
} from "../model/model.js";
import { loginValidation, registerValidate } from "../validation/validation.js";
import { randomBytes } from "crypto";

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

  const [checkedEmail] = await checkEmail(email);
  //console.log(checkedEmail);

  if (!checkedEmail) {
    req.flash("errors", "Please check email and password");
    return res.redirect("/login");
  }

  const checkedPass = await checkPass(checkedEmail.pass, password);

  if (!checkedPass) {
    req.flash("errors", "Please check email or password");
    return res.redirect("/login");
  }

  const token = generateToken({
    id: checkedEmail.id,
    name: checkedEmail.name,
    email: checkedEmail.email,
    role: checkedEmail.role,
  });

  res.cookie("access_token", token);

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

  res.redirect("/program");
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
