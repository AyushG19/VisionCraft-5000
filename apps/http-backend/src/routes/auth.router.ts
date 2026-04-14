import express, { Router } from "express";
import { signup, login, refreshToken } from "../controllers";
import { validate } from "../middlewares";
import { CreateUserSchema, LoginSchema } from "@repo/common";
import passport from "passport";
import { handleProviderCallback } from "../controllers/provider.controller";
import env from "../env";

const authRouter: Router = express.Router();

authRouter.post("/signup", validate(CreateUserSchema), signup);
authRouter.post("/login", validate(LoginSchema), login);
authRouter.post("/refresh-token", refreshToken);
// ✅ Step 1: Initiate Google login — redirects user to Google
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// ✅ Step 2: Google redirects back here after user logs in
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: env.FRONTEND_URL, // or wherever you want on failure
  }),
  handleProviderCallback, // ← now req.user is populated, this runs correctly
);
authRouter.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user", "user:email"],
    session: false,
  }),
);

// ✅ Step 2: Google redirects back here after user logs in
authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: env.FRONTEND_URL, // or wherever you want on failure
  }),
  handleProviderCallback, // ← now req.user is populated, this runs correctly
);
export default authRouter;
