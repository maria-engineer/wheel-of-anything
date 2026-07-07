import * as React from "react";
import { Title, Subtitle, Button, ButtonRow } from "../ui";
import { Path } from "../../context/flowTypes";

export const BranchStep: React.FC<{ onChoose: (path: Path) => void }> = ({ onChoose }) => (
  <div>
    <Title>Your wheel is complete.</Title>
    <Subtitle>What do you want to explore next?</Subtitle>
    <ButtonRow>
      <Button onClick={() => onChoose("B")}>Brainstorm the future</Button>
      <Button variant="secondary" onClick={() => onChoose("C")}>
        Compare choices
      </Button>
    </ButtonRow>
  </div>
);
