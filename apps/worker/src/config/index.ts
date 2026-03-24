import env from "../env";

const isDev = env.NODE_ENV === "development";

export const corsMap = new Map<string, string>([
  [
    "Access-Control-Allow-Origin",
    isDev ? "http://localhost:3000" : env.FRONTEND_URL,
  ],
  ["Access-Control-Allow-Methods", "GET, POST, OPTIONS"],
  ["Access-Control-Allow-Headers", "Content-Type, Authorization"],
]);
