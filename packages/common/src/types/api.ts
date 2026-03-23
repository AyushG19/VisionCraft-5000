import { z } from "zod";
import { DrawSchema } from "./canvas";
import { User } from "./user";

export const CreateUserSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormType = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  remember: z.boolean().optional(),
});

export type LoginFormType = z.infer<typeof LoginSchema>;

export const JoinRoomSchema = z.object({
  roomId: z.string(),
  users: z.array(User),
  token: z.string(),
});

export type JoinRoomResponseType = z.infer<typeof JoinRoomSchema>;

const checkCodeResponse = z.object({
  id: z.string(),
  canvasState: z.array(DrawSchema),
  slug: z.string(),
});

export type CheckCodeResponseType = z.infer<typeof checkCodeResponse>;

const CreateRoomObjectType = z.object({
  canvas: DrawSchema,
});

export type Room = z.infer<typeof CreateRoomObjectType>;

export const leaveRoomBodySchema = z.object({
  roomId: z.string(),
});

export type leaveRoomBodyType = z.infer<typeof leaveRoomBodySchema>;
