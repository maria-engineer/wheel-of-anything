export type ActionItemState = "TODO" | "DONE";

export interface ActionItem {
  id: number;
  text: string;
  state: ActionItemState;
}

export interface Slice {
  name: string;
  rating: number; // 0-10
  reasoning: string;
}

export const SLICE_COUNT = 8;
export const MAX_CHOICES = 5;

export interface Wheel {
  title: string; // "Now", "Future", or a choice's name
  slices: Slice[]; // always SLICE_COUNT entries
}

export type Path = "B" | "C";

// The current stage of the wheel-building flow. Part of AppData so a
// saved/exported session captures not just the data but where the user
// was in the process.
export type Step =
  | { kind: "title" }
  | { kind: "setupWheel" }
  | { kind: "rateNow" }
  | { kind: "branch" }
  | { kind: "choicesSetup" }
  | { kind: "choicesRate"; choiceIndex: number }
  | { kind: "choicesCompare" }
  | { kind: "futureImprove" }
  | { kind: "futureDecrease" }
  | { kind: "futureSelect" }
  | { kind: "futureFollowup"; queueIndex: number }
  | { kind: "results" };

export interface AppData {
  title: string; // "Wheel of [X]"
  stage: Step;
  nowWheel: Wheel;
  futureWheel: Wheel;
  choices: Wheel[]; // at most MAX_CHOICES
  actionItems: ActionItem[];
}

export const emptySlice = (name = ""): Slice => ({ name, rating: 0, reasoning: "" });

export const emptyWheel = (title: string): Wheel => ({
  title,
  slices: Array.from({ length: SLICE_COUNT }, () => emptySlice()),
});

export const emptyAppData = (): AppData => ({
  title: "",
  stage: { kind: "title" },
  nowWheel: emptyWheel("Now"),
  futureWheel: emptyWheel("Future"),
  choices: [],
  actionItems: [],
});
