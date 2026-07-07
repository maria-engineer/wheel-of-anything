import * as React from "react";
import { useState } from "react";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelRadarChart } from "../WheelRadarChart";
import { SliceDeltaList } from "../SliceDeltaList";

export const FutureSelectStep: React.FC<{ appData: AppData; onSubmit: (indices: number[]) => void }> = ({
  appData,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const sliceNames = appData.nowWheel.slices.map((s) => s.name);
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);
  const futureValues = appData.futureWheel.slices.map((s) => s.rating);

  const toggle = (index: number) => {
    setSelected((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <div>
      <Title>Now and Future, overlapped.</Title>
      <Subtitle>Pick the areas you actually want to do something about.</Subtitle>
      <WheelRadarChart
        sliceNames={sliceNames}
        series={[
          { key: "now", name: "Now", color: "#8A8DA6", values: nowValues },
          { key: "future", name: "Future", color: "#4B4ADE", values: futureValues },
        ]}
      />
      <SliceDeltaList
        sliceNames={sliceNames}
        fromValues={nowValues}
        toValues={futureValues}
        selectable
        selected={selected}
        onToggle={toggle}
      />
      <Button disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
        Continue
      </Button>
    </div>
  );
};
