import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { findExistingQuestionnaire } from '@utils';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Step4 = () => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [value, setValue] = useSessionStorage('center-finder', {});
  const { totalSelectedOptions = [], questions = [] } = value;
  const currentStepData = questions?.find((item) => item.sequence === 4);

  useEffect(() => {
    if (questions.length === 0) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder`,
      });
    }
  }, []);

  useEffect(() => {
    if (totalSelectedOptions && !selectedIds?.length) {
      const selectedOption = totalSelectedOptions.find(
        (item) => item?.questionSfid === currentStepData?.questionSfid,
      );
      if (selectedOption?.answer) {
        setSelectedIds([...selectedOption.answer]);
      }
    }
  }, []);

  const handleOptionSelect = (answerId) => {
    const selectedIdsLocal = [...selectedIds, answerId];
    const trimmedAnswerIds = selectedIdsLocal.slice(-2);
    setSelectedIds(trimmedAnswerIds);
    const updatedOptions = findExistingQuestionnaire(
      totalSelectedOptions,
      currentStepData,
      trimmedAnswerIds,
    );
    setValue({
      ...value,
      totalSelectedOptions: updatedOptions,
    });
  };

  const NavigateToStep5 = () => {
    setSelectedIds([]);
    setValue({
      totalSelectedOptions: totalSelectedOptions,
      questions,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/step5`,
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
                  stroke-width="1.5"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M20.4999 12H3.66992"
                  stroke="#31364E"
                  stroke-width="1.5"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
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
              <div className="question-step-highlighter"></div>
            </div>
            <h1
              className="question-title"
              dangerouslySetInnerHTML={{
                __html: currentStepData?.question,
              }}
            ></h1>
            <div className="question-description">
              * You can select up to 2 options
            </div>
            <div className="question-options">
              {currentStepData?.options?.map((answer) => {
                return (
                  <div className="option-item" key={answer.optionId}>
                    <input
                      type="checkbox"
                      id={answer.optionId}
                      name={answer.optionId}
                      checked={selectedIds.includes(answer.optionId)}
                      onChange={(ev) => handleOptionSelect(answer.optionId)}
                    />
                    <label htmlFor={answer.optionId}>{answer.optionText}</label>
                  </div>
                );
              })}
            </div>

            <div className="question-action">
              <button
                disabled={!selectedIds.length}
                onClick={NavigateToStep5}
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

export default Step4;
