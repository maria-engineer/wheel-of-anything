import { Action, FlowState, Step } from "./flowTypes";
import { emptyAppData, emptySlice, SLICE_COUNT } from "../types";

export const initialFlowState: FlowState = {
  appData: emptyAppData(),
  step: { kind: "title" },
  path: null,
  decreaseQueue: [],
  selectedSliceIndices: [],
};

const nextActionItemId = (items: { id: number }[]): number =>
  items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

export function flowReducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "SET_TITLE": {
      return {
        ...state,
        appData: { ...state.appData, title: action.title },
        step: { kind: "setupSlices", index: 0 },
      };
    }

    case "SET_SLICE_NAME": {
      const nowSlices = state.appData.nowWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, name: action.name } : slice
      );
      const futureSlices = state.appData.futureWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, name: action.name } : slice
      );
      const nextStep: Step =
        action.index < SLICE_COUNT - 1
          ? { kind: "setupSlices", index: action.index + 1 }
          : { kind: "rateNow", index: 0 };
      return {
        ...state,
        appData: {
          ...state.appData,
          nowWheel: { ...state.appData.nowWheel, slices: nowSlices },
          futureWheel: { ...state.appData.futureWheel, slices: futureSlices },
        },
        step: nextStep,
      };
    }

    case "RATE_NOW": {
      const slices = state.appData.nowWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, rating: action.rating, reasoning: action.reasoning } : slice
      );
      const nextStep: Step =
        action.index < SLICE_COUNT - 1 ? { kind: "rateNow", index: action.index + 1 } : { kind: "branch" };
      return {
        ...state,
        appData: { ...state.appData, nowWheel: { ...state.appData.nowWheel, slices } },
        step: nextStep,
      };
    }

    case "CHOOSE_PATH": {
      const nextStep: Step = action.path === "C" ? { kind: "choicesSetup" } : { kind: "futureImprove", index: 0 };
      return { ...state, path: action.path, step: nextStep };
    }

    case "SET_CHOICES": {
      const choices = action.names.map((name) => ({
        title: name,
        slices: state.appData.nowWheel.slices.map((s) => emptySlice(s.name)),
      }));
      return {
        ...state,
        appData: { ...state.appData, choices },
        step: { kind: "choicesRate", choiceIndex: 0, sliceIndex: 0 },
      };
    }

    case "RATE_CHOICE_SLICE": {
      const choices = state.appData.choices.map((wheel, ci) => {
        if (ci !== action.choiceIndex) return wheel;
        const slices = wheel.slices.map((slice, si) =>
          si === action.sliceIndex ? { ...slice, rating: action.rating, reasoning: action.reasoning } : slice
        );
        return { ...wheel, slices };
      });
      const isLastSlice = action.sliceIndex >= SLICE_COUNT - 1;
      const isLastChoice = action.choiceIndex >= state.appData.choices.length - 1;
      let nextStep: Step;
      if (!isLastSlice) {
        nextStep = { kind: "choicesRate", choiceIndex: action.choiceIndex, sliceIndex: action.sliceIndex + 1 };
      } else if (!isLastChoice) {
        nextStep = { kind: "choicesRate", choiceIndex: action.choiceIndex + 1, sliceIndex: 0 };
      } else {
        nextStep = { kind: "choicesCompare" };
      }
      return { ...state, appData: { ...state.appData, choices }, step: nextStep };
    }

    case "RATE_FUTURE_IMPROVE": {
      const slices = state.appData.futureWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, rating: action.rating, reasoning: action.reasoning } : slice
      );
      const futureWheel = { ...state.appData.futureWheel, slices };
      if (action.index < SLICE_COUNT - 1) {
        return {
          ...state,
          appData: { ...state.appData, futureWheel },
          step: { kind: "futureImprove", index: action.index + 1 },
        };
      }
      const decreaseQueue = state.appData.nowWheel.slices
        .map((nowSlice, i) => (nowSlice.rating === slices[i].rating ? i : -1))
        .filter((i) => i >= 0);
      const nextStep: Step =
        decreaseQueue.length > 0 ? { kind: "futureDecrease", queueIndex: 0 } : { kind: "futureSelect" };
      return {
        ...state,
        appData: { ...state.appData, futureWheel },
        decreaseQueue,
        step: nextStep,
      };
    }

    case "RATE_FUTURE_DECREASE": {
      const slices = state.appData.futureWheel.slices.map((slice, i) =>
        i === action.index ? { ...slice, rating: action.rating, reasoning: action.reasoning } : slice
      );
      const futureWheel = { ...state.appData.futureWheel, slices };
      const step = state.step;
      const queueIndex = step.kind === "futureDecrease" ? step.queueIndex : 0;
      const nextStep: Step =
        queueIndex + 1 < state.decreaseQueue.length
          ? { kind: "futureDecrease", queueIndex: queueIndex + 1 }
          : { kind: "futureSelect" };
      return { ...state, appData: { ...state.appData, futureWheel }, step: nextStep };
    }

    case "SET_SELECTED_SLICES": {
      const nextStep: Step =
        action.indices.length > 0 ? { kind: "futureFollowup", queueIndex: 0 } : { kind: "results" };
      return { ...state, selectedSliceIndices: action.indices, step: nextStep };
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
