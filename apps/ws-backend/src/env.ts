import { wsEnv, WsEnvType } from "@repo/common/types";

function shutdown(code: number): never {
  process.exit(code);
}
const envSchema = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: process.env.BCRYPT_SALT,
  RF_TOKEN_EXPIRY: process.env.RF_TPKEN_EXPIRY,
  AC_TOKEN_EXPIRY: process.env.AC_TOKEN_EXPIRY,
};
const parsedEnv = wsEnv.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("ENViRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.log(`->${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
