import { Router } from "express";
import {
  adminpage,
  cardpage,
  changePasswordPage,
  editclass,
  editProfile,
  editprogram,
  forgotPasswordPage,
  getGithubLoginCallback,
  getGoogleLoginCallback,
  getLiveClass,
  getSetPasswordPage,
  githubLoginPage,
  googleLoginPage,
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
  resetPasswordPage,
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
  resetPassword,
  savedata,
  setPassword,
  updateProfile,
  updateProgram,
} from "../controller/post.controller.js";
import multer from "multer";
import path from "path";

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

//For file uploads
const avatarStorage = multer.diskStorage({
  //Setting the destination of file
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },

  //Set the name of file
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random()}${ext}`);
  },
});

//To check file is image or not
const avatarFileFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

//Setting all file into avatarUpload
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, //Image size is 5mb
});

router
  .route("/edit-profile")
  .get(editProfile)
  .post(avatarUpload.single("avatar"), updateProfile);

router.route("/change-password").get(changePasswordPage).post(changePassword);

router.route("/reset-password").get(forgotPasswordPage).post(forgotPassword);

router
  .route("/reset-password/:token")
  .get(resetPasswordPage)
  .post(resetPassword);

router.route("/google").get(googleLoginPage);

router.route("/google/callback").get(getGoogleLoginCallback);

router.route("/github").get(githubLoginPage);

router.route("/github/callback").get(getGithubLoginCallback);

router.route("/set-password").get(getSetPasswordPage).post(setPassword);

export const routerdata = router;
