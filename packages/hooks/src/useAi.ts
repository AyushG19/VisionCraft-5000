import { useState } from "react";
import { drawWithAi } from "@repo/common/api";
import { ShapeType } from "@repo/common/types";
export default function useAi() {
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  async function runDraw(userCommand: string, boardContext: ShapeType[]) {
    try {
      console.log("trying send ai");
      const data = await drawWithAi(userCommand, boardContext);
      console.log(data);
      setResult(data);
    } catch {
      console.log("error in runDraw");
    }
  }
  return { result, loading, error, runDraw };
}
