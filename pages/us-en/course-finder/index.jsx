/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { api, trimAndSplitName } from '@utils';
import { useAnalytics } from 'use-analytics';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Yup from 'yup';
import { Loader } from '@components';
import Script from 'next/script';

const CourseFinder = () => {
  const router = useRouter();
  const { track, page } = useAnalytics();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const { data: introData = [], isLoading } = useQuery({
    queryKey: ['get-started-intro-series'],
    queryFn: async () => {
      const response = await api.get({
        path: 'get-started-intro-series',
      });
      return response?.data;
    },
  });

  useEffect(() => {
    window.iticks = window.iticks || {};
  }, []);

  const handleNextStep = () => {
    if (selectedOption) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder/session/${selectedOption}`,
      });
    }
  };

  const handlePreviousStep = async () => {
    // use next js router to go back
    router.back();
  };

  return (
    <>
      {(isLoading || loading) && <Loader />}

      <main className="course-finder-questionnaire-question checkout-aol">
        <Script
          id="intelliticks-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(I, L, T, i, c, k, s) {
            if(I.iticks) return;
            I.iticks = {host: c, settings: s, clientId: k, cdn: L, queue: []};
            var h = T.head || T.documentElement;
            var e = T.createElement(i);
            var l = I.location;
            e.async = true;
            e.src = (L || c) + '/client/inject-v2.min.js';
            h.insertBefore(e, h.firstChild);
            I.iticks.call = function(a, b) { I.iticks.queue.push([a, b]); };
          })(window, 'https://cdn-v1.intelliticks.com/prod/common', document, 'script', 'https://app.intelliticks.com', 'LZ8KCvfnuX6wbRgga_c', {});
          `,
          }}
        />
        <section className="questionnaire-question">
          <div className="container">
            <div className="back-btn-wrap">
              <button className="back-btn" onClick={handlePreviousStep}>
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
              <h1 className="question-title">How can we help you today?</h1>

              <div className="question-options">
                {introData?.map((item) => {
                  return (
                    <div className="option-item" key={item.slug}>
                      <input
                        type="checkbox"
                        id={item.slug}
                        name={item.slug}
                        checked={selectedOption === item.slug}
                        onChange={(ev) => setSelectedOption(item.slug)}
                      />
                      <label htmlFor={item.slug}>
                        {item?.icon && (
                          <img src={item?.icon} alt={item.title} width={24} />
                        )}
                        {item.title}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="question-action">
                <button
                  className="btn-register"
                  onClick={handleNextStep}
                  disabled={!selectedOption}
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

CourseFinder.hideFooter = true;

export default CourseFinder;
