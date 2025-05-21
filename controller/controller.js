import { z } from "zod";
import {
  getPayment,
  getProgram,
  getProgramById,
  getPrograms,
  getSubscription,
  getUser,
} from "../model/model.js";

export const homepage = (req, res) => {
  if (!req.user) return res.redirect("/login");
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
  res.render("subscription", { title, amount, name, email });
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
  const programs = await getPrograms();
  //console.log(programs);

  const users = await getUser();

  const payment = await getPayment();

  res.render("admin", { programs, users, payment });
};

export const userpage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const { id, name } = req.user;
  const subscriptions = await getSubscription(id);
  //console.log(subscriptions);

  const planList = subscriptions.map((p) => p.plan);

  const programs = await getProgram(planList);

  res.render("user", { name, programs, subscriptions });
};

export const programpage = (req, res) => {
  if (!req.user) return res.redirect("/login");
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

export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
};

export const editprogram = async (req, res) => {
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);

  if (error) return res.status(404).send("Page Not found");

  try {
    const [programs] = await getProgramById(id);
    console.log(programs);
    if (!programs) {
      return res.status(404).send("Page not found");
    }
    res.render("editprogram", { programs });
  } catch (error) {
    return res.status(404).send("Page Not found");
  }
};

export const getLiveClass = (req, res) => {
  res.render("liveclass");
};
