import * as React from "react";
import styled from "styled-components";
import { AppData } from "../../types";
import { Title, Subtitle, Button } from "../ui";
import { WheelDial } from "../wheel/WheelDial";
import { deltaColor } from "../wheel/deltaColor";

const Row = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const WheelColumn = styled.div`
  text-align: center;
`;

const average = (values: number[]): number => values.reduce((a, b) => a + b, 0) / values.length;

export const ChoicesCompareStep: React.FC<{ appData: AppData; onRestart: () => void }> = ({
  appData,
  onRestart,
}) => {
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);
  const ranked = [...appData.choices].sort(
    (a, b) => average(b.slices.map((s) => s.rating)) - average(a.slices.map((s) => s.rating))
  );
  const best = ranked[0];

  return (
    <div>
      <Title>Here's how each choice compares.</Title>
      <Subtitle>
        {best
          ? `On average, "${best.title}" scores highest, but not all areas may be weighed the same. Have a look at the way each choice would shape your life and wonder, which version is the most preferable?`
          : `On average your choices look pretty similar, but not all areas may be weighed the same. Have a look at the way each choice would shape your life and wonder, which version is the most preferable?`}
      </Subtitle>
      <Row>
        <WheelColumn>
          <strong>Now</strong>
          <WheelDial slices={appData.nowWheel.slices} mode="view" activeIndex={null} size={220} />
        </WheelColumn>
        {appData.choices.map((choice) => (
          <WheelColumn key={choice.title}>
            <strong>{choice.title}</strong>
            <WheelDial
              slices={choice.slices.map((s, i) => ({ ...s, baseline: nowValues[i] }))}
              mode="view"
              activeIndex={null}
              size={220}
              colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
            />
          </WheelColumn>
        ))}
      </Row>
      <Button style={{ marginTop: 32 }} onClick={onRestart}>
        Start a new wheel
      </Button>
    </div>
  );
};
