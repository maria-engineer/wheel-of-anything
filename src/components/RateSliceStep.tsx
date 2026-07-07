import * as React from "react";
import { useState } from "react";
import { QuestionScreen } from "./QuestionScreen";
import { RatingSlider } from "./RatingSlider";
import { Field, Label, TextArea } from "./ui";

interface RateSliceStepProps {
  title: string;
  subtitle?: string;
  initialRating: number;
  initialReasoning: string;
  ratingLabel?: string;
  reasoningLabel?: string;
  onSubmit: (rating: number, reasoning: string) => void;
}

export const RateSliceStep: React.FC<RateSliceStepProps> = ({
  title,
  subtitle,
  initialRating,
  initialReasoning,
  ratingLabel = "How would you rate it?",
  reasoningLabel = "Why?",
  onSubmit,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [reasoning, setReasoning] = useState(initialReasoning);

  return (
    <QuestionScreen title={title} subtitle={subtitle} onSubmit={() => onSubmit(rating, reasoning)}>
      <Field>
        <Label>{ratingLabel}</Label>
        <RatingSlider value={rating} onChange={setRating} />
      </Field>
      <Field>
        <Label>{reasoningLabel}</Label>
        <TextArea value={reasoning} onChange={(e) => setReasoning(e.target.value)} autoFocus />
      </Field>
    </QuestionScreen>
  );
};
