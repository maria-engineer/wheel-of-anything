import * as React from "react";
import styled from "styled-components";
import { WheelDial, WheelSliceDatum } from "./WheelDial";
import { ScreenLayout, PhaseRow, PanelWrap, PanelHeading, HintText } from "./WheelPhaseLayout";
import { useWheelSelection } from "./useWheelSelection";
import { Title, Subtitle, Button, ButtonRow } from "../ui";
import { deltaColor } from "./deltaColor";

const NumberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const NumberInput = styled.input`
  width: 64px;
  font-size: 1.3rem;
  padding: 6px 8px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

interface WheelRateScreenProps {
  title: string;
  subtitle?: string;
  slices: WheelSliceDatum[];
  interactiveIndices?: number[];
  baselineValues?: number[];
  colorForIndex?: (index: number, slice: WheelSliceDatum) => string;
  onRate: (index: number, rating: number) => void;
  onContinue: () => void;
  continueLabel?: string;
  mustRateAll: boolean;
}

export const WheelRateScreen: React.FC<WheelRateScreenProps> = ({
  title,
  subtitle,
  slices,
  interactiveIndices,
  baselineValues,
  colorForIndex,
  onRate,
  onContinue,
  continueLabel = "Continue",
  mustRateAll = true,
}) => {
  const eligible = interactiveIndices ?? slices.map((_, i) => i);
  const { confirmed, activeIndex, setActiveIndex, allDone, confirm } = useWheelSelection(eligible, []);
  const dialSlices = slices.map((s, i) => ({ ...s, baseline: baselineValues?.[i] }));

  return (
    <ScreenLayout>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <HintText>
        {confirmed.length} of {eligible.length} areas set
      </HintText>

      <PhaseRow>
        <div>
          <WheelDial
            slices={dialSlices}
            mode="rate"
            activeIndex={activeIndex}
            interactiveIndices={interactiveIndices}
            colorForIndex={colorForIndex}
            onActivate={setActiveIndex}
            onRate={(index: number, rating: number) => {onRate(index, rating); confirm(index)}}
          />
        </div>

      </PhaseRow> 

      <ButtonRow>
        <Button type="button" disabled={mustRateAll && !allDone} onClick={onContinue}>
          {continueLabel}
        </Button>
      </ButtonRow>
    </ScreenLayout>
  );
};
