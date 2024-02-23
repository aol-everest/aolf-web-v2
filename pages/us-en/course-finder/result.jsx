/* eslint-disable react/no-unescaped-entities */
import Link from '@components/linkWithUTM';
import { pushRouteWithUTMQuery } from '@service';
import { useSessionStorage } from '@uidotdev/usehooks';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

export default function CourseFinderResult() {
  const router = useRouter();
  const [value, setValue] = useSessionStorage('center-finder', {});
  const { recommendationResponse = {}, questions = [], type = '' } = value;

  useEffect(() => {
    if (questions.length === 0) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course-finder`,
      });
    }
  }, []);

  const handleStartOver = () => {
    setValue({});
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/`,
    });
  };

  return (
    <main className="course-finder-questionnaire-question">
      <section className="questionnaire-results">
        <div className="container">
          <div className="back-btn-wrap">
            <button className="back-btn" onClick={handleStartOver}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.3337 9.99984C18.3337 14.5998 14.6003 18.3332 10.0003 18.3332C5.40033 18.3332 2.59199 13.6998 2.59199 13.6998M2.59199 13.6998H6.35866M2.59199 13.6998V17.8665M1.66699 9.99984C1.66699 5.39984 5.36699 1.6665 10.0003 1.6665C15.5587 1.6665 18.3337 6.29984 18.3337 6.29984M18.3337 6.29984V2.13317M18.3337 6.29984H14.6337"
                  stroke="#31364E"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Start Over
            </button>
          </div>
          <div className="question-box">
            <h1 className="section-title">
              Here's your personalized recommendation
            </h1>
            <div className="result-boxes">
              <div className="result-box">
                <div className="first-info">FREE INTRO SERIES</div>
                <div className="box-title">
                  Get started on your journey with a few quick tips & tricks to{' '}
                  {type}
                </div>
                <div className="picture-box">
                  <Link
                    prefetch={false}
                    href={recommendationResponse?.thinkificURL || ''}
                  >
                    <img
                      src={recommendationResponse?.thinkificImageURL}
                      alt="result"
                    />
                    {/* <div className="picture-title">The Art of Meditation</div> */}
                  </Link>
                </div>
              </div>
              <div className="result-box recommendation">
                <div className="first-info">RECOMMENDED COURSE FOR YOU</div>
                <div className="box-title">
                  For lasting transformation
                  <br />
                  {recommendationResponse?.workshopInfo?.title}
                </div>
                <div className="box-desc">
                  Discover SKY Breath Meditation, an evidence-based technique
                  that quickly reduces stress, balances emotions, and restores
                  calm.
                </div>
                <ul className="recommended-course-info">
                  {/* <li>
                    <div className="label">Course</div>
                    <div className="value">
                      3 days with 2.5 hours of live sessions
                    </div>
                  </li> */}
                  <li>
                    <div className="label">Course format:</div>
                    <div className="value">
                      {recommendationResponse?.workshopInfo?.mode}
                    </div>
                  </li>
                </ul>
                <div className="course-payment-options">
                  <a className="payment-option">
                    <span className="first-info">
                      Pay as low as{' '}
                      <img
                        src="/img/logo-affirm.webp"
                        height="22"
                        alt="author"
                      />
                    </span>
                    <span className="price">
                      $27<sub>/month</sub>
                    </span>
                    <span className="desc">for 12 months</span>
                  </a>
                  <a className="payment-option">
                    <span className="first-info">One Payment </span>
                    <span className="price">
                      ${recommendationResponse?.workshopInfo?.unitPrice}
                    </span>
                  </a>
                </div>
                <div className="course-actions">
                  <div className="btn-wrap">
                    <a
                      className="submit-btn"
                      href={recommendationResponse?.redirectURL}
                    >
                      Register now
                    </a>
                    <span className="desc">
                      Select a date & time that suit you
                    </span>
                  </div>
                  <div className="btn-wrap">
                    <a
                      className="submit-btn learn"
                      href={recommendationResponse?.learnMoreURL}
                    >
                      Learn more
                    </a>
                    {/* <button className="submit-btn learn">Learn more</button> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="testimonials">
              <h2 className="section-title">What people are sharing</h2>
              <div className="testimonials-listing">
                <div className="testimonial-box">
                  <div className="testimonial-text">
                    Learning the SKY breathing technique was one of the best
                    things I did for myself. I have anxiety disorder for many
                    years already, and the problem was escalating despite of
                    taking my anti anxiety medication.
                  </div>
                  <div className="testimonial-info">
                    <div className="author">
                      <img
                        src="/img/quest-result-testimony3.webp"
                        alt="author"
                      />
                      <span className="author-name">Cristina</span>
                    </div>
                    <div className="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div className="testimonial-box">
                  <div className="testimonial-text">
                    I cannot say enough good things about our teachers Naveen
                    Sharma and Poonam Verma. Their love of and reverence for SKY
                    and Sahaj is deep. They are so thorough, making sure that we
                    all understood the practice.
                  </div>
                  <div className="testimonial-info">
                    <div className="author">
                      <img
                        src="/img/quest-result-testimony1.webp"
                        alt="author"
                      />
                      <span className="author-name">Vilja</span>
                    </div>
                    <div className="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div className="testimonial-box">
                  <div className="testimonial-text">
                    I feel renewed with life and joy.I am glad I had the
                    repeater option available and used it.It is after repeating
                    the program I realize how good I feel.My money and time were
                    well invested. Filled with wonder and enthusiasm I am
                    embracing life itself.
                  </div>
                  <div className="testimonial-info">
                    <div className="author">
                      <img
                        src="/img/quest-result-testimony2.webp"
                        alt="author"
                      />
                      <span className="author-name">Revathi</span>
                    </div>
                    <div className="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div className="testimonial-box">
                  <div className="testimonial-text">
                    I laughed, I smiled, I worked, I relaxed more deeply than I
                    thought humanly possible. If you are here reading this, then
                    run (don’t walk) to this program, and let the next beautiful
                    chapter of your life begin.
                  </div>
                  <div className="testimonial-info">
                    <div className="author">
                      <img
                        src="/img/quest-result-testimony4.webp"
                        alt="author"
                      />
                      <span className="author-name">Fulpak</span>
                    </div>
                    <div className="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="trustpilot-wrap">
                Read more at{' '}
                <a href="#">
                  <img
                    src="/img/TrustPilot-logo2x.webp"
                    height="33"
                    alt="trustpilot"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
