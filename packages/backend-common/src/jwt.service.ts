import jwt, { JwtHeader } from "jsonwebtoken";
import { aTokenExpiry, rTokenExpiry, JWT_SECRET } from "./config";
import CustomUserPayload from "./jwt-payload";
export class JwtService {
  constructor(private secret: string) {}
  sign(payload: CustomUserPayload, expiresIn: number) {
    return jwt.sign(payload, this.secret, { expiresIn });
  }
  verify<T>(token: string) {
    return jwt.verify(token, this.secret) as T;
  }
}
// export const createAccessToken = (
//   payload: CustomUserPayload,
//   secret: string
//   options
// ): string => {
//   return jwt.sign(payload, secret, { expiresIn: aTokenExpiry });
// };

// export const createRefreshToken = (
//   payload: CustomUserPayload,
//   secret: string
// ): string => {
//   return jwt.sign(payload, secret, { expiresIn: rTokenExpiry });
// };

// export const verifyToken = (
//   token: string,
//   secret: string
// ): JwtVerifyResponseType => {
//   try {
//     const decoded = jwt.verify(token, secret);
//     if (typeof decoded === "object" && decoded !== null) {
//       return { valid: true, decoded: decoded as JwtPayloadType };
//     } else {
//       return { valid: true, decoded: null };
//     }
//   } catch (err) {
//     return { valid: false, decoded: null, error: err };
//   }
// };
export const createTokens = (payload: CustomUserPayload): object => {
  return {
    accessToken: jwt.sign(payload, JWT_SECRET, { expiresIn: aTokenExpiry }),
    refreshToken: jwt.sign(payload, JWT_SECRET, { expiresIn: rTokenExpiry }),
  };
};
