import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import type { HeadFC, PageProps } from "gatsby";
import { Layout } from "../components/Layout";
import { SaveLoadBar } from "../components/SaveLoadBar";
import { Subtitle } from "../components/ui";
import { WheelNameScreen } from "../components/wheel/WheelNameScreen";
import { WheelRateScreen } from "../components/wheel/WheelRateScreen";
import { BranchStep } from "../components/steps/BranchStep";
import { ChoicesSetupStep } from "../components/steps/ChoicesSetupStep";
import { ChoicesCompareStep } from "../components/steps/ChoicesCompareStep";
import { FutureSelectStep } from "../components/steps/FutureSelectStep";
import { FutureFollowupStep } from "../components/steps/FutureFollowupStep";
import { ResultsStep } from "../components/steps/ResultsStep";
import { useWheel } from "../context/WheelContext";
import { Step } from "../context/flowTypes";
import { deltaColor } from "../components/wheel/deltaColor";

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
  const { appData, decreaseQueue, selectedSliceIndices } = state;
  const step = appData.stage;
  const nowValues = appData.nowWheel.slices.map((s) => s.rating);

  return (
    <Layout
      progress={stepProgress(step)}
      topBar={
        <SaveLoadBar
          state={state}
          showImport={step.kind === "title"}
          onImport={(imported) =>
            dispatch({ type: "RESTORE", state: imported })
          }
        />
      }
    >
      <div key={stepKey(step)}>
        {step.kind === "title" && (
          <TitleStep
            onSubmit={(title) => dispatch({ type: "SET_TITLE", title })}
          />
        )}

        {step.kind === "setupWheel" && (
          <WheelNameScreen
            title={`Name 8 areas of your Wheel of ${appData.title}`}
            subtitle="Click a wedge to name that area."
            slices={appData.nowWheel.slices}
            onNameChange={(index, name) =>
              dispatch({ type: "SET_SLICE_NAME", index, name })
            }
            onContinue={() => dispatch({ type: "SUBMIT_SETUP" })}
          />
        )}

        {step.kind === "rateNow" && (
          <WheelRateScreen
            title="How is each area going right now?"
            subtitle="Click on an area to rate it according to how you feel it's going right now."
            slices={appData.nowWheel.slices}
            mustRateAll={true}
            onRate={(index, rating) =>
              dispatch({
                type: "RATE_SLICE",
                target: { wheel: "now" },
                index,
                rating,
              })
            }
            onContinue={() => dispatch({ type: "SUBMIT_RATE_NOW" })}
          />
        )}

        {step.kind === "branch" && (
          <BranchStep
            nowWheel={appData.nowWheel}
            onChoose={(path) => dispatch({ type: "CHOOSE_PATH", path })}
          />
        )}

        {step.kind === "choicesSetup" && (
          <ChoicesSetupStep
            onSubmit={(names) => dispatch({ type: "SET_CHOICES", names })}
          />
        )}

        {step.kind === "choicesRate" && (
          <WheelRateScreen
            title={`"${appData.choices[step.choiceIndex].title}": how would each area look?`}
            subtitle={`Choice ${step.choiceIndex + 1} of ${appData.choices.length}`}
            slices={appData.choices[step.choiceIndex].slices}
            baselineValues={nowValues}
            mustRateAll={true}
            onRate={(index, rating) =>
              dispatch({
                type: "RATE_SLICE",
                target: { wheel: "choice", choiceIndex: step.choiceIndex },
                index,
                rating,
              })
            }
            colorForIndex={(i, slice) => deltaColor(nowValues[i], slice.rating)}
            onContinue={() => dispatch({ type: "SUBMIT_CHOICE_RATE" })}
            continueLabel={
              step.choiceIndex < appData.choices.length - 1
                ? "Next choice"
                : "Compare choices"
            }
          />
        )}

        {step.kind === "choicesCompare" && (
          <ChoicesCompareStep
            appData={appData}
            onRestart={() => dispatch({ type: "RESET" })}
          />
        )}

        {step.kind === "futureImprove" && (
          <WheelRateScreen
            title="Which areas do you want to improve, and by how much?"
            subtitle="Rate each area based on how you want or need it to improve in the future."
            slices={appData.futureWheel.slices}
            baselineValues={nowValues}
            mustRateAll={false}
            onRate={(index, rating) =>
              dispatch({
                type: "RATE_SLICE",
                target: { wheel: "future" },
                index,
                rating,
              })
            }
            onContinue={() => dispatch({ type: "SUBMIT_FUTURE_IMPROVE" })}
          />
        )}

        {step.kind === "futureDecrease" && (
          <WheelRateScreen
            title="Where could you accept less?"
            subtitle="You didn't move these areas in the last step. While we may not always want to decrease how an area is doing at times, we may be willing to allow an area to decrease, if it gives us the space to grow in other areas. Think about the areas that you haven't increased in the previous step and where you'd be willing to make some room."
            slices={appData.futureWheel.slices}
            interactiveIndices={decreaseQueue}
            baselineValues={nowValues}
            mustRateAll={false}
            onRate={(index, rating) =>
              dispatch({
                type: "RATE_SLICE",
                target: { wheel: "future" },
                index,
                rating,
              })
            }
            onContinue={() => dispatch({ type: "SUBMIT_FUTURE_DECREASE" })}
          />
        )}

        {step.kind === "futureSelect" && (
          <FutureSelectStep
            appData={appData}
            selected={selectedSliceIndices}
            onToggle={(index) =>
              dispatch({ type: "TOGGLE_SELECTED_SLICE", index })
            }
            onSubmit={() => dispatch({ type: "SUBMIT_FUTURE_SELECT" })}
          />
        )}

        {step.kind === "futureFollowup" && (
          <FutureFollowupStep
            appData={appData}
            index={selectedSliceIndices[step.queueIndex]}
            onSubmit={(answer) =>
              dispatch({
                type: "ANSWER_FOLLOWUP",
                index: selectedSliceIndices[step.queueIndex],
                answer,
              })
            }
          />
        )}

        {step.kind === "results" && (
          <ResultsStep
            appData={appData}
            selectedSliceIndices={selectedSliceIndices}
            onToggleActionItem={(id) =>
              dispatch({ type: "TOGGLE_ACTION_ITEM", id })
            }
            onDeleteActionItem={(id) =>
              dispatch({ type: "DELETE_ACTION_ITEM", id })
            }
            onAddActionItem={(text) =>
              dispatch({ type: "ADD_ACTION_ITEM", text })
            }
            onSetActionItems={(items) =>
              dispatch({
                type: "SET_ACTION_ITEMS",
                items: items.map((text, i) => ({
                  id: i + 1,
                  text,
                  state: "TODO" as const,
                })),
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

const TitleStep: React.FC<{ onSubmit: (title: string) => void }> = ({
  onSubmit,
}) => {
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
