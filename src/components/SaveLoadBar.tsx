import * as React from "react";
import { useRef } from "react";
import styled from "styled-components";
import { FlowState } from "../context/flowTypes";
import { downloadWheelFile, parseWheelFile } from "../utils/wheelFile";
import { Button } from "./ui";

const Bar = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  padding: 12px 24px 0;
`;

const SmallButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  border: 0;
`;

const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SaveIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M8 3v5h8V3" />
    <path d="M8 21v-6h8v6" />
  </svg>
);

const LoadIcon = () => (
  <svg {...iconProps} aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

interface SaveLoadBarProps {
  state: FlowState;
  showImport: boolean;
  onImport: (state: FlowState) => void;
}

export const SaveLoadBar: React.FC<SaveLoadBarProps> = ({ state, showImport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const parsed = parseWheelFile(await file.text());
    if (parsed) onImport(parsed);
  };

  return (
    <Bar>
      {showImport && (
        <>
          <SmallButton title="Load wheel from file" type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <LoadIcon />
          </SmallButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wheel"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
        </>
      )}
      <SmallButton title="Download wheel" type="button" variant="secondary" onClick={() => downloadWheelFile(state)}>
        <SaveIcon />
      </SmallButton>
    </Bar>
  );
};
