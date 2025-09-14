const httpUrl = process.env.NEXT_PUBLIC_HTTP_BACKEND;
console.log("in config", httpUrl);
if (!httpUrl) {
  throw new Error("Backend url not specified");
}
export const HTTP_BE_URL = httpUrl;
const wsURL = process.env.NEXT_PUBLIC_WS_BACKEND;

if (!wsURL) {
  throw new Error("WebSocket url not specified");
}
export const WS_BE_URL = wsURL;

export const GITHUB_ID = process.env.GITHUB_ID || "";
export const GITHUB_SECRET = process.env.GITHUB_SECRET || "";

export const GOOGLE_ID = process.env.GOOGLE_ID || "";
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET || "";

export const FACEBOOK_ID = process.env.FACEBOOK_ID || "";
export const FACEBOOK_SECRET = process.env.FACEBOOK_SECRET || "";
