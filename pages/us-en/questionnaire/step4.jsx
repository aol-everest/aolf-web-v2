/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';

const Step4 = () => {
  const router = useRouter();

  const NavigateToStep5 = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/questionnaire/step5`,
    });
  };

  return (
    <main className="course-finder-questionnaire-question">
      <section className="questionnaire-question">
        <div className="container">
          <div className="back-btn-wrap">
            <button className="back-btn" onClick={() => router.back()}>
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
            <h1 className="question-title">I'm interested in...</h1>
            <div className="question-description">
              * You can select up to 2 options
            </div>
            <div className="question-options">
              <div className="option-item">
                <input type="checkbox" id="q1" name="q1" />
                <label for="q1">Breathwork</label>
              </div>
              <div className="option-item">
                <input type="checkbox" id="q2" name="q2" />
                <label for="q2">Meditation</label>
              </div>
              <div className="option-item">
                <input type="checkbox" id="q3" name="q3" />
                <label for="q3">Silent Retreat</label>
              </div>
              <div className="option-item">
                <input type="checkbox" id="q4" name="q4" />
                <label for="q4">Wisdom for daily life</label>
              </div>
            </div>

            <div className="question-action">
              <button onClick={NavigateToStep5} className="btn-register">
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
