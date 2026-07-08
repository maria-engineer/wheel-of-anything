import { useState } from "react";

export function useWheelSelection(eligible: number[], seedConfirmed: number[]) {
  const [confirmed, setConfirmed] = useState<number[]>(seedConfirmed);
  const firstOpen = eligible.find((i) => !seedConfirmed.includes(i)) ?? null;
  const [activeIndex, setActiveIndex] = useState<number | null>(firstOpen);
  const allDone = eligible.every((i) => confirmed.includes(i));

  const confirmAndAdvance = (index: number) => {
    const updated = confirmed.includes(index) ? confirmed : [...confirmed, index];
    setConfirmed(updated);
    const next = eligible.find((i) => !updated.includes(i)) ?? null;
    setActiveIndex(next);
    return next;
  };

  const confirm  = (index: number) => {
    const updated = confirmed.includes(index) ? confirmed : [...confirmed, index];
    setConfirmed(updated);
  };

  return { confirmed, activeIndex, setActiveIndex, allDone, confirmAndAdvance, confirm };
}
