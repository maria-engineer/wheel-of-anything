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

export interface AppData {
  title: string; // "Wheel of [X]"
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
  nowWheel: emptyWheel("Now"),
  futureWheel: emptyWheel("Future"),
  choices: [],
  actionItems: [],
});
