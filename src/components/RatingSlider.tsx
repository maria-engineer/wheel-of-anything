import * as React from "react";
import styled from "styled-components";

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Range = styled.input`
  flex: 1;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const Value = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  min-width: 2ch;
  text-align: right;
`;

export const RatingSlider: React.FC<{ value: number; onChange: (value: number) => void }> = ({
  value,
  onChange,
}) => (
  <Row>
    <Range
      type="range"
      min={0}
      max={10}
      step={1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <Value>{value}</Value>
  </Row>
);
