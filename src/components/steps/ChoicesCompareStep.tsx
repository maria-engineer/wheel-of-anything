import * as React from "react";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelRadarChart, RadarSeries } from "../WheelRadarChart";

const PALETTE = ["#4B4ADE", "#2ECC71", "#FF9F43", "#FF5C5C", "#00B8D9"];

const average = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length;

export const ChoicesCompareStep: React.FC<{ appData: AppData; onRestart: () => void }> = ({
  appData,
  onRestart,
}) => {
  const sliceNames = appData.nowWheel.slices.map((s) => s.name);

  const series: RadarSeries[] = [
    {
      key: "now",
      name: "Now",
      color: "#8A8DA6",
      values: appData.nowWheel.slices.map((s) => s.rating),
    },
    ...appData.choices.map((choice, i) => ({
      key: `choice-${i}`,
      name: choice.title,
      color: PALETTE[i % PALETTE.length],
      values: choice.slices.map((s) => s.rating),
    })),
  ];

  const ranked = [...appData.choices].sort(
    (a, b) => average(b.slices.map((s) => s.rating)) - average(a.slices.map((s) => s.rating))
  );
  const best = ranked[0];

  return (
    <div>
      <Title>Here's how each choice compares.</Title>
      <Subtitle>
        {best
          ? `On average, "${best.title}" scores highest — but take a look at which specific areas matter most to you.`
          : "Add a choice to see how it compares."}
      </Subtitle>
      <WheelRadarChart sliceNames={sliceNames} series={series} />
      <Button style={{ marginTop: 32 }} onClick={onRestart}>
        Start a new wheel
      </Button>
    </div>
  );
};
