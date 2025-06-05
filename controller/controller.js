import { z } from "zod";
import {
  authenticateUser,
  changeStatus,
  clearUserSession,
  clearVerifyEmailTokens,
  createUserWithOauth,
  findUserById,
  findVerificationToken,
  getClassLink,
  getLiveClassData,
  getPayment,
  getProgram,
  getProgramById,
  getPrograms,
  getStatus,
  getSubscription,
  getUser,
  getUserWithOauthId,
  linkUserWithOauth,
  newEmailLink,
  resetPasswordData,
  verifyEmailAndUpdate,
} from "../model/model.js";
//import { sendEmail } from "../lib/nodemailer.js";
import { verifyTokenEmail } from "../validation/validation.js";
import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { OAUTH_EXCHANGE_EXPIRY } from "../config/constant.js";
import { google } from "../lib/oauth/google.js";
import { github } from "../lib/oauth/github.js";

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
  const { id } = req.user;
  //Getrting User data by id
  const user = await findUserById(id);

  //Getting Subscription data by ID
  const subscriptions = await getSubscription(id);
  //console.log(subscriptions);

  //Plan list form subscription
  const planList = subscriptions.map((p) => p.plan);

  //getting programs by planlist
  const programs = await getProgram(planList);

  //Getting live class links according to planlist
  const classLinks = await getClassLink(planList);

  res.render("user", { name: user.name, programs, subscriptions, classLinks });
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
  res.render("profile", {
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isEmailValid: user.isEmailValid,
      createdAt: user.createdAt,
      hasPassword: Boolean(user.pass),
    },
  });
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

  const user = await findUserById(req.user.id);

  res.render("editprofile", {
    name: user.name,
    avatarUrl: user.avatarUrl,
    msg: req.flash("errors"),
  });
};

export const changePasswordPage = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("changepass", { msg: req.flash("errors") });
};

export const forgotPasswordPage = (req, res) => {
  res.render("forgotPassword", {
    formSubmittted: req.flash("formsubmitted")[0],
    msg: req.flash("errors"),
  });
};

//Function fot resetPasswordPage
export const resetPasswordPage = async (req, res) => {
  //Getting the token from the URL
  const { token } = req.params;

  //Getting the user data from database
  const user = await resetPasswordData(token);

  //Checking the user exist or not. if not then redirect to expire page
  if (!user) return res.render("expirepage");

  //If all the above condition right then render the resetpage with some additional value
  res.render("resetpage", {
    formSubmittted: req.flash("formsubmitted")[0],
    token,
    msg: req.flash("errors"),
  });
};

//Function for googleLoginPage
export const googleLoginPage = async (req, res) => {
  //Check if user login then redirect to home page
  if (req.user) return res.redirect("/");

  //Generate State using Artic
  const state = generateState();

  //Generate codeVerifier using Artic
  const codeVerifier = generateCodeVerifier();

  //Generate URL using Artic
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid", ///It gives tokens
    "profile", //It gives profile
    "email",
  ]);

  //Configuration for cookie
  const cookieConfig = {
    httpOnly: true,
    secure: true,
    maxAge: OAUTH_EXCHANGE_EXPIRY,
    sameSite: "lax",
  };

  //Store state and codeVerifier as cookies at users browsers
  res.cookie("google_oauth_state", state, cookieConfig);
  res.cookie("google_code_verifier", codeVerifier, cookieConfig);

  //Redirect to the google login page
  res.redirect(url.toString());
};

