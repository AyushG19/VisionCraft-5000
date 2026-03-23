import { DrawElement, PointType } from "@repo/common";

export type AIResultType = Extract<
  DrawElement,
  { type: "arrow" | "rectangle" | "ellipse" | "triangle" | "text" }
>;

export type UserInfo = {
  userId: string;
  name: string;
  color:
    | "#FFFF00"
    | "#FFD700"
    | "#FF8C00"
    | "#FF4500"
    | "#00FF00"
    | "#8B0000"
    | "#B22222"
    | "#DC143C"
    | "#FF00FF"
    | "#8B4513";
};
export type RoomInfo = { roomId: string; slug: string; users: UserInfo[] };
export type MemberCursor = Map<string, PointType>;
