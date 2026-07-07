import { AppData, ActionItem } from "../types";

export type Path = "B" | "C";

export type Step =
  | { kind: "title" }
  | { kind: "setupSlices"; index: number }
  | { kind: "rateNow"; index: number }
  | { kind: "branch" }
  | { kind: "choicesSetup" }
  | { kind: "choicesRate"; choiceIndex: number; sliceIndex: number }
  | { kind: "choicesCompare" }
  | { kind: "futureImprove"; index: number }
  | { kind: "futureDecrease"; queueIndex: number }
  | { kind: "futureSelect" }
  | { kind: "futureFollowup"; queueIndex: number }
  | { kind: "results" };

export interface FlowState {
  appData: AppData;
  step: Step;
  path: Path | null;
  decreaseQueue: number[]; // slice indices left unchanged by the improve pass
  selectedSliceIndices: number[]; // chosen in futureSelect, to get a follow-up question
}

export type Action =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_SLICE_NAME"; index: number; name: string }
  | { type: "RATE_NOW"; index: number; rating: number; reasoning: string }
  | { type: "CHOOSE_PATH"; path: Path }
  | { type: "SET_CHOICES"; names: string[] }
  | {
      type: "RATE_CHOICE_SLICE";
      choiceIndex: number;
      sliceIndex: number;
      rating: number;
      reasoning: string;
    }
  | { type: "RATE_FUTURE_IMPROVE"; index: number; rating: number; reasoning: string }
  | { type: "RATE_FUTURE_DECREASE"; index: number; rating: number; reasoning: string }
  | { type: "SET_SELECTED_SLICES"; indices: number[] }
  | { type: "ANSWER_FOLLOWUP"; index: number; answer: string }
  | { type: "SET_ACTION_ITEMS"; items: ActionItem[] }
  | { type: "ADD_ACTION_ITEM"; text: string }
  | { type: "TOGGLE_ACTION_ITEM"; id: number }
  | { type: "DELETE_ACTION_ITEM"; id: number }
  | { type: "RESTORE"; state: FlowState }
  | { type: "RESET" };
