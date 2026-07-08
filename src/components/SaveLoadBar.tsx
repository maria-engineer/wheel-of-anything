import * as React from "react";
import { useRef } from "react";
import styled from "styled-components";
import { FlowState } from "../context/flowTypes";
import { downloadWheelFile, parseWheelFile } from "../utils/wheelFile";
import { Button } from "./ui";

const Bar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  max-width: ${({ theme }) => theme.maxWidth};
  padding: 12px 24px 0;
`;

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
          <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wheel"
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
        </>
      )}
      <Button type="button" variant="secondary" onClick={() => downloadWheelFile(state)}>
        Save
      </Button>
    </Bar>
  );
};
