import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { WheelDial, WheelSliceDatum } from "./WheelDial";
import { Title, Subtitle, Button, ButtonRow, TextInput } from "../ui";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 24px;
  width: 100%;
`;

const PanelWrap = styled.div`
  width: 100%;
  max-width: 280px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PanelHeading = styled.h3`
  margin: 0 0 16px;
`;

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

const HintText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  margin: 8px 0 16px;
`;

interface WheelPhaseScreenProps {
  title: string;
  subtitle?: string;
  mode: "name" | "rate";
  slices: WheelSliceDatum[];
  interactiveIndices?: number[];
  baselineValues?: number[];
  colorForIndex?: (index: number, slice: WheelSliceDatum) => string;
  onNameChange?: (index: number, name: string) => void;
  onRate?: (index: number, rating: number) => void;
  onContinue: () => void;
  continueLabel?: string;
}

export const WheelPhaseScreen: React.FC<WheelPhaseScreenProps> = ({
  title,
  subtitle,
  mode,
  slices,
  interactiveIndices,
  baselineValues,
  colorForIndex,
  onNameChange,
  onRate,
  onContinue,
  continueLabel = "Continue",
}) => {
  const eligible = interactiveIndices ?? slices.map((_, i) => i);
  const seedConfirmed = mode === "name" ? eligible.filter((i) => slices[i].name.trim() !== "") : [];
  const [confirmed, setConfirmed] = useState<number[]>(seedConfirmed);
  const firstOpen = eligible.find((i) => !seedConfirmed.includes(i)) ?? null;
  const [activeIndex, setActiveIndex] = useState<number | null>(firstOpen);
  const [draftName, setDraftName] = useState(firstOpen !== null ? slices[firstOpen].name : "");

  const allDone = eligible.every((i) => confirmed.includes(i));
  const dialSlices = slices.map((s, i) => ({ ...s, baseline: baselineValues?.[i] }));
  const active = activeIndex !== null ? slices[activeIndex] : null;

  const activate = (index: number) => {
    setActiveIndex(index);
    if (mode === "name") setDraftName(slices[index].name);
  };

  const confirmAndAdvance = (index: number) => {
    const updated = confirmed.includes(index) ? confirmed : [...confirmed, index];
    setConfirmed(updated);
    const next = eligible.find((i) => !updated.includes(i)) ?? null;
    setActiveIndex(next);
    if (mode === "name") setDraftName(next !== null ? slices[next].name : "");
  };

  return (
    <Layout>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <HintText>
        {confirmed.length} of {eligible.length} areas set
      </HintText>

      <Row>
        <WheelDial
          slices={dialSlices}
          mode={mode === "name" ? "name" : "rate"}
          activeIndex={activeIndex}
          interactiveIndices={interactiveIndices}
          colorForIndex={colorForIndex}
          onActivate={activate}
          onRate={(i, value) => onRate?.(i, value)}
        />

        {mode === "rate" && active && activeIndex !== null && (
          <PanelWrap>
            <PanelHeading>{active.name || `Area ${activeIndex + 1}`}</PanelHeading>
            <NumberRow>
              <NumberInput
                autoFocus
                type="number"
                min={0}
                max={10}
                value={active.rating}
                onChange={(e) => onRate?.(activeIndex, Math.max(0, Math.min(10, Number(e.target.value))))}
                onKeyDown={(e) => e.key === "Enter" && confirmAndAdvance(activeIndex)}
              />
              <span>/ 10 (or drag the wedge)</span>
            </NumberRow>
            <Button type="button" onClick={() => confirmAndAdvance(activeIndex)}>
              Next
            </Button>
          </PanelWrap>
        )}

        {mode === "name" && activeIndex !== null && (
          <PanelWrap>
            <PanelHeading>Area {activeIndex + 1}</PanelHeading>
            <TextInput
              autoFocus
              placeholder="e.g. Health"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draftName.trim()) {
                  onNameChange?.(activeIndex, draftName.trim());
                  confirmAndAdvance(activeIndex);
                }
              }}
            />
            <ButtonRow>
              <Button
                type="button"
                disabled={!draftName.trim()}
                onClick={() => {
                  onNameChange?.(activeIndex, draftName.trim());
                  confirmAndAdvance(activeIndex);
                }}
              >
                Next
              </Button>
            </ButtonRow>
          </PanelWrap>
        )}
      </Row>

      <ButtonRow>
        <Button type="button" disabled={!allDone} onClick={onContinue}>
          {continueLabel}
        </Button>
      </ButtonRow>
    </Layout>
  );
};
