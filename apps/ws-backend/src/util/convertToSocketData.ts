import { RedisData, SendPropsType } from "../types";

export function convertToSocketData(data: RedisData): SendPropsType {
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
  }
}
