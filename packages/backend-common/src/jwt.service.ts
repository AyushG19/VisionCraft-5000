import jwt from "jsonwebtoken";
import { aTokenExpiry, rTokenExpiry, JWT_SECRET } from "./config";

export const createAccessToken = (payload: jwt.JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry });
};

export const createRefreshToken = (payload: jwt.JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry });
};

export const verifyToken = (
  token: string
): {
  valid: boolean;
  decoded?: string | jwt.JwtPayload;
  error?: unknown;
} => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded: decoded };
  } catch (err) {
    return { valid: false, error: err };
  }
};
export const createTokens = (payload: jwt.JwtPayload): object => {
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry }),
    refreshToken: jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry }),
  };
};
