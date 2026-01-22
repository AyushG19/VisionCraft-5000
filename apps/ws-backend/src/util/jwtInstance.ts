import { JwtService  } from "@repo/backend-common";
import { refreshSecret } from "../config";
export const jwtInstance = new JwtService(refreshSecret);
