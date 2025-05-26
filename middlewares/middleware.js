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

export const verfiyToken = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  req.user = null;

  if (!accessToken && !refreshToken) {
    return next();
  }

  if (accessToken) {
    const decodedToken = verifytoken(accessToken);
    req.user = decodedToken;
    return next();
  }

  if (refreshToken) {
    try {
      const { newAccessToken, newRefreshToken, userInfo } = await refreshTokens(
        refreshToken
      );

      req.user = userInfo;

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

      return next();
    } catch (error) {
      console.log(error.message);
    }
  }
  return next();
};
