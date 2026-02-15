import z from "zod";

export const User = z.object({
  userId: z.string(),
  name: z.string(),
});

export type UserType = z.infer<typeof User>;
