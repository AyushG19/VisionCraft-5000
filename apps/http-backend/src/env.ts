import { HttpEnv } from "@repo/common";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function shutdown(code: number): never {
  process.exit(code);
}

const isDev = process.env.NODE_ENV === "development";

const envSchema = {
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: isDev ? "development" : process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: process.env.BCRYPT_SALT,
  MODEL: process.env.MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  RF_TOKEN_EXPIRY: Number(process.env.RF_TOKEN_EXPIRY),
  AC_TOKEN_EXPIRY: Number(process.env.AC_TOKEN_EXPIRY),
  FRONTEND_URL: isDev ? "http://localhost:3000" : process.env.FRONTEND_URL,
};

const parsedEnv = HttpEnv.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("!ENVIRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.error(`-> ${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
