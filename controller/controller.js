import { getProgram, getUser } from "../model/model.js";

export const homepage = (req, res) => {
  res.render("homepage");
};

export const planpage = (req, res) => {
  const plan = [
    {
      title: "Namaste Starter  Free Plan",
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
      title: "Wellness Seeker  Basic Plan",
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
      title: "Professional Yogi  Premium Plan",
      slogan: "Full body wellness experience",
      features: [
        "Unlimited access to all video",
        "Unlimited live classes",
        "Downloads & offline access",
        "Access of studio",
        "Digital Membership Card",
      ],
      price: "999",
    },
    {
      title: "Unlimited Wellness  Annual Plan",
      slogan: "Best for long-term commitment",
      features: [
        "Everything in premium",
        "Free wellness merchandise after 6 months",
        "Early access to new content",
        "Access of studio at 12:00 PM",
      ],
      price: "9999",
    },
  ];
  res.render("planpage", { plan });
};

export const subscriptionpage = (req, res) => {
  const title = req.params.title;
  res.render("subscription", { title });
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
  const programs = await getProgram();
  //console.log(programs);

  const users = await getUser();

  console.log(users);
  const subscribers = [
    {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      plan: "Monthly Plan",
      joinDate: "2025-05-01",
    },
  ];

  const payments = [
    {
      user: "Sneha Gurung",
      plan: "HIIT Workout",
      amount: 14.99,
      date: "2025-05-05",
      txnId: "TXN123456",
    },
  ];

  res.render("admin", { programs, users, subscribers, payments });
};

export const userpage = (req, res) => {
  const user = { name: "JOhn" };

  const programs = [
    {
      title: "Morning Stretch",
      description: "Start your day fresh",
      duration: 30,
      price: 10,
      videoUrl: "https://youtube.com/...",
    },
    {
      title: "Core Strength",
      description: "Focus on abs and core",
      duration: 45,
      price: 15,
      videoUrl: "https://youtube.com/...",
    },
    {
      title: "Core Strength",
      description: "Focus on abs and core",
      duration: 45,
      price: 15,
      videoUrl: "https://youtube.com/...",
    },
    {
      title: "Core Strength",
      description: "Focus on abs and core",
      duration: 45,
      price: 15,
      videoUrl: "https://youtube.com/...",
    },
    {
      title: "Core Strength",
      description: "Focus on abs and core",
      duration: 45,
      price: 15,
      videoUrl: "https://youtube.com/...",
    },
    {
      title: "Core Strength",
      description: "Focus on abs and core",
      duration: 45,
      price: 15,
      videoUrl: "https://youtube.com/...",
    },
  ];

  const subscriptions = [
    {
      _id: 1,
      plan: "Morning Stretch",
      amount: 10,
      date: "2025-05-01",
      status: "Active",
    },
    {
      _id: 2,
      plan: "Core Strength",
      amount: 15,
      date: "2025-04-01",
      status: "Cancelled",
    },
  ];

  res.render("user", { user, programs, subscriptions });
};

export const programpage = (req, res) => {
  res.render("programpage");
};

export const cardpage = (req, res) => {
  const user = { name: "Ramesh Koirala" };
  const program = { title: "Power HIIT Burn" };
  const purchaseDate = "2025-05-10";
  const expiryDate = "2025-06-10";
  const qrCodeUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Ramesh+PowerHIIT";

  res.render("card", { user, program, purchaseDate, expiryDate, qrCodeUrl });
};

export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
};
