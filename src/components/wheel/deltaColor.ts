import { theme } from "../../styles/theme";

export const deltaColor = (baseline: number, value: number): string => {
  if (value > baseline) return theme.colors.improved;
  if (value < baseline) return theme.colors.decreased;
  return theme.colors.unchanged;
};
