import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelDial } from "../wheel/WheelDial";
import { deltaColor } from "../wheel/deltaColor";
import { ActionItemList } from "../ActionItemList";
import { generateActionItems, isWebGPUSupported } from "../../webllm/actionItems";
import { buildStoryText } from "../../utils/buildStory";
import { ButtonWrap } from "./ChoicesCompareStep";

const ChartsRow = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ChartColumn = styled.div`
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
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);

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
          <WheelDial slices={appData.nowWheel.slices} mode="view" activeIndex={null} size={260} />
        </ChartColumn>
        <ChartColumn>
          <Subtitle>Future</Subtitle>
          <WheelDial
            slices={appData.futureWheel.slices.map((s, i) => ({ ...s, baseline: nowValues[i] }))}
            mode="view"
            activeIndex={null}
            size={260}
            colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
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
      <ButtonWrap>
              <Button onClick={onRestart}>Start a new wheel</Button>
      </ButtonWrap>
    </div>
  );
};
