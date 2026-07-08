import type { MLCEngine } from "@mlc-ai/web-llm";

export const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

export const isWebGPUSupported = (): boolean =>
  typeof navigator !== "undefined" && "gpu" in navigator;

let enginePromise: Promise<MLCEngine> | null = null;

const getEngine = (onProgress?: (text: string) => void): Promise<MLCEngine> => {
  if (!enginePromise) {
    enginePromise = import("@mlc-ai/web-llm").then(({ CreateMLCEngine }) =>
      CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => onProgress?.(report.text),
      })
    );
  }
  return enginePromise;
};

const buildPrompt = (storyText: string): string =>
  `You are helping someone turn journal-style reflections into a short list concrete action items. Limit how much you infer from the journal like entries, and only extract action items from what is mentioned. 
Read the notes below, where each area is followed by how the person rated it and why.

${storyText}

Reply with ONLY a JSON array of short, concrete action item strings (max 8 items). No other text.`;

const parseActionItems = (raw: string): string[] => {
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
    } catch {
      // fall through to line-based parsing
    }
  }
  return raw
    .split("\n")
    .map((line) => line.replace(/^[\s*\-\d.)]+/, "").trim())
    .filter((line) => line.length > 0);
};

export const generateActionItems = async (
  storyText: string,
  onProgress?: (text: string) => void
): Promise<string[] | null> => {
  if (!isWebGPUSupported() || !storyText.trim()) return null;

  try {
    const engine = await getEngine(onProgress);
    const response = await engine.chat.completions.create({
      messages: [{ role: "user", content: buildPrompt(storyText) }],
      temperature: 0.4,
    });
    const content = response.choices[0]?.message?.content ?? "";
    const items = parseActionItems(content);
    return items.length > 0 ? items : null;
  } catch (error) {
    console.error("WebLLM action item generation failed", error);
    return null;
  }
};
