import { FlowState } from "../context/flowTypes";

const WHEEL_FILE_EXTENSION = ".wheel";

const slugify = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const downloadWheelFile = (state: FlowState): void => {
  const filename = `${slugify(state.appData.title) || "wheel"}${WHEEL_FILE_EXTENSION}`;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const isValidFlowState = (value: unknown): value is FlowState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  const step = state.step as Record<string, unknown> | undefined;
  if (!step || typeof step.kind !== "string") return false;
  const appData = state.appData as Record<string, unknown> | undefined;
  if (!appData || typeof appData.title !== "string") return false;
  return (
    !!appData.nowWheel &&
    !!appData.futureWheel &&
    Array.isArray(appData.choices) &&
    Array.isArray(appData.actionItems)
  );
};

export const parseWheelFile = (text: string): FlowState | null => {
  try {
    const parsed: unknown = JSON.parse(text);
    return isValidFlowState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};
