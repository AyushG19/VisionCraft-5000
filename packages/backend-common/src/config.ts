import dotenv from "dotenv";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable not set");
}
if (!bcryptSalt) {
  throw new Error("JWT_SECRET environment variable not set");
}
export const BCRYPT_SALT = bcryptSalt;
export const JWT_SECRET = jwtSecret;

export const aTokenExpiry = "10m";

export const rTokenExpiry = "30m";
