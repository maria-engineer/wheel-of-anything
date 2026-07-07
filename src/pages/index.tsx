import * as React from "react";
import { useState } from "react";
import type { HeadFC, PageProps } from "gatsby";
import { Layout } from "../components/Layout";
import { QuestionScreen } from "../components/QuestionScreen";
import { RateSliceStep } from "../components/RateSliceStep";
import { Field, TextInput } from "../components/ui";
import { BranchStep } from "../components/steps/BranchStep";
import { ChoicesSetupStep } from "../components/steps/ChoicesSetupStep";
import { ChoicesCompareStep } from "../components/steps/ChoicesCompareStep";
import { FutureSelectStep } from "../components/steps/FutureSelectStep";
import { ResultsStep } from "../components/steps/ResultsStep";
import { useWheel } from "../context/WheelContext";
import { SLICE_COUNT } from "../types";
import { Step } from "../context/flowTypes";

const stepProgress = (step: Step): number => {
  const order: Record<Step["kind"], number> = {
    title: 0,
    setupSlices: 1,
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

  return (
    <Layout progress={stepProgress(step)}>
      <div key={stepKey(step)}>
        {step.kind === "title" && <TitleStep onSubmit={(title) => dispatch({ type: "SET_TITLE", title })} />}

        {step.kind === "setupSlices" && (
          <SetupSliceStep
            index={step.index}
            wheelTitle={appData.title}
            onSubmit={(name) => dispatch({ type: "SET_SLICE_NAME", index: step.index, name })}
          />
        )}

        {step.kind === "rateNow" && (
          <RateSliceStep
            title={`How is "${appData.nowWheel.slices[step.index].name}" going right now?`}
            subtitle={`Area ${step.index + 1} of ${SLICE_COUNT}`}
            initialRating={appData.nowWheel.slices[step.index].rating}
            initialReasoning={appData.nowWheel.slices[step.index].reasoning}
            onSubmit={(rating, reasoning) => dispatch({ type: "RATE_NOW", index: step.index, rating, reasoning })}
          />
        )}

        {step.kind === "branch" && <BranchStep onChoose={(path) => dispatch({ type: "CHOOSE_PATH", path })} />}

        {step.kind === "choicesSetup" && (
          <ChoicesSetupStep onSubmit={(names) => dispatch({ type: "SET_CHOICES", names })} />
        )}

        {step.kind === "choicesRate" && (
          <RateSliceStep
            title={`"${appData.choices[step.choiceIndex].title}": how would "${
              appData.choices[step.choiceIndex].slices[step.sliceIndex].name
            }" look?`}
            subtitle={`Choice ${step.choiceIndex + 1} of ${appData.choices.length} — Area ${step.sliceIndex + 1} of ${SLICE_COUNT}`}
            initialRating={appData.choices[step.choiceIndex].slices[step.sliceIndex].rating}
            initialReasoning={appData.choices[step.choiceIndex].slices[step.sliceIndex].reasoning}
            onSubmit={(rating, reasoning) =>
              dispatch({
                type: "RATE_CHOICE_SLICE",
                choiceIndex: step.choiceIndex,
                sliceIndex: step.sliceIndex,
                rating,
                reasoning,
              })
            }
          />
        )}

        {step.kind === "choicesCompare" && (
          <ChoicesCompareStep appData={appData} onRestart={() => dispatch({ type: "RESET" })} />
        )}

        {step.kind === "futureImprove" && (
          <RateSliceStep
            title={`Where do you want "${appData.futureWheel.slices[step.index].name}" to be?`}
            subtitle={`Area ${step.index + 1} of ${SLICE_COUNT} — imagining the future`}
            ratingLabel="What rating would you like it to reach?"
            reasoningLabel="What would that look like?"
            initialRating={
              appData.futureWheel.slices[step.index].reasoning
                ? appData.futureWheel.slices[step.index].rating
                : appData.nowWheel.slices[step.index].rating
            }
            initialReasoning={appData.futureWheel.slices[step.index].reasoning}
            onSubmit={(rating, reasoning) =>
              dispatch({ type: "RATE_FUTURE_IMPROVE", index: step.index, rating, reasoning })
            }
          />
        )}

        {step.kind === "futureDecrease" && (
          <RateSliceStep
            title={`Could you accept "${appData.futureWheel.slices[decreaseQueue[step.queueIndex]].name}" being lower?`}
            subtitle="This area didn't change — would you trade some of it away to gain elsewhere?"
            ratingLabel="What's the lowest you'd accept?"
            reasoningLabel="Why would that be okay?"
            initialRating={appData.futureWheel.slices[decreaseQueue[step.queueIndex]].rating}
            initialReasoning={appData.futureWheel.slices[decreaseQueue[step.queueIndex]].reasoning}
            onSubmit={(rating, reasoning) =>
              dispatch({ type: "RATE_FUTURE_DECREASE", index: decreaseQueue[step.queueIndex], rating, reasoning })
            }
          />
        )}

        {step.kind === "futureSelect" && (
          <FutureSelectStep
            appData={appData}
            onSubmit={(indices) => dispatch({ type: "SET_SELECTED_SLICES", indices })}
          />
        )}

        {step.kind === "futureFollowup" && (
          <FollowupStep
            sliceName={appData.futureWheel.slices[selectedSliceIndices[step.queueIndex]].name}
            nowRating={appData.nowWheel.slices[selectedSliceIndices[step.queueIndex]].rating}
            futureRating={appData.futureWheel.slices[selectedSliceIndices[step.queueIndex]].rating}
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

const TitleStep: React.FC<{ onSubmit: (title: string) => void }> = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  return (
    <QuestionScreen
      title="Welcome to the Wheel of Anything"
      subtitle="It helps you make decisions and turns them into concrete actions. What do you want to explore? (e.g. Life, Career)"
      onSubmit={() => onSubmit(title.trim())}
      canSubmit={title.trim().length > 0}
      submitLabel="Get started"
    >
      <Field>
        <TextInput autoFocus placeholder="Life, Career, ..." value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
    </QuestionScreen>
  );
};

const SetupSliceStep: React.FC<{ index: number; wheelTitle: string; onSubmit: (name: string) => void }> = ({
  index,
  wheelTitle,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  return (
    <QuestionScreen
      title={`Area ${index + 1} of ${SLICE_COUNT}`}
      subtitle={`Name one part of your Wheel of ${wheelTitle}.`}
      onSubmit={() => onSubmit(name.trim())}
      canSubmit={name.trim().length > 0}
    >
      <Field>
        <TextInput autoFocus placeholder="e.g. Health" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
    </QuestionScreen>
  );
};

const FollowupStep: React.FC<{
  sliceName: string;
  nowRating: number;
  futureRating: number;
  onSubmit: (answer: string) => void;
}> = ({ sliceName, nowRating, futureRating, onSubmit }) => {
  const [answer, setAnswer] = useState("");
  return (
    <QuestionScreen
      title={`Let's dig into "${sliceName}"`}
      subtitle={`You want to move this from ${nowRating} to ${futureRating}. What would it take?`}
      onSubmit={() => onSubmit(answer.trim())}
      canSubmit={answer.trim().length > 0}
    >
      <Field>
        <TextInput autoFocus placeholder="What's one thing that would help?" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </Field>
    </QuestionScreen>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>The Wheel of Anything</title>;
