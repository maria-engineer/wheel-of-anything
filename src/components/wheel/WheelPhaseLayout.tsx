import styled from "styled-components";

export const ScreenLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const PhaseRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-evenly;
  gap: 24px;
  width: 100%;
`;

export const PanelWrap = styled.div`
  width: 280px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 12px;
  border: 0;
`;

export const PanelHeading = styled.h3`
  margin: 0 0 16px;
`;

export const HintText = styled.p`
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.9rem;
  margin: 8px 0 16px;
`;
