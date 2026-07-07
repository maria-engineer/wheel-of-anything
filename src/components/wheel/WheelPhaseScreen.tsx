import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { WheelDial, WheelSliceDatum } from "./WheelDial";
import { Modal } from "../Modal";
import { Title, Subtitle, Button, ButtonRow, TextInput, TextArea, Field, Label } from "../ui";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PanelWrap = styled.div`
  width: 100%;
  max-width: 360px;
  margin-top: 16px;
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PanelHeading = styled.h3`
  margin: 0 0 12px;
`;

const NumberRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  margin: 8px 0 24px;
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
  onReason?: (index: number, reasoning: string) => void;
  onContinue: () => void;
  continueLabel?: string;
  seedConfirmedFromReasoning?: boolean;
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
  onReason,
  onContinue,
  continueLabel = "Continue",
  seedConfirmedFromReasoning = true,
}) => {
  const eligible = interactiveIndices ?? slices.map((_, i) => i);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [namingIndex, setNamingIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmed, setConfirmed] = useState<number[]>(() =>
    eligible.filter((i) =>
      mode === "name" ? slices[i].name.trim() !== "" : seedConfirmedFromReasoning && slices[i].reasoning?.trim()
    )
  );

  const allDone = eligible.every((i) => confirmed.includes(i));
  const confirm = (index: number) => setConfirmed((prev) => (prev.includes(index) ? prev : [...prev, index]));

  const dialSlices = slices.map((s, i) => ({ ...s, baseline: baselineValues?.[i] }));
  const active = activeIndex !== null ? slices[activeIndex] : null;

  return (
    <Layout>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <Hint>
        {confirmed.length} of {eligible.length} areas set
      </Hint>

      <WheelDial
        slices={dialSlices}
        mode={mode === "name" ? "name" : "rate"}
        activeIndex={mode === "name" ? namingIndex : activeIndex}
        interactiveIndices={interactiveIndices}
        colorForIndex={colorForIndex}
        onActivate={(i) => {
          if (mode === "name") {
            setNamingIndex(i);
            setDraftName(slices[i].name);
          } else {
            setActiveIndex(i);
          }
        }}
        onRate={(i, value) => onRate?.(i, value)}
      />

      {mode === "rate" && active && activeIndex !== null && (
        <PanelWrap>
          <PanelHeading>{active.name || `Area ${activeIndex + 1}`}</PanelHeading>
          <Field>
            <Label>Rating</Label>
            <NumberRow>
              <NumberInput
                type="number"
                min={0}
                max={10}
                value={active.rating}
                onChange={(e) => onRate?.(activeIndex, Math.max(0, Math.min(10, Number(e.target.value))))}
              />
              <span>/ 10 (or drag the wedge on the wheel)</span>
            </NumberRow>
          </Field>
          <Field>
            <Label>Why?</Label>
            <TextArea
              autoFocus
              value={active.reasoning}
              onChange={(e) => onReason?.(activeIndex, e.target.value)}
            />
          </Field>
          <Button
            type="button"
            onClick={() => {
              confirm(activeIndex);
              setActiveIndex(null);
            }}
          >
            Done with this one
          </Button>
        </PanelWrap>
      )}

      {mode === "name" && namingIndex !== null && (
        <Modal>
          <PanelHeading>Name area {namingIndex + 1}</PanelHeading>
          <Field>
            <TextInput
              autoFocus
              placeholder="e.g. Health"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draftName.trim()) {
                  onNameChange?.(namingIndex, draftName.trim());
                  confirm(namingIndex);
                  setNamingIndex(null);
                  setDraftName("");
                }
              }}
            />
          </Field>
          <Button
            type="button"
            disabled={!draftName.trim()}
            onClick={() => {
              onNameChange?.(namingIndex, draftName.trim());
              confirm(namingIndex);
              setNamingIndex(null);
              setDraftName("");
            }}
          >
            Save
          </Button>
        </Modal>
      )}

      <ButtonRow>
        <Button type="button" disabled={!allDone} onClick={onContinue}>
          {continueLabel}
        </Button>
      </ButtonRow>
    </Layout>
  );
};
