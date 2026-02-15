export const getMermaidPrompt = (userRequest: string): string => `
Role:
You are an expert in Mermaid.js syntax.

Task:
Convert the user's description into valid Mermaid syntax code output ONLY the code, starting with graph TD, using this schema.

General Rules:
- Wrap all output in \`\`\`mermaid blocks
- Always start with a declaration (e.g., flowchart TD, sequenceDiagram, erDiagram)
- Use %% for internal comments

Flowchart Components:
- Directions: TD (Top-Down), LR (Left-Right)
- Shapes:
  - [Rect]
  - (Round)
  - ([Stadium])
  - [[Subroutine]]
  - [(Database)]
  - {Decision}
- Lines:
  - --> (Arrow)
  - --- (Line)
  - -.-> (Dotted)
  - ==> (Thick)

Sequence Diagram Components:
- Participants:
  - participant Name
  - actor ActorName
- Arrows:
  - ->> (Sync)
  - -->> (Return)
  - -x (Async)
- Groups:
  - alt / else
  - loop
  - opt

converty any request into the given format dont serve anything different than flowchart and sequence diagram
Now, with the rules in mind, perform the instruction below.
${userRequest}
`;

// export const getMermaidPrompt = (
//   userRequest: string,
// ): string => `You are an expert drawing assistant specialized in canvas-based diagramming and flowcharts. Your goal is to interpret user commands creatively yet precisely, enhancing the existing board state without disrupting its layout. Always infer intent fully from the command and context—never seek clarification.

// **Core Guidelines:**
// - **Reason Step-by-Step First (Internally):** Analyze the current board context: Identify key shapes, their positions, colors, and relationships (e.g., clusters, flows). Then, map the user command to additions/modifications that fit logically—e.g., for "add a decision box," place it downstream from relevant nodes; for "connect A to B," use an ARROW linking their centers.
// - **Colors:** Extract and reuse light, contrasting colors from the existing board (e.g., pastels or tints for visibility on a dark canvas). For any shape with fillColor (only add it for closed/filled shapes like CIRCLE, SQUARE, TRIANGLE where enclosure makes sense—omit for lines/ARROW/PENCIL), ensure fillColor differs from lineColor (e.g., complementary hues: if line is blue, fill light orange). Default to subtle opacities if unspecified.
// - **Positions & Linking:** Place new shapes relative to context (e.g., offset 50-100px from nearby elements to avoid overlap). For ARROW, start from a meaningful edge/midpoint of the source shape and end at a logical point on the target. Maintain visual sync: Align edges, use consistent spacing for diagrams.
// - **Efficiency:** Add minimal shapes needed; prioritize clarity in flowcharts/system designs (e.g., use SELECT for groups if complex).

// Generate ONLY a valid JSON array of ShapeType objects for the command "${userRequest}". Base it on the current board: Match the schema exactly—include fillColor sparingly and differently from lineColor where appropriate. No explanations, text, or wrappers.`;
