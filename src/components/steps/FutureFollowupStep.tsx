import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { AppData } from "../../types";
import { Title, Button, ButtonRow, TextInput } from "../ui";
import { WheelDial } from "../wheel/WheelDial";
import { deltaColor } from "../wheel/deltaColor";

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
  max-width: 320px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Bubble = styled.p`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 10px;
  padding: 12px 14px;
  margin: 0 0 12px;
`;

const AnsweredBubble = styled(Bubble)`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
`;

interface FutureFollowupStepProps {
  appData: AppData;
  index: number;
  onSubmit: (answer: string) => void;
}

export const FutureFollowupStep: React.FC<FutureFollowupStepProps> = ({ appData, index, onSubmit }) => {
  const now = appData.nowWheel.slices[index];
  const future = appData.futureWheel.slices[index];
  const name = future.name || now.name;
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);

  const question2 =
    future.rating > now.rating
      ? "What could you do to help you improve this rating?"
      : future.rating < now.rating
      ? `What could you give up on in terms of "${name}"?`
      : null;

  const [answer1, setAnswer1] = useState("");
  const [submittedFirst, setSubmittedFirst] = useState(false);
  const [answer2, setAnswer2] = useState("");

  const finish = (a1: string, a2: string) => {
    const parts = [`Q: What is contributing to the current ${now.rating} rating of "${name}"?\nA: ${a1}`];
    if (question2) parts.push(`Q: ${question2}\nA: ${a2}`);
    onSubmit(parts.join("\n\n"));
  };

  const submitFirst = () => {
    if (!answer1.trim()) return;
    if (question2) setSubmittedFirst(true);
    else finish(answer1.trim(), "");
  };

  const submitSecond = () => {
    if (!answer2.trim()) return;
    finish(answer1.trim(), answer2.trim());
  };

  return (
    <div>
      <Title>Let's dig into "{name}"</Title>
      <Row>
        <WheelDial
          slices={appData.futureWheel.slices.map((s, i) => ({ ...s, baseline: nowValues[i] }))}
          mode="view"
          activeIndex={index}
          colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
        />
        <PanelWrap>
          <Bubble>What is contributing to the current {now.rating} rating of "{name}"?</Bubble>
          {!submittedFirst ? (
            <>
              <TextInput
                autoFocus
                placeholder="What's going on here?"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitFirst()}
              />
              <ButtonRow>
                <Button type="button" disabled={!answer1.trim()} onClick={submitFirst}>
                  {question2 ? "Next" : "Continue"}
                </Button>
              </ButtonRow>
            </>
          ) : (
            <>
              <AnsweredBubble>{answer1}</AnsweredBubble>
              {question2 && (
                <>
                  <Bubble>{question2}</Bubble>
                  <TextInput
                    autoFocus
                    placeholder="What's one thing that would help?"
                    value={answer2}
                    onChange={(e) => setAnswer2(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitSecond()}
                  />
                  <ButtonRow>
                    <Button type="button" disabled={!answer2.trim()} onClick={submitSecond}>
                      Continue
                    </Button>
                  </ButtonRow>
                </>
              )}
            </>
          )}
        </PanelWrap>
      </Row>
    </div>
  );
};
