import z from "zod";
import {
  ActionToolSchema,
  ColorSchema,
  EraserToolSchema,
  LineToolSchema,
  ModeSchema,
  PencilToolSchema,
  ShapeToolSchema,
} from "./canvas";

type ToolState = {
  currentTool:
    | "SELECT"
    | "CIRCLE"
    | "SQUARE"
    | "DIAMOND"
    | "TEXT"
    | "ARROW"
    | "COLOR"
    | "PENCIL"
    | "UNDO"
    | "REDO";
  currentColor: { l: number; c: number; h: number };
  brushSize: number;
};

export const AllToolSchema = z.union([
  ModeSchema,
  LineToolSchema,
  ShapeToolSchema,
  ActionToolSchema,
  PencilToolSchema,
  EraserToolSchema,
]);

export type AllToolTypes = z.infer<typeof AllToolSchema>;

export const ToolKitSchema = z.object({
  currentTool: AllToolSchema,
  currentColor: ColorSchema,
  strokeSize: z.number(),
});

export const TextStateSchema = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.number().min(6).max(200),
  alignment: z.enum(["left", "center", "right"]),
});

export type TextStateType = z.infer<typeof TextStateSchema>;
export type ToolKitType = z.infer<typeof ToolKitSchema>;
