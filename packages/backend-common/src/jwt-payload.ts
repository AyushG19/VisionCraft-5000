interface CustomUserPayload {
  userId?: string;
  role?: string;
  roomId?: string;
  canvas?: JSON;
  iat?: number;
  exp?: number;
}

export type UserPayload = CustomUserPayload;
