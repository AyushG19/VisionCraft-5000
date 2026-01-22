"use client";
import { AppErrorCodeType } from "@repo/common";

export class AppError extends Error {
  code: AppErrorCodeType;
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    code: AppErrorCodeType,
    status?: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
