export interface CustomJwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}
