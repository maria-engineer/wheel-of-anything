import React from "react";
import { AppStateProvider } from "./src/state/AppStateContext";

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => (
  <AppStateProvider>{element}</AppStateProvider>
);
