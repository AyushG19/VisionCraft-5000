import z from "zod";

// app/errors/AppError.ts
const AppErrorCode = z.enum([
  "UNAUTHORIZED",
  "INVALID_CREDENTIALS",
  "VALIDATION_ERROR",
  "NETWORK_ERROR",
  "SERVER_ERROR",
  "UNKNOWN_ERROR",
]);

export type AppErrorCodeType = z.infer<typeof AppErrorCode>;
