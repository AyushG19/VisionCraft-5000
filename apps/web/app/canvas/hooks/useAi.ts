"use client";
import { useCallback, useEffect, useState } from "react";
import { getExcalidrawElements } from "app/services/ai.service";
import {
  AIResultType,
  convertToShapeType,
} from "@workspace/ui/lib/convertToShapeType";
import { useError } from "@repo/hooks";
import { getScalingFactor } from "app/canvas/helper/scaling.helper";
import { DrawElement } from "@repo/common";
import { Action } from "../types";

const useAi = (
  canvas: React.RefObject<HTMLCanvasElement | null>,
  canvasDispatch: React.Dispatch<Action>,
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIResultType[]>([]);
  const { setError } = useError();

  useEffect(() => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    if (!ctx) {
      console.error("canvas element not available");
      return;
    }
    console.log(typeof result);
    result.forEach((shape: DrawElement) => {
      // drawShape(ctx, shape);
      canvasDispatch({ type: "ADD_SHAPE", payload: shape });
    });
  }, [result]);
  const handleDrawRequest = useCallback(
    async (
      ctx: CanvasRenderingContext2D,
      fontFamily: string,
      userCommand: string,
    ) => {
      setLoading(true);
      try {
        const elements = await getExcalidrawElements(userCommand);
        console.log("elements:", elements);
        const sf = getScalingFactor(elements);
        console.log(sf);

        setResult(() =>
          elements.map((element) =>
            convertToShapeType(ctx, fontFamily, element, sf),
          ),
        );
      } catch (error) {
        setError({ code: "SERVER_ERROR", message: "Errorn with AI" });
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

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

  // const handleDiagramAccept = (ctx: CanvasRenderingContext2D) => {
  //   dispatchwithsocket({});
  // };
  return { loading, result, handleDrawRequest, handleChatRequest };
};

export default useAi;
