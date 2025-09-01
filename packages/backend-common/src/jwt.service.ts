import jwt from "jsonwebtoken";
import { aTokenExpiry, rTokenExpiry, JWT_SECRET } from "./config";
import { UserPayload } from "./jwt-payload";

export const createAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry });
};

export const createRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry });
};

export const verifyToken = (
  token: string
): {
  valid: boolean;
  decoded?: UserPayload;
  error?: unknown;
} => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null) {
      return { valid: true, decoded: decoded as UserPayload };
    } else {
      return { valid: true, decoded: undefined };
    }
  } catch (err) {
    return { valid: false, error: err };
  }
};
export const createTokens = (payload: UserPayload): object => {
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry }),
    refreshToken: jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry }),
  };
};
