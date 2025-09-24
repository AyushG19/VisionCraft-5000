import jwt from "jsonwebtoken";
import { aTokenExpiry, rTokenExpiry, JWT_SECRET } from "./config";
import CustomUserPayload from "./jwt-payload";

export const createAccessToken = (payload: CustomUserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry });
};

export const createRefreshToken = (payload: CustomUserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry });
};

export const verifyToken = (
  token: string
): {
  valid: boolean;
  decoded: CustomUserPayload | null;
  error?: unknown;
} => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null) {
      return { valid: true, decoded: decoded as CustomUserPayload };
    } else {
      return { valid: true, decoded: null };
    }
  } catch (err) {
    return { valid: false, decoded: null, error: err };
  }
};
export const createTokens = (payload: CustomUserPayload): object => {
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry }),
    refreshToken: jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry }),
  };
};
