import {
  JwtPayloadSchema,
  WebSocketData,
  WebSocketDataType,
} from "@repo/common";
import { jwtInstance } from "./jwtInstance";

const parseData = (data: any) => {
  if (typeof data === "string") {
    return JSON.parse(data);
  } else {
    return JSON.parse(data.toString());
  }
};
export const validateConnection = (
  url: URL,
): { token: string; roomId: string } => {
  const { token, roomId } = Object.fromEntries(url.searchParams.entries());
  if (!token || !roomId) {
    throw new Error("INVALID_REQUEST");
  }
  return { token, roomId };
};

export const validateToken = (token: string) => {
  const res = jwtInstance.verify(token);
  if (!res) {
    console.log("yaya", res);
    throw new Error("INVALID_REQIEST");
  }
  const parsedDecoded = JwtPayloadSchema.safeParse(res);
  if (!parsedDecoded.success) {
    console.log("wawa", parsedDecoded.data);
    throw new Error("INVALID_REQUEST");
  }
  return parsedDecoded.data;
};

export const validateSocketData = (data: any): WebSocketDataType => {
  console.log(parseData(data));
  const validatedData = WebSocketData.safeParse(parseData(data));
  if (!validatedData.success || !validatedData.data.type) {
    console.error("!ENVIRONMENT VALIDATION FAILED!");
    if (!validatedData.error) throw new Error("MALFORMED_PAYLOAD");
    for (const issue of validatedData.error.issues) {
      console.error(`-> ${issue.path.join(".")} : ${issue.message}`);
    }
    throw new Error("MALFORMED_PAYLOAD");
  }
  console.log(validatedData);
  return validatedData.data;
};
