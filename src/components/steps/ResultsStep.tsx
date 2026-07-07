import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelRadarChart } from "../WheelRadarChart";
import { ActionItemList } from "../ActionItemList";
import { generateActionItems, isWebGPUSupported } from "../../webllm/actionItems";
import { buildStoryText } from "../../utils/buildStory";

const ChartsRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ChartColumn = styled.div`
  flex: 1;
  min-width: 240px;
  text-align: center;
`;

const StatusText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

interface ResultsStepProps {
  appData: AppData;
  selectedSliceIndices: number[];
  onToggleActionItem: (id: number) => void;
  onDeleteActionItem: (id: number) => void;
  onAddActionItem: (text: string) => void;
  onSetActionItems: (items: string[]) => void;
  onRestart: () => void;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({
  appData,
  selectedSliceIndices,
  onToggleActionItem,
  onDeleteActionItem,
  onAddActionItem,
  onSetActionItems,
  onRestart,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "unavailable">("idle");
  const [progressText, setProgressText] = useState("");
  const started = useRef(false);
  const sliceNames = appData.nowWheel.slices.map((s) => s.name);

  useEffect(() => {
    if (started.current || appData.actionItems.length > 0) return;
    started.current = true;

    if (!isWebGPUSupported()) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");
    const story = buildStoryText(appData, selectedSliceIndices);
    generateActionItems(story, setProgressText).then((items) => {
      if (items) {
        onSetActionItems(items);
        setStatus("done");
      } else {
        setStatus("unavailable");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Title>Amazing! Let's look at what we found.</Title>
      <ChartsRow>
        <ChartColumn>
          <Subtitle>Now</Subtitle>
          <WheelRadarChart
            sliceNames={sliceNames}
            series={[{ key: "now", name: "Now", color: "#8A8DA6", values: appData.nowWheel.slices.map((s) => s.rating) }]}
            height={240}
          />
        </ChartColumn>
        <ChartColumn>
          <Subtitle>Future</Subtitle>
          <WheelRadarChart
            sliceNames={sliceNames}
            series={[
              { key: "future", name: "Future", color: "#4B4ADE", values: appData.futureWheel.slices.map((s) => s.rating) },
            ]}
            height={240}
          />
        </ChartColumn>
      </ChartsRow>

      <Subtitle as="h2" style={{ marginTop: 32 }}>
        Action items
      </Subtitle>
      {status === "loading" && <StatusText>Thinking it through locally in your browser{progressText ? ` — ${progressText}` : "…"}</StatusText>}
      {status === "unavailable" && (
        <StatusText>
          This browser can't run the local model for suggestions, so add your own action items below.
        </StatusText>
      )}
      <ActionItemList
        items={appData.actionItems}
        onToggle={onToggleActionItem}
        onDelete={onDeleteActionItem}
        onAdd={onAddActionItem}
      />
      <Button variant="secondary" style={{ marginTop: 24 }} onClick={onRestart}>
        Start a new wheel
      </Button>
    </div>
  );
};
