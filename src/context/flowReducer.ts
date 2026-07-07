import { Action, FlowState, SliceTarget, Step } from "./flowTypes";
import { AppData, Wheel, emptyAppData } from "../types";

export const initialFlowState: FlowState = {
  appData: emptyAppData(),
  step: { kind: "title" },
  path: null,
  decreaseQueue: [],
  selectedSliceIndices: [],
};

const nextActionItemId = (items: { id: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

const getWheel = (appData: AppData, target: SliceTarget): Wheel =>
  target.wheel === "now" ? appData.nowWheel : target.wheel === "future" ? appData.futureWheel : appData.choices[target.choiceIndex];

const withWheel = (appData: AppData, target: SliceTarget, wheel: Wheel): AppData => {
  if (target.wheel === "now") return { ...appData, nowWheel: wheel };
  if (target.wheel === "future") return { ...appData, futureWheel: wheel };
  const choices = appData.choices.map((c, i) => (i === target.choiceIndex ? wheel : c));
  return { ...appData, choices };
};

const patchSlice = (
  appData: AppData,
  target: SliceTarget,
  index: number,
  patch: { rating?: number; reasoning?: string }
): AppData => {
  const wheel = getWheel(appData, target);
  const slices = wheel.slices.map((s, i) => (i === index ? { ...s, ...patch } : s));
  return withWheel(appData, target, { ...wheel, slices });
};

export function flowReducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "SET_TITLE":
      return {
        ...state,
        appData: { ...state.appData, title: action.title },
        step: { kind: "setupWheel" },
      };

    case "SET_SLICE_NAME": {
      const nowSlices = state.appData.nowWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, name: action.name } : slice
      );
      const futureSlices = state.appData.futureWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, name: action.name } : slice
      );
      return {
        ...state,
        appData: {
          ...state.appData,
          nowWheel: { ...state.appData.nowWheel, slices: nowSlices },
          futureWheel: { ...state.appData.futureWheel, slices: futureSlices },
        },
      };
    }

    case "SUBMIT_SETUP":
      return { ...state, step: { kind: "rateNow" } };

    case "RATE_SLICE":
      return { ...state, appData: patchSlice(state.appData, action.target, action.index, { rating: action.rating }) };

    case "REASON_SLICE":
      return {
        ...state,
        appData: patchSlice(state.appData, action.target, action.index, { reasoning: action.reasoning }),
      };

    case "SUBMIT_RATE_NOW":
      return { ...state, step: { kind: "branch" } };

    case "CHOOSE_PATH": {
      if (action.path === "C") {
        return { ...state, path: "C", step: { kind: "choicesSetup" } };
      }
      const futureWheel: Wheel = {
        ...state.appData.futureWheel,
        slices: state.appData.nowWheel.slices.map((s) => ({ name: s.name, rating: s.rating, reasoning: "" })),
      };
      return {
        ...state,
        path: "B",
        appData: { ...state.appData, futureWheel },
        step: { kind: "futureImprove" },
      };
    }

    case "SET_CHOICES": {
      const choices = action.names.map((name) => ({
        title: name,
        slices: state.appData.nowWheel.slices.map((s) => ({ name: s.name, rating: s.rating, reasoning: "" })),
      }));
      return {
        ...state,
        appData: { ...state.appData, choices },
        step: { kind: "choicesRate", choiceIndex: 0 },
      };
    }

    case "SUBMIT_CHOICE_RATE": {
      const step = state.step;
      const choiceIndex = step.kind === "choicesRate" ? step.choiceIndex : 0;
      const nextStep: Step =
        choiceIndex < state.appData.choices.length - 1
          ? { kind: "choicesRate", choiceIndex: choiceIndex + 1 }
          : { kind: "choicesCompare" };
      return { ...state, step: nextStep };
    }

    case "SUBMIT_FUTURE_IMPROVE": {
      const decreaseQueue = state.appData.nowWheel.slices
        .map((nowSlice, i) => (nowSlice.rating === state.appData.futureWheel.slices[i].rating ? i : -1))
        .filter((i) => i >= 0);
      const nextStep: Step =
        decreaseQueue.length > 0 ? { kind: "futureDecrease" } : { kind: "futureSelect" };
      return { ...state, decreaseQueue, step: nextStep };
    }

    case "SUBMIT_FUTURE_DECREASE":
      return { ...state, step: { kind: "futureSelect" } };

    case "TOGGLE_SELECTED_SLICE": {
      const selectedSliceIndices = state.selectedSliceIndices.includes(action.index)
        ? state.selectedSliceIndices.filter((i) => i !== action.index)
        : [...state.selectedSliceIndices, action.index];
      return { ...state, selectedSliceIndices };
    }

    case "SUBMIT_FUTURE_SELECT": {
      const nextStep: Step =
        state.selectedSliceIndices.length > 0 ? { kind: "futureFollowup", queueIndex: 0 } : { kind: "results" };
      return { ...state, step: nextStep };
    }

    case "ANSWER_FOLLOWUP": {
      const slices = state.appData.futureWheel.slices.map((slice, i) =>
        i === action.index
          ? { ...slice, reasoning: [slice.reasoning, action.answer].filter(Boolean).join("\n\n") }
          : slice
      );
      const futureWheel = { ...state.appData.futureWheel, slices };
      const step = state.step;
      const queueIndex = step.kind === "futureFollowup" ? step.queueIndex : 0;
      const nextStep: Step =
        queueIndex + 1 < state.selectedSliceIndices.length
          ? { kind: "futureFollowup", queueIndex: queueIndex + 1 }
          : { kind: "results" };
      return { ...state, appData: { ...state.appData, futureWheel }, step: nextStep };
    }

    case "SET_ACTION_ITEMS":
      return { ...state, appData: { ...state.appData, actionItems: action.items } };

    case "ADD_ACTION_ITEM": {
      const item = { id: nextActionItemId(state.appData.actionItems), text: action.text, state: "TODO" as const };
      return { ...state, appData: { ...state.appData, actionItems: [...state.appData.actionItems, item] } };
    }

    case "TOGGLE_ACTION_ITEM": {
      const actionItems = state.appData.actionItems.map((item) =>
        item.id === action.id ? { ...item, state: item.state === "DONE" ? ("TODO" as const) : ("DONE" as const) } : item
      );
      return { ...state, appData: { ...state.appData, actionItems } };
    }

    case "DELETE_ACTION_ITEM": {
      const actionItems = state.appData.actionItems.filter((item) => item.id !== action.id);
      return { ...state, appData: { ...state.appData, actionItems } };
    }

    case "RESTORE":
      return action.state;

    case "RESET":
      return initialFlowState;

    default:
      return state;
  }
}
