import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useQuestionnaireSelection from 'src/hooks/useQuestionnaireSelection';

const Step5 = () => {
  const router = useRouter();
  const [value, setValue] = useSessionStorage('center-finder', {});
  const { questions = [] } = value;
  const {
    updatedOptions,
    selectedIds,
    handleOptionSelect,
    setSelectedIds,
    currentStepData,
  } = useQuestionnaireSelection(value, questions, 5);

  useEffect(() => {
    if (questions.length === 0) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder`,
      });
    }
  }, []);

  const NavigateToStep6 = () => {
    setSelectedIds([]);
    setValue({
      ...value,
      totalSelectedOptions: updatedOptions,
      questions,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/step6`,
    });
  };

  return (
    <main className="course-finder-questionnaire-question">
      <section className="questionnaire-question">
        <div className="container">
          <div className="back-btn-wrap">
            <button className="back-btn" onClick={router.back}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.57 5.93018L3.5 12.0002L9.57 18.0702"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.4999 12H3.66992"
                  stroke="#31364E"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
          </div>
          <div className="question-box">
            <div className="question-step-highlighter-wrap">
              <div className="question-step-highlighter active"></div>
              <div className="question-step-highlighter active"></div>
              <div className="question-step-highlighter active"></div>
              <div className="question-step-highlighter active"></div>
              <div className="question-step-highlighter active"></div>
            </div>
            <h1
              className="question-title"
              dangerouslySetInnerHTML={{
                __html: currentStepData?.question,
              }}
            ></h1>
            <div className="question-options">
              {currentStepData?.options?.map((answer) => {
                return (
                  <div className="option-item" key={answer.optionId}>
                    <input
                      type="checkbox"
                      id={answer.optionId}
                      name={answer.optionId}
                      checked={selectedIds.includes(answer.optionId)}
                      onChange={() => handleOptionSelect(answer.optionId)}
                    />
                    <label htmlFor={answer.optionId}>{answer.optionText}</label>
                  </div>
                );
              })}
            </div>

            <div className="question-action">
              <button
                disabled={!selectedIds.length}
                onClick={NavigateToStep6}
                className="btn-register"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Step5;