//Function of getGoogleLoginCAllback
export const getGoogleLoginCallback = async (req, res) => {
  //Google returns code and stated in query params. We can use code to find user
  const { code, state } = req.query;
  //console.log(`code: ${code} and state ${state}`);

  //Getting cookies from users Browser
  const {
    google_oauth_state: storedState,
    google_code_verifier: codeVerifier,
  } = req.cookies;

  // console.log(
  //   `google_oauth: ${storedState} and google_Secret: ${codeVerifier}`
  // );

  //check code,state,storedState,codeVerifier present or not
  //also check state from google and state at user broswer equal or not
  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    //Returning the error and login page
    req.flash(
      "errors",
      "Couldn't login with google because of invalid login attemp. Please try again!"
    );

    return res.redirect("/login");
  }

  //Verify the google code and users coderVerifier
  let tokens;
  try {
    //Verifies code and codeVerifier using Artic NPM Package
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    req.flash(
      "errors",
      "Couldn't login with google because of invalid login attemp. Please try again!"
    );
    return res.redirect("/login");
  }

  //console.log(`Token google ${tokens}`);

  //After getting tokens we can claim userId,name,email using Artic
  const claims = decodeIdToken(tokens.idToken());
  const { sub: googleUserId, name, email } = claims;

  //if user already linked then we will get the user
  let user = await getUserWithOauthId({
    provider: "google",
    email,
  });

  //If user exists but user is not linked with oauth
  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  //if user doesn't exists
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  //Creating Session with JWT and refresh token
  await authenticateUser({ req, res, user, name, email });

  res.redirect("/");
};

//Function for githubLoginPage
export const githubLoginPage = (req, res) => {
  //Check user logged in or not
  if (req.user) return res.redirect("/");

  //Generate State using Artic
  const state = generateState();

  //Generate URL using Artic
  const url = github.createAuthorizationURL(state, ["user:email"]);

  //Configuration for cookie
  const cookieConfig = {
    httpOnly: true,
    secure: true,
    maxAge: OAUTH_EXCHANGE_EXPIRY,
    sameSite: "lax",
  };

  //Store state and codeVerifier as cookies at users browsers
  res.cookie("github_oauth_state", state, cookieConfig);

  //Redirect to the google login page
  res.redirect(url.toString());
};

export const getGithubLoginCallback = async (req, res) => {
  //Getting code and state from URL provided by github
  const { code, state } = req.query;

  //Getting gihub cookies from users browser
  const { github_oauth_state: storedState } = req.cookies;

  //Function to handle error
  function handleFailedLogin() {
    req.flash(
      "errors",
      "Couldn't login with Github because of invalid login attempt. Please try again !"
    );

    //Return to login page
    return res.redirect("/login");
  }

  //Check code, state, storedState are present or not
  if (!code || !state || !storedState || state !== storedState) {
    return handleFailedLogin();
  }

  let tokens;
  try {
    //Validate the code provided by github using artic
    tokens = await github.validateAuthorizationCode(code);
  } catch {
    return handleFailedLogin();
  }

  //Fetching data of user from github using accessToken saved into tokens
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken()}`,
    },
  });

  //Check githubUserResponse present or not
  if (!githubUserResponse.ok) return handleFailedLogin();

  //if all going good convert into json
  const githubUser = await githubUserResponse.json();

  //After converting extract id and name from githubUserResponse
  const { id: githubUserId, name } = githubUser;

  //Fecth user email data from github using accessToken
  const githubEmailResponse = await fetch(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    }
  );

  //Check githubEmailResponse present or not
  if (!githubEmailResponse.ok) return handleFailedLogin();

  //If all good then convert into json format
  const emails = await githubEmailResponse.json();

  //There are many emails addresss in github. To get primary email address we use this code
  const email = emails.filter((e) => e.primary)[0].email;

  //Check email is present or not
  if (!email) return handleFailedLogin();

  //User already exist with github's oauth linked
  let user = await getUserWithOauthId({
    provider: "github",
    email,
  });

  //User already exists with same email but github account not linked
  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "github",
      providerAccountId: githubUserId,
    });
  }

  //if user register and no github account link
  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "github",
      providerAccountId: githubUserId,
    });
  }

  //This is for session
  await authenticateUser({ req, res, user, name, email });

  res.redirect("/");
};

export const getSetPasswordPage = (req, res) => {
  if (!req.user) return redirect("/login");

  res.render("setpassword", { msg: req.flash("errors") });
};
