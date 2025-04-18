import jwt from "jsonwebtoken";
import { aTokenExpiry, JWT_SECRET } from "./config";

export const generateAToken = (userId: string) => {
  const aToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: aTokenExpiry,
  });
  return aToken;
};
