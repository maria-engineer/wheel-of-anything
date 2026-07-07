import * as React from "react";
import styled from "styled-components";

const List = styled.ul`
  list-style: none;
  margin: 24px 0;
  padding: 0;
`;

const Row = styled.li<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
  cursor: pointer;
  background: ${({ theme, selected }) => (selected ? theme.colors.surface : "transparent")};
  box-shadow: ${({ selected }) => (selected ? "0 0 0 2px rgba(75, 74, 222, 0.4)" : "none")};
`;

const Dot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const Name = styled.span`
  flex: 1;
  font-weight: 500;
`;

const Delta = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.muted};
`;

interface SliceDeltaListProps {
  sliceNames: string[];
  fromValues: number[];
  toValues: number[];
  selectable?: boolean;
  selected?: number[];
  onToggle?: (index: number) => void;
}

export const SliceDeltaList: React.FC<SliceDeltaListProps> = ({
  sliceNames,
  fromValues,
  toValues,
  selectable = false,
  selected = [],
  onToggle,
}) => {
  return (
    <List>
      {sliceNames.map((name, i) => {
        const from = fromValues[i];
        const to = toValues[i];
        const isSelected = selected.includes(i);
        return (
          <Row
            key={name}
            selected={isSelected}
            onClick={() => selectable && onToggle?.(i)}
            role={selectable ? "checkbox" : undefined}
            aria-checked={selectable ? isSelected : undefined}
          >
            <Dot color={to === from ? "#4B6FFF" : to > from ? "#2ECC71" : "#FF5C5C"} />
            <Name>{name}</Name>
            <Delta>
              {from} &rarr; {to}
            </Delta>
          </Row>
        );
      })}
    </List>
  );
};
