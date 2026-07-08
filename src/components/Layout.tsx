import * as React from "react";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../styles/theme";
import { GlobalStyle } from "../styles/GlobalStyle";

const Screen = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

const ProgressFill = styled.div<{ fraction: number }>`
  height: 100%;
  width: ${({ fraction }) => Math.round(fraction * 100)}%;
  background: ${({ theme }) => theme.colors.accent};
  transition: width 0.3s ease;
`;

const Content = styled.main`
  flex: 1;
  width: 100%;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Layout: React.FC<{ progress?: number; topBar?: React.ReactNode; children: React.ReactNode }> = ({
  progress,
  topBar,
  children,
}) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <Screen>
      <ProgressTrack>
        <ProgressFill fraction={progress ?? 0} />
      </ProgressTrack>
      {topBar}
      <Content>{children}</Content>
    </Screen>
  </ThemeProvider>
);
