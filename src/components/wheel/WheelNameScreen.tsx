import * as React from "react";
import { useState } from "react";
import { WheelDial, WheelSliceDatum } from "./WheelDial";
import { ScreenLayout, PhaseRow, PanelWrap, PanelHeading, HintText } from "./WheelPhaseLayout";
import { useWheelSelection } from "./useWheelSelection";
import { Title, Subtitle, Button, ButtonRow, TextInput } from "../ui";

interface WheelNameScreenProps {
  title: string;
  subtitle?: string;
  slices: WheelSliceDatum[];
  onNameChange: (index: number, name: string) => void;
  onContinue: () => void;
  continueLabel?: string;
}

export const WheelNameScreen: React.FC<WheelNameScreenProps> = ({
  title,
  subtitle,
  slices,
  onNameChange,
  onContinue,
  continueLabel = "Continue",
}) => {
  const eligible = slices.map((_, i) => i);
  const seedConfirmed = eligible.filter((i) => slices[i].name.trim() !== "");
  const { confirmed, activeIndex, setActiveIndex, allDone, confirmAndAdvance } = useWheelSelection(
    eligible,
    seedConfirmed,
  );
  const [draftName, setDraftName] = useState(activeIndex !== null ? slices[activeIndex].name : "");

  const activate = (index: number) => {
    setActiveIndex(index);
    setDraftName(slices[index].name);
  };

  const confirm = (index: number) => {
    const next = confirmAndAdvance(index);
    setDraftName(next !== null ? slices[next].name : "");
  };

  return (
    <ScreenLayout>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      <HintText>
        {confirmed.length} of {eligible.length} areas set
      </HintText>

      <PhaseRow>
        <div>
          <WheelDial slices={slices} mode="name" activeIndex={activeIndex} onActivate={activate} />
        </div>

        <PanelWrap>
          {activeIndex !== null && (
            <>
              <PanelHeading>
                {slices[activeIndex].name.length > 0
                  ? "Would you like to change this?"
                  : activeIndex === 0
                    ? "What is an important area?"
                    : "What is another important area?"}
              </PanelHeading>
              <TextInput
                autoFocus
                placeholder="e.g. Health"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draftName.trim()) {
                    onNameChange(activeIndex, draftName.trim());
                    confirm(activeIndex);
                  }
                }}
              />
              <ButtonRow>
                <Button
                  type="button"
                  disabled={!draftName.trim()}
                  onClick={() => {
                    onNameChange(activeIndex, draftName.trim());
                    confirm(activeIndex);
                  }}
                >
                  Enter
                </Button>
              </ButtonRow>
            </>
          )}
        </PanelWrap>
      </PhaseRow>

      <ButtonRow>
        <Button type="button" disabled={!allDone} onClick={onContinue}>
          {continueLabel}
        </Button>
      </ButtonRow>
    </ScreenLayout>
  );
};
