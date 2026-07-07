import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { ActionItem } from "../types";
import { Button, TextInput } from "./ui";

const List = styled.ul`
  list-style: none;
  margin: 16px 0;
  padding: 0;
`;

const Row = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Text = styled.span<{ done: boolean }>`
  flex: 1;
  text-decoration: ${({ done }) => (done ? "line-through" : "none")};
  color: ${({ theme, done }) => (done ? theme.colors.muted : theme.colors.text)};
`;

const DeleteButton = styled.button`
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: ${({ theme }) => theme.colors.decreased};
  }
`;

const AddRow = styled.form`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

interface ActionItemListProps {
  items: ActionItem[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: (text: string) => void;
}

export const ActionItemList: React.FC<ActionItemListProps> = ({ items, onToggle, onDelete, onAdd }) => {
  const [newText, setNewText] = useState("");

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText("");
  };

  return (
    <div>
      <List>
        {items.map((item) => (
          <Row key={item.id}>
            <input type="checkbox" checked={item.state === "DONE"} onChange={() => onToggle(item.id)} />
            <Text done={item.state === "DONE"}>{item.text}</Text>
            <DeleteButton type="button" onClick={() => onDelete(item.id)} aria-label="Delete action item">
              ✕
            </DeleteButton>
          </Row>
        ))}
      </List>
      <AddRow onSubmit={handleAdd}>
        <TextInput
          placeholder="Add your own action item..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </AddRow>
    </div>
  );
};
