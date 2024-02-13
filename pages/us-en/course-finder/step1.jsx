import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { api, findExistingQuestionnaire } from '@utils';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';

const Step1 = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [value, setValue] = useSessionStorage('center-finder', {});

  const { data: questions, isLoading } = useQuery(
    'getOnBoardingQuestions',
    async () => {
      const response = await api.get({
        path: 'getOnBoardingQuestions',
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: true,
    },
  );
  const currentStepData = questions?.find((item) => item.sequence === 1);

  useEffect(() => {
    if (value?.totalSelectedOptions && !selectedId) {
      const selectedOption = value?.totalSelectedOptions.find(
        (item) => item?.questionSfid === currentStepData?.questionSfid,
      );
      if (selectedOption?.answer) {
        setSelectedId(selectedOption.answer);
      }
    }
  }, [questions]);

  const NavigateToStep2 = () => {
    setValue({
      totalSelectedOptions: value?.totalSelectedOptions || [],
      questions,
    });
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/step2`,
    });
  };

  const handleOptionSelect = (answerId) => {
    setSelectedId(answerId);
    const updatedOptions = findExistingQuestionnaire(
      value?.totalSelectedOptions || [],
      currentStepData,
      answerId,
    );
    setValue({
      ...value,
      totalSelectedOptions: updatedOptions,
    });
  };

  return (
    <>
      {isLoading && <div className="cover-spin"></div>}

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
                <div className="question-step-highlighter"></div>
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
                        onChange={(ev) => handleOptionSelect(answer.optionId)}
                      />
                      <label htmlFor={answer.optionId}>
                        {answer.optionText}
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="question-action">
                <button
                  className="btn-register"
                  onClick={NavigateToStep2}
                  disabled={!selectedId}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Step1;
