import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppData } from "../../types";
import { Title, Subtitle, Button, ButtonRow } from "../ui";
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
  max-width: 340px;
  min-height: 340px;
  max-height: 340px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const EmptyPanel = styled.div`
  margin: auto;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.95rem;
`;

const Thread = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
`;

const Bubble = styled.div<{ $mine?: boolean }>`
  max-width: 85%;
  align-self: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  background: ${({ theme, $mine }) => ($mine ? theme.colors.accent : theme.colors.background)};
  color: ${({ theme, $mine }) => ($mine ? theme.colors.accentText : theme.colors.text)};
  border-radius: 14px;
  border-bottom-right-radius: ${({ $mine }) => ($mine ? "4px" : "14px")};
  border-bottom-left-radius: ${({ $mine }) => ($mine ? "14px" : "4px")};
  padding: 10px 14px;
  font-size: 0.82rem;
  line-height: 1.4;
`;

const Composer = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const ComposerInput = styled.textarea`
  flex: 1;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.4;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.text};
  max-height: calc(1.4em * 3 + 16px);
  overflow-y: auto;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

const SendButton = styled(Button)`
  padding: 10px 16px;
  white-space: nowrap;
`;

const DoneTag = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
  margin: 4px 0 0;
`;

const RemoveLink = styled.button`
  appearance: none;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  align-self: flex-start;
  padding: 0;
  margin-top: 12px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

interface QA {
  question: string;
  answer: string;
}

const parseReasoning = (reasoning: string): QA[] =>
  reasoning
    ? reasoning.split("\n\n").map((block) => {
        const [qLine, ...rest] = block.split("\n");
        return { question: qLine.replace(/^Q:\s*/, ""), answer: rest.join("\n").replace(/^A:\s*/, "") };
      })
    : [];

interface FutureFollowupStepProps {
  appData: AppData;
  selected: number[];
  onSelect: (index: number) => void;
  onDeselect: (index: number) => void;
  onAnswer: (index: number, block: string) => void;
  onSubmit: () => void;
}

export const FutureFollowupStep: React.FC<FutureFollowupStepProps> = ({
  appData,
  selected,
  onSelect,
  onDeselect,
  onAnswer,
  onSubmit,
}) => {
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activate = (index: number) => {
    onSelect(index);
    setActiveIndex(index);
  };

  return (
    <div>
      <Title>Now and Future, overlapped.</Title>
      <Subtitle>
        Click an area you want to reflect on. The dark tick shows where you are now — answer the questions on the
        right to dig into why, and what could change.
      </Subtitle>
      <Row>
        <WheelDial
          slices={appData.futureWheel.slices.map((s, i) => ({ ...s, baseline: nowValues[i] }))}
          mode="select"
          activeIndex={activeIndex}
          selected={selected}
          colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
          onActivate={activate}
        />
        <PanelWrap>
          {activeIndex === null ? (
            <EmptyPanel>Click a wedge on the wheel to start reflecting on it.</EmptyPanel>
          ) : (
            <FollowupChat
              key={activeIndex}
              appData={appData}
              index={activeIndex}
              onAnswer={onAnswer}
              onRemove={() => {
                onDeselect(activeIndex);
                setActiveIndex(null);
              }}
            />
          )}
        </PanelWrap>
      </Row>
      <ButtonRow>
        <Button onClick={onSubmit}>Continue</Button>
      </ButtonRow>
    </div>
  );
};

interface FollowupChatProps {
  appData: AppData;
  index: number;
  onAnswer: (index: number, block: string) => void;
  onRemove: () => void;
}

const FollowupChat: React.FC<FollowupChatProps> = ({ appData, index, onAnswer, onRemove }) => {
  const now = appData.nowWheel.slices[index];
  const future = appData.futureWheel.slices[index];
  const name = future.name || now.name;

  const question1 = `What is contributing to the current ${now.rating} rating of "${name}"?`;
  const question2 =
    future.rating > now.rating
      ? "What could you do to help you improve this rating?"
      : future.rating < now.rating
      ? `What could you give up on in terms of "${name}"?`
      : null;

  const answered = parseReasoning(future.reasoning);
  const nextQuestion = answered.length === 0 ? question1 : answered.length === 1 && question2 ? question2 : null;

  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [answered.length, nextQuestion]);

  const submit = () => {
    if (!draft.trim() || !nextQuestion) return;
    onAnswer(index, `Q: ${nextQuestion}\nA: ${draft.trim()}`);
    setDraft("");
  };

  return (
    <>
      <Thread ref={threadRef}>
        {answered.map((qa, i) => (
          <React.Fragment key={i}>
            <Bubble>{qa.question}</Bubble>
            <Bubble $mine>{qa.answer}</Bubble>
          </React.Fragment>
        ))}
        {nextQuestion && <Bubble>{nextQuestion}</Bubble>}
        {!nextQuestion && <DoneTag>You've explored this one. Click another wedge, or continue.</DoneTag>}
      </Thread>
      {nextQuestion && (
        <Composer onSubmit={(e) => (e.preventDefault(), submit())}>
          <ComposerInput
            ref={textareaRef}
            autoFocus
            rows={1}
            placeholder="Type your answer…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <SendButton type="submit" disabled={!draft.trim()}>
            Send
          </SendButton>
        </Composer>
      )}
      <RemoveLink type="button" onClick={onRemove}>
        Remove from selection
      </RemoveLink>
    </>
  );
};
