import axios from "axios";
import { ShapeSchema, ShapeType } from "../types";

const HF_TOKEN = ""; // should move to env var
const MODEL = "deepseek-ai/DeepSeek-V3.1-Terminus";

export default async function drawWithAi(
  userCommand: string,
  context: ShapeType[]
): Promise<any> {
  const typeDef =
    '{ id: string; type: "SELECT" | "CIRCLE" | "SQUARE" | "TRIANGLE" | "ARROW" | "COLOR" | "PENCIL" | "UNDO" | "REDO" lineWidth: number;lineColor: {l: number;c: number;h: number;};startX: number;startY: number;endX: number;endY: number;fillColor?: {l: number;c: number;h: number;} | undefined;points?: { x: number;y: number;}';

  const data = {
    messages: [
      {
        role: "user",
        content: `
You are a drawing assistant.rule 1 never ask for more info or clarify infer the comand given and givea valid response with your utmost understanding, Try to assist your master with its canvas diagramming/drawing. 
Obey with sincerity and utmost knowledge. Try to reason with the context of the board before addressing the command.
Respond with **only JSON array** of shapes. Do not include explanations or quotes outside the JSON.


Use this TypeScript type to structure the response: ${typeDef}.  
Now generate a valid object for this command: "${userCommand}".  
The context of the board right now is this: "${context}".  
Only output an array of objects. The objects must follow the definition provided.  
        `,
      },
    ],
    model: MODEL,
  };

  const res = await axios.post(
    "https://router.huggingface.co/v1/chat/completions",
    data,
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data; // axios auto parses JSON
}
