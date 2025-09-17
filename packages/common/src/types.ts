import { z } from "zod";

export const CreateUserSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
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
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  remember: z.boolean().optional(),
});

const ColorSchema = z.object({
  l: z.number(),
  c: z.number(),
  h: z.number(),
});

const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const ShapeSchema = z.object({
  type: z.enum(["pencil", "line", "rectangle", "circle"]),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  color: ColorSchema,
  size: z.number(),
  points: z.array(PointSchema).optional(),
});

export const CreateRoomSchema = z.object({
  canvas: ShapeSchema,
});

export const JoinRoomSchema = z.object({
  slug: z.string(),
  roomId: z.any(),
});

export const UuidSchema = z.string().uuid({ message: "Invalid RoomID" });
export const WebSocketDataType = z.object({
  type: z.enum(["JOIN_ROOM", "LEAVE_ROOM", "SUBSCRIBE", "CHAT"]),
  payload: z.object({
    message: z.string().optional(),
    shape: ShapeSchema.optional(),
  }),
});
export type LoginFormValues = z.infer<typeof LoginSchema>;
export type SignupFormValues = z.infer<typeof CreateUserSchema>;
export type JoinRoomValues = z.infer<typeof JoinRoomSchema>;
export type CreateRoomValues = z.infer<typeof CreateRoomSchema>;
export type UuidType = z.infer<typeof UuidSchema>;
