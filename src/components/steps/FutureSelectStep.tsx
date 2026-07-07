import * as React from "react";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelDial } from "../wheel/WheelDial";
import { deltaColor } from "../wheel/deltaColor";

interface FutureSelectStepProps {
  appData: AppData;
  selected: number[];
  onToggle: (index: number) => void;
  onSubmit: () => void;
}

export const FutureSelectStep: React.FC<FutureSelectStepProps> = ({ appData, selected, onToggle, onSubmit }) => {
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);

  return (
    <div>
      <Title>Now and Future, overlapped.</Title>
      <Subtitle>Click the areas you actually want to do something about. The dark tick shows where you are now.</Subtitle>
      <WheelDial
        slices={appData.futureWheel.slices.map((s, i) => ({ ...s, baseline: nowValues[i] }))}
        mode="select"
        activeIndex={null}
        selected={selected}
        colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
        onActivate={onToggle}
      />
      <Button style={{ marginTop: 24 }} onClick={onSubmit}>
        Continue
      </Button>
    </div>
  );
};
