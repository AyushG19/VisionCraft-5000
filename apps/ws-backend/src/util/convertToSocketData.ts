import { ServerSocketDataType } from "@repo/common";
import { RedisData } from "../types";

export function convertToSocketData(data: RedisData): ServerSocketDataType {
  switch (data.type) {
    case "ADD":
      return {
        type: "ADD_SHAPE",
        payload: data.element,
      };
    case "DEL":
      return {
        type: "DEL_SHAPE",
        payload: data.element,
      };
    case "UPD":
      return {
        type: "UPD_SHAPE",
        payload: data.element,
      };
    case "CHAT":
      return {
        type: "CHAT",
        payload: data.message,
      };
    case "CURSOR": {
      return {
        type: "CURSOR",
        payload: { userId: data.userId, coordinates: data.coordinates },
      };
    }
  }
}
