import { AppData } from "../types";

export const buildStoryText = (appData: AppData, selectedIndices: number[]): string => {
  const indices = selectedIndices.length > 0 ? selectedIndices : appData.nowWheel.slices.map((_, i) => i);
  return indices
    .map((i) => {
      const now = appData.nowWheel.slices[i];
      const future = appData.futureWheel.slices[i];
      return [
        `## ${future.name || now.name}`,
        `Now: ${now.rating}/10 — ${now.reasoning || "(no notes)"}`,
        `Desired future: ${future.rating}/10 — ${future.reasoning || "(no notes)"}`,
      ].join("\n");
    })
    .join("\n\n");
};
