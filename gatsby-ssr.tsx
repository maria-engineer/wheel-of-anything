import * as React from "react";
import { WheelProvider } from "./src/context/WheelContext";

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => (
  <WheelProvider>{element}</WheelProvider>
);
