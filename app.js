import express from "express";
import dotenv from "dotenv";
import { routerdata } from "./router/router.js";
import session from "express-session";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import { verfiyToken } from "./middlewares/middleware.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(cookieParser());

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(requestIp.mw());

app.use(verfiyToken);

app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

app.use(routerdata);

// app.use((req, res) => {
//   res.redirect("/404");
// });

app.listen(PORT, () => {
  console.log(`Localhost is running on port ${PORT}`);
});
