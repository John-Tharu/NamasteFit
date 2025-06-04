import { z } from "zod";
import {
  authenticateUser,
  checkEmail,
  checkPass,
  clearResetPasswordToken,
  createResetPasswordLink,
  deleteClassData,
  deleteProgramData,
  findUserById,
  hashpass,
  liveClass,
  newEmailLink,
  paymentdata,
  resetPasswordData,
  saveData,
  saveProgram,
  updateNameById,
  updatePassword,
  updateProgramData,
} from "../model/model.js";
import {
  liveClassValidation,
  loginValidation,
  nameValidation,
  registerValidate,
  resetPasswordValidation,
  verifyChangePassword,
  verifyEmail,
} from "../validation/validation.js";
import { randomBytes } from "crypto";
import { getForgotPasswordLinkPage } from "../lib/forgot-password-email.js";
import { sendEmail } from "../lib/resend-email.js";

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
  //console.log(checkedEmail);

  if (checkedEmail) {
    req.flash("errors", "Email already exists !!!!");
    return res.redirect("/register");
  }

  const pass = await hashpass(password);

  const [user] = await saveData({ name, email, pass });

  await authenticateUser({ req, res, user, name, email });

  await newEmailLink({ userId: user.id, email });

  res.redirect("/");
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

  if (!user.pass) {
    req.flash(
      "errors",
      "You have created account using social login. Please login with your social account"
    );
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

  await authenticateUser({ req, res, user });

  res.redirect("/");
};

export const addprogram = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  if (req.user.role != "Admin") return res.redirect("/404");
  //console.log(req.body);
  const { title, slogan, duration, plan, link } = req.body;

  const saveprogram = await saveProgram({
    title,
    slogan,
    duration,
    plan,
    link,
  });

  res.redirect("/admin");
};

export const payment = async (req, res) => {
  const { name, email } = req.user;
  const { plan, pkg, total } = req.body;
  const status = "Active";
  const transId = randomBytes(4).toString("hex").toUpperCase();
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
  res.redirect("/paymentdone");
};

export const updateProgram = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  if (req.user.role != "Admin") return res.redirect("/404");
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.status(200).send("Internal Server Error");
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
    return res.status(200).send("Internal Server Error");
  }

  res.redirect("/admin");
};

export const deleteProgram = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  if (req.user.role != "Admin") return res.redirect("/404");

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

export const addLiveClass = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role != "Admin") return res.redirect("/404");
  //console.log(req.body);

  const { data, error } = liveClassValidation.safeParse(req.body);
  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/liveclass");
  }

  const { title, slogan, instructor, plan, time, link } = data;

  try {
    const liveclass = await liveClass({
      title,
      slogan,
      instructor,
      plan,
      time,
      link,
    });
  } catch (error) {
    req.flash("errors", "Internal server error");
    return res.redirect("/liveclass");
  }

  res.redirect("/admin");
};

export const deleteClass = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role != "Admin") return res.redirect("/404");

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) {
    return res.status(200).send("Something missing");
  }
  try {
    await deleteClassData(id);
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
    return res.status(200).send("Internal server error");
  }
};

export const updateProfile = async (req, res) => {
  const { data, error } = nameValidation.safeParse(req.body);

  if (error) {
    console.log(error);
    req.flash("errors", error.errors[0].message);
    return res.redirect("/edit-profile");
  }

  await updateNameById({ userId: req.user.id, name: data.name });

  res.redirect("/profile");
};

export const changePassword = async (req, res) => {
  const { data, error } = verifyChangePassword.safeParse(req.body);

  if (error) {
    const errorMessage = error.errors.map((error) => error.message);
    req.flash("errors", errorMessage);
    return res.redirect("/change-password");
  }

  const { currentPassword, newPassword } = data;

  const user = await findUserById(req.user.id);

  const checkedPass = await checkPass(user.pass, currentPassword);

  if (!checkedPass) {
    req.flash("errors", "Current password that you entered invalid");
    return res.redirect("/change-password");
  }

  const pass = await hashpass(newPassword);

  await updatePassword({ userId: user.id, pass });

  res.redirect("/profile");
};

export const forgotPassword = async (req, res) => {
  //Validate Email is valid or not
  const { data, error } = verifyEmail.safeParse(req.body);

  //Check errors
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/reset-password");
  }

  //Getting all data of user if it exists by email
  const [user] = await checkEmail(data.email);

  if (user) {
    const resetPasswordLink = await createResetPasswordLink({
      userId: user.id,
    });

    const html = await getForgotPasswordLinkPage("resend-email", {
      name: user.name,
      link: resetPasswordLink,
    });
    // console.log(html);

    sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html,
    });
  }
  req.flash("formsubmitted", true);
  return res.redirect("/reset-password");
};

export const resetPassword = async (req, res) => {
  //Getting the token from the URL
  const { token } = req.params;

  //Getting the user data from database
  const tokenData = await resetPasswordData(token);

  //Checking the user exist or not. if not then redirect to expire page
  if (!tokenData) return res.render("expirepage");

  //Checking the New Password and current password using zod
  const { data, error } = resetPasswordValidation.safeParse(req.body);

  //For error handing
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    res.redirect(`/reset-password/${token}`);
  }

  //Extract newPassword from data
  const { newPassword } = data;

  //Getting all data of user
  const user = await findUserById(tokenData.userId);

  //Deleting all the previous token of a user
  await clearResetPasswordToken(user.id);

  //Hashing the password to save into database
  const pass = await hashpass(newPassword);

  //Updating the password of a user
  await updatePassword({ userId: user.id, pass });

  //Redirect to the login page
  res.redirect("/login");
};
