import { z } from "zod";

export const WebEnv = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  HTTP_BACKEND_URL: z.string(),
  WS_BACKEND_URL: z.string(),
  WORKER_BACKEND_URL: z.string(),
  CLOUD_NAME: z.string(),
});

export type WebEnvType = z.infer<typeof WebEnv>;

export const HttpEnv = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  PORT: z.number(),
  JWT_SECRET: z.string(),
  BCRYPT_SALT: z.string(),
  MODEL: z.string(),
  GROQ_API_KEY: z.string(),
  RF_TOKEN_EXPIRY: z.number(),
  AC_TOKEN_EXPIRY: z.number(),
  FRONTEND_URL: z.string(),
});

export type HttpEnvType = z.infer<typeof HttpEnv>;

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
  EMPTY_ROOM_TTL_MS: z.number(),
  ROOM_IDLE_TTL_MS: z.number(),
  SWEEP_INTERVAL_MS: z.number(),
});

export type wsEnvType = z.infer<typeof wsEnv>;

export const dbEnvSchema = z.object({
  RS_HOST: z.string(), //rs for redis
  RS_PORT: z.number(),
  RS_USERNAME: z.string(),
  RS_PASSWORD: z.string(),
  PG_URL: z.string(), // pg for postgres
});

export const WorkerEnvSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  FRONTEND_URL: z.string(),
  PORT: z.number(),
  REDIS_URL: z.string(),
});

export type WorkerEnvSchemaType = z.infer<typeof WorkerEnvSchema>;
