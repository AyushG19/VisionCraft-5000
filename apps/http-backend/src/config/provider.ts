import { PassportStatic } from "passport";
import env from "../env";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy, Profile } from "passport-github2";
import { syncUserAndCreate } from "src/services/provider";
import { cleanGithubData, cleanGoogleData } from "src/utils/providerData";

export const configureGoogle = (passport: PassportStatic) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_ID,
        clientSecret: env.GOOGLE_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const cleanData = cleanGoogleData(profile);
          const userData = await syncUserAndCreate(cleanData);
          if (!userData) throw new Error("Error in backend.");
          console.log("right here ");
          return done(null, userData);
        } catch (err) {
          console.log("error in auth:", err);
          return done(err);
        }
      },
    ),
  );
};

export const configureGithub = (passport: PassportStatic) => {
  passport.use(
    new GithubStrategy(
      {
        clientID: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET,
        callbackURL: env.GITHUB_CALLBACK_URL,
        scope: ["read:user", "user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user?: any, info?: any) => void,
      ) => {
        try {
          console.log(profile);
          const cleanData = cleanGithubData(profile);
          const userData = await syncUserAndCreate(cleanData);
          if (!userData) throw new Error("Error in backend.");
          return done(null, userData);
        } catch (err) {
          console.log("error in auth:", err);
          return done(err);
        }
      },
    ),
  );
};
