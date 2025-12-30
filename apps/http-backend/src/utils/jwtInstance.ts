import { JwtService } from "@repo/backend-common/jwt.service";
import env from "../env.js";

export const accessJwtService = new JwtService(env.JWT_SECRET);
export const refreshJwtService = new JwtService(env.JWT_SECRET);
