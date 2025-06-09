import express from "express";
import dotenv from "dotenv";
import { routerdata } from "./router/router.js";
import session from "express-session";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import { verfiyToken } from "./middlewares/middleware.js";
dotenv.config();

//app getting all instance of express
const app = express();

//Gettting PORT number from .env file
const PORT = process.env.PORT;

//For sendind get data securely
app.use(express.urlencoded({ extended: true }));

//for session management
app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

//to show ant message
app.use(flash());

//Getting cookie from user device
app.use(cookieParser());

//For showing ejs file to the user
app.set("view engine", "ejs");

//Making public the files of public folder
app.use(express.static("public"));

//To getting Ip address from the client device
app.use(requestIp.mw());

//Middleware to verify token
app.use(verfiyToken);

//Setting req.user and can accessable from anywhere
app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

//Connect router with app.js
app.use(routerdata);

//for undefined url
app.use((req, res) => {
  res.redirect("/404");
});

//Running app in our localhost with port
app.listen(PORT, () => {
  console.log(`Localhost is running on port ${PORT}`);
});
