import { Router } from "express";
import {
  adminpage,
  cardpage,
  changePasswordPage,
  editclass,
  editProfile,
  editprogram,
  forgotPasswordPage,
  getLiveClass,
  homepage,
  loginpage,
  logout,
  pageNot,
  paymentPage,
  planpage,
  profilePage,
  programpage,
  registerpage,
  resendCode,
  subscriptionpage,
  userpage,
  verifyEmail,
  verifyEmailToken,
} from "../controller/controller.js";
import {
  addLiveClass,
  addprogram,
  changePassword,
  deleteClass,
  deleteProgram,
  forgotPassword,
  loginData,
  payment,
  savedata,
  updateProfile,
  updateProgram,
} from "../controller/post.controller.js";

const router = Router();

router.route("/").get(homepage);

router.route("/plan").get(planpage);

router.route("/subscription/:title").get(subscriptionpage);

router.route("/subscription").get(subscriptionpage).post(payment);

router.route("/login").get(loginpage).post(loginData);

router.route("/register").get(registerpage).post(savedata);

router.route("/admin").get(adminpage);

router.route("/dashboard").get(userpage);

router.route("/program").get(programpage).post(addprogram);

router.route("/card").get(cardpage);

router.route("/logout").get(logout);

router.route("/edit/:id").get(editprogram).post(updateProgram);

router.route("/delete/:id").post(deleteProgram);

router.route("/liveClass").get(getLiveClass).post(addLiveClass);

router.route("/classedit/:id").get(editclass);

router.route("/deleteClass/:id").post(deleteClass);

router.route("/paymentdone").get(paymentPage);

router.route("/404").get(pageNot);

router.route("/profile").get(profilePage);

router.route("/verify-email").get(verifyEmail);

router.route("/resendCode").post(resendCode);

router.route("/verify-email-token").get(verifyEmailToken);

router.route("/edit-profile").get(editProfile).post(updateProfile);

router.route("/change-password").get(changePasswordPage).post(changePassword);

router.route("/reset-password").get(forgotPasswordPage).post(forgotPassword);

export const routerdata = router;
