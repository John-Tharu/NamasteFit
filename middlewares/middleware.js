import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constant.js";
import { refreshTokens, verifytoken } from "../model/model.js";

// export const verfiyToken = (req, res, next) => {
//   const token = req.cookies.access_token;
//   if (!token) {
//     req.user = null;
//     return next();
//   }

//   try {
//     const decodedToken = verifytoken(token);
//     req.user = decodedToken;
//     console.log(req.user);
//   } catch (error) {
//     req.user = null;
//     return next();
//   }
//   return next();
// };

//According to refresh token and access token create new refresh and access token
export const verfiyToken = async (req, res, next) => {
  //Getting access token from user device
  const accessToken = req.cookies.access_token;

  //Gettind refresh token from user device
  const refreshToken = req.cookies.refresh_token;

  //Initally set req.user as null
  req.user = null;

  //Check accesstoken and refresh token is present or not. if not then back the process
  if (!accessToken && !refreshToken) {
    return next();
  }

  //If accesstoken present the verify the token and set req.user with data
  if (accessToken) {
    //Verifying accesstoken and get data
    const decodedToken = verifytoken(accessToken);

    //Setting req.user
    req.user = decodedToken;

    //Goto next process
    return next();
  }

  //If refreshtoken presnet then generate new accesstoken and refresht token
  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, userInfo } =
        await refreshTokens(refreshToken);

      req.user = userInfo;

      //Base configuratiom for url
      const baseConfig = { httpOnly: true, secure: true };

      //Setting Access Token to the client PC
      res.cookie("access_token", newAccessToken, {
        ...baseConfig,
        maxAge: ACCESS_TOKEN_EXPIRY,
      });

      //Setting Refresh Token to the client PC
      res.cookie("refresh_token", newRefreshToken, {
        ...baseConfig,
        maxAge: REFRESH_TOKEN_EXPIRY,
      });

      //Goto next process
      return next();
    } catch (error) {
      //If there is any error
      console.log(error.message);
    }
  }
  //All things going good then goto next page otherwise back to previous page
  return next();
};
