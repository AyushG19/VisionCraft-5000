import { JwtService } from "@repo/backend-common/jwt.service";
import { refreshSecret } from "../config";
export const jwtInstance = new JwtService(refreshSecret);
