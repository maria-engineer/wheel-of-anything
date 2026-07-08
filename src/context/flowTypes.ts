import { AppData, ActionItem, Path, Step } from "../types";

export type { Path, Step };

export type SliceTarget = { wheel: "now" } | { wheel: "future" } | { wheel: "choice"; choiceIndex: number };

export interface FlowState {
  appData: AppData;
  path: Path | null;
  decreaseQueue: number[]; // slice indices left unchanged by the improve pass
  selectedSliceIndices: number[]; // chosen in futureSelect, to get a follow-up question
}

export type Action =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_SLICE_NAME"; index: number; name: string }
  | { type: "SUBMIT_SETUP" }
  | { type: "RATE_SLICE"; target: SliceTarget; index: number; rating: number }
  | { type: "REASON_SLICE"; target: SliceTarget; index: number; reasoning: string }
  | { type: "SUBMIT_RATE_NOW" }
  | { type: "CHOOSE_PATH"; path: Path }
  | { type: "SET_CHOICES"; names: string[] }
  | { type: "SUBMIT_CHOICE_RATE" }
  | { type: "SUBMIT_FUTURE_IMPROVE" }
  | { type: "SUBMIT_FUTURE_DECREASE" }
  | { type: "TOGGLE_SELECTED_SLICE"; index: number }
  | { type: "SUBMIT_FUTURE_SELECT" }
  | { type: "ANSWER_FOLLOWUP"; index: number; answer: string }
  | { type: "SET_ACTION_ITEMS"; items: ActionItem[] }
  | { type: "ADD_ACTION_ITEM"; text: string }
  | { type: "TOGGLE_ACTION_ITEM"; id: number }
  | { type: "DELETE_ACTION_ITEM"; id: number }
  | { type: "RESTORE"; state: FlowState }
  | { type: "RESET" };
