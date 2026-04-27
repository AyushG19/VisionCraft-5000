import jwt from "jsonwebtoken";
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
