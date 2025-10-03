import dotenv from "dotenv";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;
const groqApiKey = process.env.GROQ_API_KEY;
const aiModel = process.env.MODEL;

if (!jwtSecret) {
  throw new Error("JWT SECRET environment variable not set");
}
if (!bcryptSalt) {
  throw new Error("BCRYPT SALT environment variable not set");
}
if (!groqApiKey) {
  throw new Error("GROQ API KEY key enviroment variable not set");
}
if (!aiModel) {
  throw new Error("MODEL key enviroment variable not set");
}
export const BCRYPT_SALT = bcryptSalt;
export const JWT_SECRET = jwtSecret;
export const GROQ_API_KEY = groqApiKey;
export const MODEL = aiModel;

export const aTokenExpiry = "10m";

export const rTokenExpiry = "30m";
