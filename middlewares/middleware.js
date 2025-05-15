import { verifytoken } from "../model/model.js";

export const verfiyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = verifytoken(token);
    req.user = decodedToken;
    console.log(req.user);
  } catch (error) {
    req.user = null;
    return next();
  }
  return next();
};
