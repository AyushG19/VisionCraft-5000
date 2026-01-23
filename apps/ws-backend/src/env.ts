import { wsEnv } from "@repo/common";

function shutdown(code: number): never {
  console.log("error in env");
  process.exit(code);
}
const envSchema = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) ?? 3001,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: process.env.BCRYPT_SALT,
  HOST: process.env.HOST,
  REDIS_PASS: process.env.REDIS_PASS,
  MODEL: process.env.MODEL,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  RS_HOST: process.env.RS_HOST,
  RS_PORT: Number(process.env.PORT),
  RS_USERNAME: process.env.RS_USERNAME,
  RS_PASSWORD: process.env.RS_PASSWORD,
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
