import { timeStamp } from "console";
import { number, string, z } from "zod";

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

export const ShapeSchema = z.object({
  id: z.string(),
  type: z.enum([
    "SELECT",
    "CIRCLE",
    "SQUARE",
    "TRIANGLE",
    "ARROW",
    "TEXT",
    "COLOR",
    "PENCIL",
    "UNDO",
    "REDO",
  ]),
  content: z.string().optional(),
  lineWidth: z.number(),
  lineColor: ColorSchema,
  isNormalized: z.boolean().default(false),
  fillColor: z
    .object({ l: z.number(), c: z.number(), h: z.number() })
    .optional(),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  selected: z.boolean(),
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

const IncomingMessage = z.object({
  status: z.literal("TO_BACKEND"),
  name: z.string(),
  content: z.string(),
});
const OutgoinMessage = z.object({
  status: z.literal("TO_FRONTEND"),
  name: z.string(),
  content: z.string(),
  sender_id: z.string(),
  timeStamp_ms: z.number(),
});
const Message = z.discriminatedUnion("status", [
  IncomingMessage,
  OutgoinMessage,
]);
export const WebSocketDataPayload = z.object({
  message: Message.optional(),
  shape: ShapeSchema.optional(),
});
export const WebSocketData = z.object({
  type: z.enum([
    "JOIN_ROOM",
    "LEAVE_ROOM",
    "CHAT",
    "ADD_SHAPE",
    "DEL_SHAPE",
    "UPD_SHAPE",
  ]),
  payload: WebSocketDataPayload,
});
const ParticipantsSchema = z.object({
  id: z.string(),
  name: z.string(),
});
const MessageSchema = z.object({
  sender_id: z.string(),
  timestamp_ms: z.number(),
  content: z.string(),
});
export const MessageSocketSchema = z.object({
  participants: z.array(ParticipantsSchema),
  messages: z.array(MessageSchema),
});
export const User = z.object({
  userId: z.string(),
  name: z.string(),
});

const RoomSchema = z.object({
  id: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  adminId: z.string(),
  canvas: z.any(),
});
const checkCodeResponse = z.object({
  id: z.string(),
  canvasState: ShapeSchema,
  slug: z.string(),
});
export const HttpEnv = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  PORT: z.number(),
  JWT_SECRET: z.string(),
  BCRYPT_SALT: z.string(),
  MODEL: z.string(),
  GROQ_API_KEY: z.string(),
  RF_TOKEN_EXPIRY: z.number(),
  AC_TOKEN_EXPIRY: z.number(),
});
export const wsEnv = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  PORT: z.number(),
  JWT_SECRET: z.string(),
  BCRYPT_SALT: z.string(),
  MODEL: z.string(),
  GROQ_API_KEY: z.string(),
  RS_HOST: z.string(), //rs for redis
  RS_PORT: z.number(),
  RS_USERNAME: z.string(),
  RS_PASSWORD: z.string(),
});
export const dbEnvSchema = z.object({
  RS_HOST: z.string(), //rs for redis
  RS_PORT: z.number(),
  RS_USERNAME: z.string(),
  RS_PASSWORD: z.string(),
  PG_URL: z.string(), // pg for postgres
});
export const JwtPayloadSchema = z.object({
  userId: z.string(),
  role: z.string().optional(),
  roomId: z.string().optional(),
  iat: z.number(),
  exp: z.number(),
});
export const JwtExpiry = z.number({
  message: "Invalid format. Use number",
});
export const JwtVerifyResponseSchema = z.object({
  valid: z.boolean(),
  decoded: JwtPayloadSchema,
  error: z.any().optional(),
});
// app/errors/AppError.ts
export const AppErrorCode = z.enum([
  "UNAUTHORIZED",
  "INVALID_CREDENTIALS",
  "VALIDATION_ERROR",
  "NETWORK_ERROR",
  "SERVER_ERROR",
  "UNKNOWN_ERROR",
]);
export type UserType = z.infer<typeof User>;
export type LoginFormValues = z.infer<typeof LoginSchema>;
export type SignupFormValues = z.infer<typeof CreateUserSchema>;
export type JoinRoomValues = z.infer<typeof JoinRoomSchema>;
export type CreateRoomValues = z.infer<typeof CreateRoomSchema>;
export type UuidType = z.infer<typeof UuidSchema>;
export type WebSocketDataType = z.infer<typeof WebSocketData>;
export type ShapeType = z.infer<typeof ShapeSchema>;
export type MessageSocketType = z.infer<typeof MessageSocketSchema>;
export type RoomSchema = z.infer<typeof RoomSchema>;
export type checkCodeResponse = z.infer<typeof checkCodeResponse>;
export type JwtPayloadType = z.infer<typeof JwtPayloadSchema>;
export type { ZodTypeAny } from "zod";
export type JwtExpiryType = z.infer<typeof JwtExpiry>;
export type AppErrorCodeType = z.infer<typeof AppErrorCode>;
export type WsEnvType = z.infer<typeof wsEnv>;
export type DbEnvType = z.infer<typeof dbEnvSchema>;
export type JwtVerifyResponseType = z.infer<typeof JwtVerifyResponseSchema>;
export type WebSocketDataPayloadType = z.infer<typeof WebSocketDataPayload>;
export type MessageType = z.infer<typeof Message>;
