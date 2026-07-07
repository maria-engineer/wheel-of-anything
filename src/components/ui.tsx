import styled from "styled-components";

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0 0 8px;
  line-height: 1.2;
`;

export const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 0 32px;
`;

export const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  appearance: none;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.1s ease;

  background: ${({ theme, variant }) => (variant === "secondary" ? "transparent" : theme.colors.accent)};
  color: ${({ theme, variant }) => (variant === "secondary" ? theme.colors.text : theme.colors.accentText)};
  border: ${({ theme, variant }) => (variant === "secondary" ? `1px solid ${theme.colors.border}` : "none")};

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`;

export const TextInput = styled.input`
  width: 100%;
  font-size: 1.5rem;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  padding: 8px 0;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  font-size: 1.1rem;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px;
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const Field = styled.div`
  margin-bottom: 24px;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 8px;
`;
