/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';

const Step5 = () => {
  const router = useRouter();

  const NavigateToStep6 = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/questionnaire/step6`,
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
            <div class="question-step-highlighter-wrap">
              <div class="question-step-highlighter active"></div>
              <div class="question-step-highlighter active"></div>
              <div class="question-step-highlighter active"></div>
              <div class="question-step-highlighter active"></div>
              <div class="question-step-highlighter active"></div>
            </div>
            <h1 class="question-title">When would you like to get started?</h1>
            <div class="question-options">
              <div class="option-item">
                <input type="radio" id="q1" name="quest" />
                <label for="q1">Right now</label>
              </div>
              <div class="option-item">
                <input type="radio" id="q2" name="quest" />
                <label for="q2">Sometimes soon</label>
              </div>
              <div class="option-item">
                <input type="radio" id="q3" name="quest" />
                <label for="q3">Just thinking about it</label>
              </div>
              <div class="option-item">
                <input type="radio" id="q4" name="quest" />
                <label for="q4">Don't know</label>
              </div>
            </div>

            <div className="question-action">
              <button onClick={NavigateToStep6} className="btn-register">
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
