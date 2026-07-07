import * as React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import { Action, FlowState } from "./flowTypes";
import { flowReducer, initialFlowState } from "./flowReducer";

const STORAGE_KEY = "wheel-of-anything:v1";

interface WheelContextValue {
  state: FlowState;
  dispatch: React.Dispatch<Action>;
}

export const WheelContext = createContext<WheelContextValue | undefined>(undefined);

const loadPersistedState = (): FlowState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FlowState) : null;
  } catch {
    return null;
  }
};

export const WheelProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(flowReducer, initialFlowState);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) dispatch({ type: "RESTORE", state: persisted });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return <WheelContext.Provider value={{ state, dispatch }}>{children}</WheelContext.Provider>;
};

export const useWheel = (): WheelContextValue => {
  const ctx = useContext(WheelContext);
  if (!ctx) throw new Error("useWheel must be used within a WheelProvider");
  return ctx;
};
