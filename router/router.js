import { Router } from "express";
import { adminpage, cardpage, homepage, loginpage, planpage, programpage, registerpage, subscriptionpage, userpage } from "../controller/controller.js";
import { loginData, savedata } from "../controller/post.controller.js";

const router = Router();

router.route('/').get(homepage);

router.route('/plan').get(planpage);

router.route('/subscription').get(subscriptionpage);

router.route('/login').get(loginpage).post(loginData);

router.route('/register').get(registerpage).post(savedata);

router.route('/admin').get(adminpage);

router.route('/user').get(userpage);

router.route('/program').get(programpage);

router.route('/card').get(cardpage);

export const routerdata = router;