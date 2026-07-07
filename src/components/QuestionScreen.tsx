import * as React from "react";
import { Title, Subtitle, Button, ButtonRow } from "./ui";

interface QuestionScreenProps {
  title: string;
  subtitle?: string;
  onSubmit: () => void;
  canSubmit?: boolean;
  submitLabel?: string;
  secondaryAction?: { label: string; onClick: () => void };
  children?: React.ReactNode;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  title,
  subtitle,
  onSubmit,
  canSubmit = true,
  submitLabel = "Continue",
  secondaryAction,
  children,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {children}
      <ButtonRow>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
        {secondaryAction && (
          <Button type="button" variant="secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </ButtonRow>
    </form>
  );
};
