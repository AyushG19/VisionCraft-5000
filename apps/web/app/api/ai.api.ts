import { axiosInstance } from "./axios";

export async function fetchMermaidPrompt(userPrompt: string): Promise<string> {
  const res = await axiosInstance.post(
    "/api/ai/draw",
    {
      userCommand: userPrompt,
    },
    { timeout: 120_000 },
  );
  return res.data.res;
}
