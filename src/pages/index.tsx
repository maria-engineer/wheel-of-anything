import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import type { HeadFC, PageProps } from "gatsby";
import { Layout } from "../components/Layout";
import { Subtitle } from "../components/ui";
import { WheelPhaseScreen } from "../components/wheel/WheelPhaseScreen";
import { BranchStep } from "../components/steps/BranchStep";
import { ChoicesSetupStep } from "../components/steps/ChoicesSetupStep";
import { ChoicesCompareStep } from "../components/steps/ChoicesCompareStep";
import { FutureSelectStep } from "../components/steps/FutureSelectStep";
import { FutureFollowupStep } from "../components/steps/FutureFollowupStep";
import { ResultsStep } from "../components/steps/ResultsStep";
import { useWheel } from "../context/WheelContext";
import { Step } from "../context/flowTypes";

const stepProgress = (step: Step): number => {
  const order: Record<Step["kind"], number> = {
    title: 0,
    setupWheel: 1,
    rateNow: 2,
    branch: 3,
    choicesSetup: 4,
    choicesRate: 5,
    choicesCompare: 6,
    futureImprove: 4,
    futureDecrease: 5,
    futureSelect: 6,
    futureFollowup: 7,
    results: 8,
  };
  return order[step.kind] / 8;
};

const stepKey = (step: Step): string => JSON.stringify(step);

const IndexPage: React.FC<PageProps> = () => {
  const { state, dispatch } = useWheel();
  const { appData, step, decreaseQueue, selectedSliceIndices } = state;
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);

  return (
    <Layout progress={stepProgress(step)}>
      <div key={stepKey(step)}>
        {step.kind === "title" && <TitleStep onSubmit={(title) => dispatch({ type: "SET_TITLE", title })} />}

        {step.kind === "setupWheel" && (
          <WheelPhaseScreen
            title={`Name 8 areas of your Wheel of ${appData.title}`}
            subtitle="Click a wedge to name that area."
            mode="name"
            slices={appData.nowWheel.slices}
            onNameChange={(index, name) => dispatch({ type: "SET_SLICE_NAME", index, name })}
            onContinue={() => dispatch({ type: "SUBMIT_SETUP" })}
          />
        )}

        {step.kind === "rateNow" && (
          <WheelPhaseScreen
            title="How is each area going right now?"
            subtitle="Click a wedge, then drag it (or type a number) to rate it 0–10."
            mode="rate"
            slices={appData.nowWheel.slices}
            onRate={(index, rating) => dispatch({ type: "RATE_SLICE", target: { wheel: "now" }, index, rating })}
            onContinue={() => dispatch({ type: "SUBMIT_RATE_NOW" })}
          />
        )}

        {step.kind === "branch" && (
          <BranchStep nowWheel={appData.nowWheel} onChoose={(path) => dispatch({ type: "CHOOSE_PATH", path })} />
        )}

        {step.kind === "choicesSetup" && (
          <ChoicesSetupStep onSubmit={(names) => dispatch({ type: "SET_CHOICES", names })} />
        )}

        {step.kind === "choicesRate" && (
          <WheelPhaseScreen
            title={`"${appData.choices[step.choiceIndex].title}": how would each area look?`}
            subtitle={`Choice ${step.choiceIndex + 1} of ${appData.choices.length}`}
            mode="rate"
            slices={appData.choices[step.choiceIndex].slices}
            baselineValues={nowValues}
            onRate={(index, rating) =>
              dispatch({ type: "RATE_SLICE", target: { wheel: "choice", choiceIndex: step.choiceIndex }, index, rating })
            }
            onContinue={() => dispatch({ type: "SUBMIT_CHOICE_RATE" })}
            continueLabel={step.choiceIndex < appData.choices.length - 1 ? "Next choice" : "Compare choices"}
          />
        )}

        {step.kind === "choicesCompare" && (
          <ChoicesCompareStep appData={appData} onRestart={() => dispatch({ type: "RESET" })} />
        )}

        {step.kind === "futureImprove" && (
          <WheelPhaseScreen
            title="Where do you want each area to be?"
            subtitle="The dark tick on each wedge shows where you are now. Fill in your ideal future."
            mode="rate"
            slices={appData.futureWheel.slices}
            baselineValues={nowValues}
            onRate={(index, rating) => dispatch({ type: "RATE_SLICE", target: { wheel: "future" }, index, rating })}
            onContinue={() => dispatch({ type: "SUBMIT_FUTURE_IMPROVE" })}
          />
        )}

        {step.kind === "futureDecrease" && (
          <WheelPhaseScreen
            title="Where could you accept less?"
            subtitle="These areas didn't change — would you trade some of it away to gain elsewhere?"
            mode="rate"
            slices={appData.futureWheel.slices}
            interactiveIndices={decreaseQueue}
            baselineValues={nowValues}
            onRate={(index, rating) => dispatch({ type: "RATE_SLICE", target: { wheel: "future" }, index, rating })}
            onContinue={() => dispatch({ type: "SUBMIT_FUTURE_DECREASE" })}
          />
        )}

        {step.kind === "futureSelect" && (
          <FutureSelectStep
            appData={appData}
            selected={selectedSliceIndices}
            onToggle={(index) => dispatch({ type: "TOGGLE_SELECTED_SLICE", index })}
            onSubmit={() => dispatch({ type: "SUBMIT_FUTURE_SELECT" })}
          />
        )}

        {step.kind === "futureFollowup" && (
          <FutureFollowupStep
            appData={appData}
            index={selectedSliceIndices[step.queueIndex]}
            onSubmit={(answer) =>
              dispatch({ type: "ANSWER_FOLLOWUP", index: selectedSliceIndices[step.queueIndex], answer })
            }
          />
        )}

        {step.kind === "results" && (
          <ResultsStep
            appData={appData}
            selectedSliceIndices={selectedSliceIndices}
            onToggleActionItem={(id) => dispatch({ type: "TOGGLE_ACTION_ITEM", id })}
            onDeleteActionItem={(id) => dispatch({ type: "DELETE_ACTION_ITEM", id })}
            onAddActionItem={(text) => dispatch({ type: "ADD_ACTION_ITEM", text })}
            onSetActionItems={(items) =>
              dispatch({
                type: "SET_ACTION_ITEMS",
                items: items.map((text, i) => ({ id: i + 1, text, state: "TODO" as const })),
              })
            }
            onRestart={() => dispatch({ type: "RESET" })}
          />
        )}
      </div>
    </Layout>
  );
};

const TitleLine = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 8px;
`;

const InlineInput = styled.input`
  font-size: 2rem;
  font-weight: 600;
  min-width: 180px;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  padding: 0 0 2px;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TitleStep: React.FC<{ onSubmit: (title: string) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const submit = () => title.trim() && onSubmit(title.trim());
  return (
    <form onSubmit={(e) => (e.preventDefault(), submit())}>
      <TitleLine>
        Wheel of
        <InlineInput
          autoFocus
          placeholder="Life, Career, ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </TitleLine>
      <Subtitle>Press Enter to submit</Subtitle>
    </form>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>The Wheel of Anything</title>;
