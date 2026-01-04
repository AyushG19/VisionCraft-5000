import {
  JwtPayloadSchema,
  JwtVerifyResponseType,
  WebSocketData,
  WebSocketDataPayloadType,
  WebSocketDataType,
} from "@repo/common/types";
import { jwtInstance } from "./jwtInstance";

const parseData = (data: any) => {
  if (typeof data === "string") {
    return JSON.parse(data);
  } else {
    return JSON.parse(data.toString());
  }
};
export const validateConnection = (
  url: URL
): { token: string; roomId: string } => {
  const { token, roomId } = Object.fromEntries(url.searchParams.entries());
  if (!token || !roomId) {
    throw new Error("INVALID_REQUEST");
  }
  return { token, roomId };
};

export const validateToken = (token: string) => {
  const res = jwtInstance.verify<JwtVerifyResponseType>(token);
  if (!res.valid || !res.decoded) {
    throw new Error("INVALID_REQIEST");
  }
  const parsedDecoded = JwtPayloadSchema.safeParse(res.decoded);
  if (!parsedDecoded.success) {
    throw new Error("INVALID_REQUEST");
  }
  return parsedDecoded.data;
};

export const validateSocketData = (data: any): WebSocketDataType => {
  const validatedData = WebSocketData.safeParse(parseData(data));
  if (!validatedData.success || !validatedData.data.type) {
    console.log(validatedData.data, validatedData.success);
    throw new Error("MALFORMED_PAYLOAD");
  }
  console.log(validatedData);
  return validatedData.data;
};
