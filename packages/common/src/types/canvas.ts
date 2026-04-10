import { number, z } from "zod";

export const ModeSchema = z.enum(["select", "hand"]);
export type Mode = z.infer<typeof ModeSchema>;

export const ShapeToolSchema = z.enum(["rectangle", "ellipse", "diamond"]);
export type ShapeTool = z.infer<typeof ShapeToolSchema>;

export const LineToolSchema = z.enum(["arrow", "line"]);
export type LineTool = z.infer<typeof LineToolSchema>;

export const PencilToolSchema = z.enum(["pencil"]);
export type PencilToolType = z.infer<typeof PencilToolSchema>;

export const ActionToolSchema = z.enum(["text", "image", "color"]);
export type ActionTool = z.infer<typeof ActionToolSchema>;

export const ModifierToolSchema = z.enum(["undo", "redo"]);
export type ModifierTool = z.infer<typeof ModifierToolSchema>;

export const LabelSchema = z.object({
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
});

export type Labeltype = z.infer<typeof LabelSchema>;

export const ColorSchema = z.object({
  l: z.number(),
  c: z.number(),
  h: z.number(),
  a: z.number().optional(),
});

export type ColorType = z.infer<typeof ColorSchema>;

export const BaseElementSchema = z.object({
  id: z.string(),
  startX: z.number(),
  startY: z.number(),
  strokeWidth: z.number(),
  strokeColor: ColorSchema,
  backgroundColor: ColorSchema.nullable(),
  isDeleted: z.boolean(),
});

export type BaseElement = z.infer<typeof BaseElementSchema>;

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal("text"),
  fontSize: z.number(),
  fontFamily: z.string(),
  textAlign: z.enum(["left", "center", "right"]),
  text: z.string(),
  width: z.number(),
  height: z.number(),
});

export type TextType = z.infer<typeof TextElementSchema>;

export const ShapeElementSchema = BaseElementSchema.extend({
  type: ShapeToolSchema,
  label: LabelSchema.optional(),
  fillColor: ColorSchema.optional(),
  endX: z.number(),
  endY: z.number(),
});

export type ShapeType = z.infer<typeof ShapeElementSchema>;

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal("image"),
  state: z.enum(["loading", "finished"]).optional(),
  link: z.string().nullable(),
  width: z.number(),
  height: z.number(),
});

export type ImageType = z.infer<typeof ImageElementSchema>;

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type PointType = z.infer<typeof PointSchema>;

export const LinearElementSchema = BaseElementSchema.extend({
  type: LineToolSchema,
  points: z.array(PointSchema).readonly(),
  startBinding: z.any().optional(),
  endBinding: z.any().optional(),
});

export type LinearType = z.infer<typeof LinearElementSchema>;

export const PencilElementSchema = BaseElementSchema.extend({
  type: PencilToolSchema,
  points: z.array(PointSchema),
  endX: z.number(),
  endY: z.number(),
  isNormalized: z.boolean(),
});

export type PencilType = z.infer<typeof PencilElementSchema>;

export const DrawSchema = z.discriminatedUnion("type", [
  TextElementSchema,
  ShapeElementSchema,
  ImageElementSchema,
  LinearElementSchema,
  PencilElementSchema,
]);

export type DrawElement = z.infer<typeof DrawSchema>;
