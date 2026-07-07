import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { MAX_CHOICES } from "../../types";
import { Title, Subtitle, Button, ButtonRow, TextInput } from "../ui";

const List = styled.ul`
  list-style: none;
  margin: 16px 0;
  padding: 0;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
`;

const RemoveButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
`;

const AddRow = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

export const ChoicesSetupStep: React.FC<{ onSubmit: (names: string[]) => void }> = ({ onSubmit }) => {
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const addChoice = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || names.length >= MAX_CHOICES) return;
    setNames([...names, trimmed]);
    setDraft("");
  };

  const removeChoice = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Title>What choices are you weighing?</Title>
      <Subtitle>
        Add up to {MAX_CHOICES} options you're deciding between (most people add around 3).
      </Subtitle>
      <List>
        {names.map((name, i) => (
          <Row key={`${name}-${i}`}>
            <span style={{ flex: 1 }}>{name}</span>
            <RemoveButton type="button" onClick={() => removeChoice(i)} aria-label={`Remove ${name}`}>
              ✕
            </RemoveButton>
          </Row>
        ))}
      </List>
      {names.length < MAX_CHOICES && (
        <AddRow onSubmit={addChoice}>
          <TextInput placeholder="e.g. Stay in my current job" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button type="submit">Add</Button>
        </AddRow>
      )}
      <ButtonRow>
        <Button type="button" disabled={names.length === 0} onClick={() => onSubmit(names)}>
          Done
        </Button>
      </ButtonRow>
    </div>
  );
};
