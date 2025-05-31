import { z } from "zod";
import {
  changeStatus,
  clearUserSession,
  clearVerifyEmailTokens,
  createEmailLink,
  findUserById,
  findVerificationToken,
  generateEmailToken,
  getClassLink,
  getLiveClassData,
  getPayment,
  getProgram,
  getProgramById,
  getPrograms,
  getStatus,
  getSubscription,
  getUser,
  insertEmailToken,
  newEmailLink,
  verifyEmailAndUpdate,
} from "../model/model.js";
//import { sendEmail } from "../lib/nodemailer.js";
import { verifyTokenEmail } from "../validation/validation.js";

export const homepage = (req, res) => {
  res.render("homepage");
};

export const planpage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  const plan = [
    {
      title: "Namaste Starter",
      plan: "Free",
      slogan: "ideal for curious beginners",
      features: [
        "Limited access to beginner video content",
        "Live class per month",
        "No downloads or offline access",
        "No membership card",
      ],
      price: "0",
    },
    {
      title: "Wellness Seeker",
      plan: "Basic",
      slogan: "for fitness enthusiastic starting their journey",
      features: [
        "Access to begineer & intermediate workouts",
        "2 live class per month",
        "Downloads & offline access",
        "Access of studio at 12:00 PM",
      ],
      price: "499",
    },
    {
      title: "Professional Yogi",
      plan: "Standard",
      slogan: "Full body wellness experience",
      features: [
        "Unlimited access to all video",
        "Unlimited live classes",
        "Downloads & offline access",
        "Access of studio",
        "Digital Membership Card",
      ],
      price: "799",
    },
    {
      title: "Unlimited Wellness",
      plan: "Premium",
      slogan: "Best for long-term commitment",
      features: [
        "Everything in premium",
        "Free wellness merchandise after 6 months",
        "Early access to new content",
        "Access of studio at 12:00 PM",
      ],
      price: "899",
    },
  ];
  res.render("planpage", { plan });
};

export const subscriptionpage = (req, res) => {
  if (!req.user) return res.redirect("/login");

  const plans = {
    Free: 0,
    Basic: 499,
    Standard: 799,
    Premium: 899,
  };
  const { name, email } = req.user;
  const title = req.params.title;
  const amount = plans[title];
  res.render("subscription", {
    title,
    amount,
    name,
    email,
    msg: req.flash("errors"),
  });
};

export const loginpage = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("login", { msg: req.flash("errors") });
};

export const registerpage = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("register", { msg: req.flash("errors") });
};

export const adminpage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role != "Admin") return res.redirect("/404");
  const programs = await getPrograms();
  //console.log(programs);

  const users = await getUser();

  const payment = await getPayment();

  const liveclasses = await getLiveClassData();

  res.render("admin", { liveclasses, programs, users, payment });
};

export const userpage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { id, name } = req.user;
  const subscriptions = await getSubscription(id);
  //console.log(subscriptions);

  const planList = subscriptions.map((p) => p.plan);

  const programs = await getProgram(planList);

  const classLinks = await getClassLink(planList);
  console.log(classLinks);

  res.render("user", { name, programs, subscriptions, classLinks });
};

export const programpage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role != "Admin") return res.redirect("/404");
  res.render("programpage");
};

export const cardpage = (req, res) => {
  if (!req.user) return res.redirect("/login");

  const { plan, pkg, purchase, expire } = req.query;
  const user = req.user.name;
  const qrData = {
    name: user,
    plan: plan,
    package: pkg,
    date: purchase,
    expiry: expire,
  };

  const jsonString = JSON.stringify(qrData);
  const encodedData = encodeURIComponent(jsonString);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;

  res.render("card", { user, plan, pkg, purchase, expire, qrCodeUrl });
};

export const logout = async (req, res) => {
  // console.log(req.user.sessionId);
  await clearUserSession(req.user.sessionId);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/");
};

export const editprogram = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  if (req.user.role != "Admin") return res.redirect("/404");

  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) return res.status(200).send("Internal Server Error");

  try {
    const [programs] = await getProgramById(id);
    console.log(programs);
    if (!programs) {
      return res.res.status(200).send("Internal Server Error");
    }
    res.render("editprogram", { programs });
  } catch (error) {
    return res.status(200).send("Internal Server Error");
  }
};

export const getLiveClass = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  try {
    res.render("liveclass", { msg: req.flash("errors") });
  } catch (error) {
    res.status(400).send("Inernal Server error");
  }
};

export const editclass = async (req, res) => {
  //Check cookie present or not
  if (!req.user) return res.redirect("/login");

  //Check Admin login or not
  if (req.user.role != "Admin") return res.redirect("/404");

  //Id converted into integer using zod
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  //Check if there is any error
  if (error) return res.status(200).send("Internal Server Error");

  //Get status data from database
  const [stat] = await getStatus(id);

  //Check status ture or false and change opposite of that
  if (stat.status == true) {
    await changeStatus(id, false);
  } else {
    await changeStatus(id, true);
  }

  //After successful redirect to admin page.
  res.redirect("/admin");
};

export const paymentPage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("paymentdone");
};

export const pageNot = (req, res) => {
  res.render("404");
};

export const profilePage = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.redirect("/login");
  res.render("profile", { user });
};

export const verifyEmail = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = await findUserById(req.user.id);

  if (!user || user.isEmailValid) return res.redirect("/");

  return res.render("emailVerify", {
    email: user.email,
  });
};

export const resendCode = async (req, res) => {
  //Check user loggedin or not
  if (!req.user) return res.redirect("/login");

  await newEmailLink({ userId: req.user.id, email: req.user.email });

  return res.redirect("/verify-email");
};

export const verifyEmailToken = async (req, res) => {
  const { data, error } = verifyTokenEmail.safeParse(req.query);

  if (error)
    return res.status(400).send("Varification link invalid or expired");

  const [token] = await findVerificationToken(data);

  if (!token) return res.send("Varification link invalid or expired");

  await verifyEmailAndUpdate(token.email);

  await clearVerifyEmailTokens(token.userId);

  res.redirect("/profile");
};

export const editProfile = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  console.log(req.user.id);

  const user = await findUserById(req.user.id);

  res.render("editprofile", { name: user.name, msg: req.flash("errors") });
};

export const changePasswordPage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("changepass", { msg: req.flash("errors") });
};
