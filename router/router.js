import { Router } from "express";
import {
  adminpage,
  cardpage,
  editprogram,
  getLiveClass,
  homepage,
  loginpage,
  logout,
  planpage,
  programpage,
  registerpage,
  subscriptionpage,
  userpage,
} from "../controller/controller.js";
import {
  addprogram,
  deleteProgram,
  loginData,
  payment,
  savedata,
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

router.route("/liveClass").get(getLiveClass);

export const routerdata = router;
