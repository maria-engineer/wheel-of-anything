import * as React from "react";
import { Wheel } from "../../types";
import { Title, Subtitle, Button, ButtonRow } from "../ui";
import { WheelDial } from "../wheel/WheelDial";
import { Path } from "../../context/flowTypes";

export const BranchStep: React.FC<{ nowWheel: Wheel; onChoose: (path: Path) => void }> = ({
  nowWheel,
  onChoose,
}) => (
  <div>
    <Title>Your wheel is complete.</Title>
    <Subtitle>What do you want to explore next?</Subtitle>
    <WheelDial slices={nowWheel.slices} mode="view" activeIndex={null} />
    <ButtonRow>
      <Button onClick={() => onChoose("B")}>Brainstorm the future</Button>
      <Button variant="secondary" onClick={() => onChoose("C")}>
        Compare choices
      </Button>
    </ButtonRow>
  </div>
);
