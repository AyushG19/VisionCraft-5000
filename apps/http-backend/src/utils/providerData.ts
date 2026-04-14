import { Profile as GoogleProfile } from "passport-google-oauth20";
import { Profile as GithubProfile } from "passport-github2";
import { ProviderUser, ProviderUserSchema } from "@repo/common/index";

export const cleanGoogleData = (profile: GoogleProfile): ProviderUser => {
  if (!profile.emails || !profile.emails[0]?.verified)
    throw new Error("Email missing or not verified.");
  const providerData = {
    email: profile.emails[0]?.value,
    providerName: profile.provider.toUpperCase(),
    providerId: profile.id,
    name: profile.displayName,
  };
  const cleanedProviderData = ProviderUserSchema.safeParse(providerData);
  if (!cleanedProviderData.success)
    throw new Error("Error in Data parsing.", cleanedProviderData.error);
  return cleanedProviderData.data;
};

export const cleanGithubData = (profile: GithubProfile): ProviderUser => {
  if (!profile.emails) throw new Error("Email missing or not verified.");
  const providerData = {
    email: profile.emails[0]?.value,
    providerName: profile.provider.toUpperCase(),
    providerId: profile.id,
    name: profile.displayName || profile.username || "Unknown",
  };
  console.log(providerData);
  const cleanedProviderData = ProviderUserSchema.safeParse(providerData);
  if (!cleanedProviderData.success)
    throw new Error("Error in Data parsing.", cleanedProviderData.error);
  return cleanedProviderData.data;
};
