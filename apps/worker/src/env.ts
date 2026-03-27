import { WorkerEnvSchema } from "@repo/common";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const envSchema = {
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PORT: Number(process.env.PORT) || 3002,
  REDIS_URL: process.env.REDIS_URL,
};

function shutdown(code: number): never {
  process.exit(code);
}
const parsedEnv = WorkerEnvSchema.safeParse(envSchema);
if (!parsedEnv.success) {
  console.error("!ENVIRONMENT VALIDATION FAILED!");
  for (const issue of parsedEnv.error.issues) {
    console.error(`-> ${issue.path.join(".")} : ${issue.message}`);
  }
  shutdown(1);
}

export default parsedEnv.data;
