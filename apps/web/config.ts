import dotenv from "dotenv";
dotenv.config();

export const HTTP_BE_URL = process.env.HTTP_BACKEND || "";

export const GITHUB_ID = process.env.GITHUB_ID || "";
export const GITHUB_SECRET = process.env.GITHUB_SECRET || "";

export const GOOGLE_ID = process.env.GOOGLE_ID || "";
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET || "";

export const FACEBOOK_ID = process.env.FACEBOOK_ID || "";
export const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET || "";
