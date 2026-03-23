import { useCallback, useState } from "react";
import { getExcalidrawElements } from "app/services/ai.service";
import {
  AIResultType,
  convertToShapeType,
} from "@workspace/ui/lib/convertToShapeType";
import { useError } from "@repo/hooks";
import { getScalingFactor } from "app/lib/scalingHelper";

const useAi = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIResultType[]>([]);
  const { setError } = useError();

  const handleDrawRequest = useCallback(async (userCommand: string) => {
    setLoading(true);
    try {
      const elements = await getExcalidrawElements(userCommand);
      console.log("elements:", elements);
      const sf = getScalingFactor(elements);
      console.log(sf);
      // conversion to my local types
      setResult(() =>
        elements.map((element) => convertToShapeType(element, sf)),
      );
    } catch (error) {
      setError({ code: "SERVER_ERROR", message: "Errorn with AI" });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChatRequest = async (userCommand: string) => {
    // setLoading(true);
    // try {
    //   const elements = await getExcalidrawElements(userCommand);
    //   // conversion to my local types
    //   setResult(() => elements.map((element) => convertToShapeType(element)));
    // } catch (error) {
    //   setError({ code: "SERVER_ERROR", message: "Errorn with AI" });
    //   setLoading(false);
    // } finally {
    //   setLoading(false);
    // }
  };
  return { loading, result, handleDrawRequest, handleChatRequest };
};

export default useAi;
