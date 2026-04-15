import z from "zod";

export const User = z.object({
  userId: z.string(),
  name: z.string(),
});

export type UserType = z.infer<typeof User>;

export const ProviderUserSchema = z.object({
  providerName: z.enum(["GOOGLE", "GITHUB"]),
  providerId: z.string(),
  email: z.string(),
  name: z.string(),
});
export type ProviderUser = z.infer<typeof ProviderUserSchema>;
