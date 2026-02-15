import z from "zod";

export interface CustomJwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export const JwtPayloadSchema = z.object({
  userId: z.string(),
  role: z.string().optional(),
  roomId: z.string().optional(),
  iat: z.number(),
  exp: z.number(),
});

export type JwtPayloadType = z.infer<typeof JwtPayloadSchema>;

export const JwtExpiry = z.number({
  message: "Invalid format. Use number",
});

export const JwtVerifyResponseSchema = z.object({
  valid: z.boolean(),
  decoded: JwtPayloadSchema,
  error: z.any().optional(),
});
