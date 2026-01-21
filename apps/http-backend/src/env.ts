import { HttpEnv } from "@repo/common/types.js";
import dotenv from "dotenv";

dotenv.config();

function shutdown(code: number): never {
  process.exit(code);
}

const envSchema = {
  PORT: Number(process.env.PORT) ?? 4000,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: process.env.BCRYPT_SALT,
  MODEL: process.env.MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  RF_TOKEN_EXPIRY: Number(process.env.RF_TOKEN_EXPIRY),
  AC_TOKEN_EXPIRY: Number(process.env.AC_TOKEN_EXPIRY),
  FRONTEND_URL: process.env.FRONTEND_URL,
};
console.log(process.env.PORT);
const parsedEnv = HttpEnv.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("!ENVIRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.error(`-> ${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
