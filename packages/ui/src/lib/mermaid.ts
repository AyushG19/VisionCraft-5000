import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToShapeType } from "./convertToShapeType";
import { DrawElement } from "@repo/common";

export const mermaidToExcalidraw = async (
  diagramDefinition: string,
): Promise<DrawElement[]> => {
  // const diagramDefinition =
  //   "graph LR\n%% 10 Process Flowchart\nP1((Start)) --> P2[Process 1: System Initialization]\nP2 --> P3[Process 2: Data Ingestion]\nP3 --> P4{Process 3: Validation Check}\nP4 -- Valid --> P5[Process 4: Logic Transformation]\nP4 -- Invalid --> P6[Process 5: Error Correction]\nP5 --> P7{Process 6: Compliance Check}\nP6 --> P7\nP7 -- Success --> P8[Process 7: Database Commit]\nP7 -- Failure --> P9[Process 8: Rollback Protocol]\nP8 --> P10((Process 10: Completion))\nP9 --> P10";

  try {
    let shapes: DrawElement[] = [];
    const { elements, files } = await parseMermaidToExcalidraw(
      diagramDefinition,
      {
        themeVariables: {
          fontSize: "1px",
        },
      },
    );
    console.log(elements, files);
    // Render elements and files on Excalidraw
    elements.forEach((element) => {
      shapes.push(convertToShapeType(element));
    });
    return shapes;
  } catch (e) {
    // Parse error, displaying error message to users
    console.log(e);
    return [];
  }
};
