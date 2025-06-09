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
  setPasswordValidation,
  verifyChangePassword,
  verifyEmail,
} from "../validation/validation.js";
import { randomBytes } from "crypto";
import { getForgotPasswordLinkPage } from "../lib/forgot-password-email.js";
import { sendEmail } from "../lib/resend-email.js";

//Function to register data into database
export const savedata = async (req, res) => {
  //CHeck user is logged in or not. if yes the return to homepage
  if (req.user) return res.redirect("/");

  //Validating all register data using zod validation
  const { data, error } = registerValidate.safeParse(req.body);

  ///If there is any error then show error to UI
  if (error) {
    console.log(error);
    req.flash("errors", error.errors[0].message);
    return res.redirect("/register");
  }

  //Destructuring name,email,password from data
  const { name, email, password } = data;

  //Getting all user data using email
  const [checkedEmail] = await checkEmail(email);

  //Checking checkedEmail data present or not. If present then show message user already exists
  if (checkedEmail) {
    req.flash("errors", "Email already exists !!!!");
    return res.redirect("/register");
  }

  //Hasing the password
  const pass = await hashpass(password);

  //Save register data into database
  const [user] = await saveData({ name, email, pass });

  //Setting accesstoken and refreshtoken
  await authenticateUser({ req, res, user, name, email });

  //Generating new email link send to users email
  await newEmailLink({ userId: user.id, email });

  res.redirect("/");
};

export const loginData = async (req, res) => {
  //Check user logged in or not. if yes the redirect to homepage
  if (req.user) return res.redirect("/");
  //console.log(req.body);

  //Validate the login data using zod
  const { data, error } = loginValidation.safeParse(req.body);

  //Check there is any error during validation
  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/login");
  }

  //extract email and password from zod data
  const { email, password } = data;

  //Getting users data using email
  const [user] = await checkEmail(email);
  //console.log(user);

  //Check user is present or not
  if (!user) {
    req.flash("errors", "Please check email and password");
    return res.redirect("/login");
  }

  //Check user password is present or not
  if (!user.pass) {
    req.flash(
      "errors",
      "You have created account using social login. Please login with your social account"
    );
    return res.redirect("/login");
  }

  //Comparing the database password and provided password
  const checkedPass = await checkPass(user.pass, password);

  //Checking password are matching or not
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

  //Setting session
  await authenticateUser({ req, res, user });

  res.redirect("/");
};

//Function for add program
export const addprogram = async (req, res) => {
  //Check user loggedin or not
  if (!req.user) return res.redirect("/login");

  //check user is admin or not
  if (req.user.role != "Admin") return res.redirect("/404");
  //console.log(req.body);

  //Getting data from post url
  const { title, slogan, duration, plan, link } = req.body;

  //Saving data into database
  const saveprogram = await saveProgram({
    title,
    slogan,
    duration,
    plan,
    link,
  });

  res.redirect("/admin");
};

