/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';

const Step1 = () => {
  const router = useRouter();

  const NavigateToStep1 = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/questionnaire/step1`,
    });
  };

  return (
    <main className="course-finder-questionnaire-welcome">
      <section className="questionnaire-welcome">
        <div className="container">
          <div className="welcome-box">
            <div className="info-area">
              <div className="logo-wrap">
                <img
                  src="/img/ic-logo.svg"
                  alt="logo"
                  className="logo__image"
                />
              </div>
              <h1 className="title">
                Welcome to the Art of Living experience!
              </h1>
              <div className="description">
                <p>We're here to help you find the right course to suit you.</p>
                <p>
                  Millions of lives have been transformed through our courses.
                </p>
                <p>
                  Simply answer a few questions to receive a personalized
                  recommendation. Plus, you'll gain free access to a video
                  series tailored to your journey.
                </p>
              </div>
              <div className="actions">
                <button onClick={NavigateToStep1} className="btn-register">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Step1;
