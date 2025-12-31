// app/errors/AppError.ts
export type AppErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  code: AppErrorCode;
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    code: AppErrorCode,
    status?: number,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