//Function for payment
export const payment = async (req, res) => {
  //Getting name and email from req.user
  const { name, email } = req.user;

  //Getting data from post url
  const { plan, pkg, total } = req.body;

  //Setting status as active
  const status = "Active";

  //Generating random transaction id
  const transId = randomBytes(4).toString("hex").toUpperCase();

  //Storing payment data into database
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

//Function to update program
export const updateProgram = async (req, res) => {
  //Check user is loggedin or not
  if (!req.user) return res.redirect("/login");

  //Check user is admin or not
  if (req.user.role != "Admin") return res.redirect("/404");

  //Converting get url id into integer using zod
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  //Cheking any error in zod
  if (error) {
    return res.status(200).send("Internal Server Error");
  }

  try {
    //Gettting data from post url
    const { title, slogan, duration, plan, link } = req.body;

    //updating data into database
    const newUpdateProgram = await updateProgramData({
      title,
      slogan,
      duration,
      plan,
      link,
      id,
    });
  } catch (error) {
    //If there is any error then return internal server error
    return res.status(200).send("Internal Server Error");
  }

  res.redirect("/admin");
};

//Fuinction for delete program
export const deleteProgram = async (req, res) => {
  //Check user is loggedin or not
  if (!req.user) return res.redirect("/login");

  //Check user is admin or not
  if (req.user.role != "Admin") return res.redirect("/404");

  //Converting get url id into integer using zod
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  //Check any error into zod
  if (error) {
    return res.status(200).send("Something missing");
  }
  try {
    //Deleting program data from database using id
    await deleteProgramData(id);
    res.redirect("/admin");
  } catch (error) {
    //Check any error then return internal server error
    return res.status(200).send("Internal server error");
  }
};

//Function to add live classes
export const addLiveClass = async (req, res) => {
  //Check user is logged in or not
  if (!req.user) return res.redirect("/login");

  //Check user is admin or not
  if (req.user.role != "Admin") return res.redirect("/404");
  //console.log(req.body);

  //validating the post url data
  const { data, error } = liveClassValidation.safeParse(req.body);

  //Check any error during zod validation
  if (error) {
    req.flash("errors", error.errors[0].message);
    return res.redirect("/liveclass");
  }

  //Extracting all data form zod data
  const { title, slogan, instructor, plan, time, link } = data;

  try {
    //Storing live classes data into database
    const liveclass = await liveClass({
      title,
      slogan,
      instructor,
      plan,
      time,
      link,
    });
  } catch (error) {
    //If there is any error then return internal server error
    req.flash("errors", "Internal server error");
    return res.redirect("/liveclass");
  }

  res.redirect("/admin");
};

//function to delete class
export const deleteClass = async (req, res) => {
  //Check user is logged in or not
  if (!req.user) return res.redirect("/login");

  //Check user is admin or not
  if (req.user.role != "Admin") return res.redirect("/404");

  //Converting get url id into integer using zod
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  //If there is any error during zod validation
  if (error) {
    return res.status(200).send("Something missing");
  }
  try {
    //Function to delete classes using id
    await deleteClassData(id);
    res.redirect("/admin");
  } catch (error) {
    //If there is any error then return internal server error
    console.log(error);
    return res.status(200).send("Internal server error");
  }
};

//fdunction to update profile
export const updateProfile = async (req, res) => {
  //validating the post url data using zod
  const { data, error } = nameValidation.safeParse(req.body);

  //Check there is any error during zod validation
  if (error) {
    console.log(error);
    req.flash("errors", error.errors[0].message);
    return res.redirect("/edit-profile");
  }

  //await updateNameById({ userId: req.user.id, name: data.name });

  //Setting the file name if presesnt else set undefined
  const fileUrl = req.file ? `${req.file.filename}` : undefined;

  //Function to udate profile using id
  await updateNameById({
    userId: req.user.id,
    name: data.name,
    avatarUrl: fileUrl,
  });

  res.redirect("/profile");
};

//Function to change password
export const changePassword = async (req, res) => {
  //Getting post url data and validate with zod
  const { data, error } = verifyChangePassword.safeParse(req.body);

  //Check any error during validation
  if (error) {
    const errorMessage = error.errors.map((error) => error.message);
    req.flash("errors", errorMessage);
    return res.redirect("/change-password");
  }

  //Getting password from zod data
  const { currentPassword, newPassword } = data;

  //function to find user uising id
  const user = await findUserById(req.user.id);

  //Comparing password with database password
  const checkedPass = await checkPass(user.pass, currentPassword);

  //if there is any error during comparing the password
  if (!checkedPass) {
    req.flash("errors", "Current password that you entered invalid");
    return res.redirect("/change-password");
  }

  //Hashign the password
  const pass = await hashpass(newPassword);

  //Updaing the password
  await updatePassword({ userId: user.id, pass });

  res.redirect("/profile");
};

//Function for forgot password
export const forgotPassword = async (req, res) => {
  //Validate Email is valid or not
  const { data, error } = verifyEmail.safeParse(req.body);

  //Check errors during zod validation
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/reset-password");
  }

  //Getting all data of user if it exists by email
  const [user] = await checkEmail(data.email);

  //if user is present
  if (user) {
    //Function to create reset password link using userId
    const resetPasswordLink = await createResetPasswordLink({
      userId: user.id,
    });

    //Function to send email to user using resend
    const html = await getForgotPasswordLinkPage("resend-email", {
      name: user.name,
      link: resetPasswordLink,
    });
    // console.log(html);

    //Sending the email
    sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html,
    });
  }
  req.flash("formsubmitted", true);
  return res.redirect("/reset-password");
};

//Function to reset password
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

//Funtion to set password
export const setPassword = async (req, res) => {
  //Check user is loggedin or not
  if (!req.user) return res.redirect("/login");

  //Validating the post url data using zod
  const { data, error } = setPasswordValidation.safeParse(req.body);

  //Check there is any error during validation
  if (error) {
    const errorMessage = error.errors.map((err) => err.message);
    req.flash("errors", errorMessage);
    return res.redirect("/set-password");
  }

  //Getting new password frrm zod data
  const { newPassword } = req.body;

  //Function to find user by id
  const user = await findUserById(req.user.id);

  //check user password is present or not
  if (user.pass) {
    req.flash(
      "errors",
      "You already have your password. Insted change your password"
    );
    return res.redirect("/set-password");
  }

  //Hasing the password
  const pass = await hashpass(newPassword);

  //Updating the password
  await updatePassword({ userId: req.user.id, pass });

  res.redirect("/profile");
};
