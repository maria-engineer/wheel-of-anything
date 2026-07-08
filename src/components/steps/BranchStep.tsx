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
    <Title>Your current wheel is complete.</Title>
    <Subtitle>Now we have gotten an idea of what now looks like, let's go to the next step. You may not know what choices you have in the future. In which case, choose the <b>Brainstorm the future</b> path, and we can look together at what you want the future to look like. If you already have a few choices in mind and need help deciding between them, choose the <b>Compare choices</b> option and let's look together at how those choices will each individually impact your wheel.</Subtitle>
    <WheelDial slices={nowWheel.slices} mode="view" activeIndex={null} />
    <ButtonRow>
      <Button onClick={() => onChoose("B")}>Brainstorm the future</Button>
      <Button variant="secondary" onClick={() => onChoose("C")}>
        Compare choices
      </Button>
    </ButtonRow>
  </div>
);
