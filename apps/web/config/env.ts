import { WebEnv } from "@repo/common";

function shutdown(message: string, error?: unknown): never {
  console.error(message);
  if (error) console.error(error);
  process.exit(1);
}

const isDev = process.env.NODE_ENV === "development";

const envInput = {
  NODE_ENV: process.env.NODE_ENV,

  HTTP_BACKEND_URL: isDev
    ? "http://localhost:4000"
    : process.env.NEXT_PUBLIC_HTTP_BACKEND_URL,

  WS_BACKEND_URL: isDev
    ? "ws://localhost:3001"
    : process.env.NEXT_PUBLIC_WS_BACKEND_URL,
};

const parsed = WebEnv.safeParse(envInput);

if (!parsed.success) {
  console.error("WEB ENVIRONMENT VALIDATION FAILED");
  for (const issue of parsed.error.issues) {
    console.error(`• ${issue.path.join(".")} → ${issue.message}`);
  }
  shutdown("Invalid environment variables");
}

export default parsed.data;
