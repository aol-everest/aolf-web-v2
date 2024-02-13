import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { findExistingQuestionnaire } from '@utils';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Step2 = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [value, setValue] = useSessionStorage('center-finder', {});
  const { totalSelectedOptions = [], questions = [] } = value;
  const currentStepData = questions?.find((item) => item.sequence === 2);

  useEffect(() => {
    if (questions.length === 0) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder`,
      });
    }
  }, []);

  const NavigateToStep3 = () => {
    // pushRouteWithUTMQuery(router, {
    //   pathname: `/us-en/course-finder/step3`,
    // });
  };

  useEffect(() => {
    if (totalSelectedOptions && !selectedId) {
      const selectedOption = totalSelectedOptions?.find(
        (item) => item?.questionSfid === currentStepData?.questionSfid,
      );
      if (selectedOption?.answer) {
        setSelectedId(selectedOption.answer);
      }
    }
  }, []);

  const handleOptionSelect = (answerId) => {
    setSelectedId(answerId);
    const updatedOptions = findExistingQuestionnaire(
      totalSelectedOptions,
      currentStepData,
      answerId,
    );

    setValue({
      ...value,
      totalSelectedOptions: updatedOptions,
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
              <div className="question-step-highlighter"></div>
              <div className="question-step-highlighter"></div>
              <div className="question-step-highlighter"></div>
            </div>
            <h1 className="question-title">{currentStepData?.question}</h1>
            <div className="question-options">
              {currentStepData?.options?.map((answer) => {
                return (
                  <div className="option-item" key={answer.optionId}>
                    <input
                      type="checkbox"
                      id={answer.optionId}
                      name={answer.optionId}
                      checked={selectedId === answer.optionId}
                      onChange={() => handleOptionSelect(answer.optionId)}
                    />
                    <label htmlFor={answer.optionId}>{answer.optionText}</label>
                  </div>
                );
              })}
              <div className="questions-info">
                <div className="info-text">
                  Art of Living techniques have been shown in over 100
                  independent studies to calm the mind and improve brain
                  activity, leading to enhanced mental awareness, focus, and
                  concentration.
                </div>
              </div>
            </div>
            <div className="question-action">
              <button onClick={NavigateToStep3} className="btn-register">
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Step2;
