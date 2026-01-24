import env from "../env.js";

const isDev = env.NODE_ENV === "development";
type CookiesType = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | "lax" | "strict" | "none" | undefined;
  maxAge: number;
};
export const authConfig: {
  refreshCookies: CookiesType;
  accessCookies: CookiesType;
} = {
  refreshCookies: {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
    maxAge: 60 * 60 * 1000,
  },
  accessCookies: {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? "lax" : "none",
    maxAge: 60 * 15 * 1000, //15 min
  },
};
export const corsConfig = {
  origin: isDev ? "http://localhost:3000" : env.FRONTEND_URL,
  credentials: true,
};
export const rfTokenExpiry = env.RF_TOKEN_EXPIRY;
export const acTokenExpiry = env.AC_TOKEN_EXPIRY;
export const port = env.PORT;
