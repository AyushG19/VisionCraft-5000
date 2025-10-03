import { ShapeType } from "../types";
import axiosInstance from "./axiosInstance";

export default async function drawWithAi(
  userCommand: string,
  context: ShapeType[]
): Promise<any> {
  try {
    const res = await axiosInstance.post("/api/ai/draw", {
      userCommand,
      context,
    });

    // Extract and parse the schema-enforced array
    console.log(res.data["result"]);
    return res.data["result"]; // Now guaranteed as your array
  } catch (error: any) {
    console.error("Groq API Error:", error.response?.data || error.message);
    return error; // Re-throw for app handling
  }
}
