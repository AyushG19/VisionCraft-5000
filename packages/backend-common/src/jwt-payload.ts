import { type JwtPayload } from "jsonwebtoken";

interface CustomUserPayload {
  userId?: string;
  role?: string;
  roomId?: string;
}

export type UserPayload = CustomUserPayload & JwtPayload;
