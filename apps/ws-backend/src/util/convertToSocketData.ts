import { WebSocketDataType } from "@repo/common";
import { RedisData } from "../types";

export function convertToSocketData(
  data: RedisData,
): WebSocketDataType | undefined {
  if (data.type === "ADD") {
    return {
      type: "ADD_SHAPE",
      payload: { shape: data.shape },
    };
  } else if (data.type === "DEL") {
    return {
      type: "DEL_SHAPE",
      payload: { shape: data.shape },
    };
  } else if (data.type === "UPD") {
    return {
      type: "UPD_SHAPE",
      payload: { shape: data.shape },
    };
  } else if (data.type === "CHAT") {
    return {
      type: "CHAT",
      payload: { message: data.message },
    };
  }
}
