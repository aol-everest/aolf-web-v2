/* eslint-disable react/no-unescaped-entities */
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import React from 'react';

export default function CourseFinderResult() {
  const router = useRouter();

  const handleStartOver = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course-finder/`,
    });
  };
  return (
    <main class="course-finder-questionnaire-question">
      <section class="questionnaire-results">
        <div class="container">
          <div class="back-btn-wrap">
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
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Start Over
            </button>
          </div>
          <div class="question-box">
            <h1 class="section-title">
              Here's your personalized recommendation
            </h1>
            <div class="result-boxes">
              <div class="result-box">
                <div class="first-info">FREE INTRO SERIES</div>
                <div class="box-title">
                  Get started on your journey with a few quick tips & tricks for
                  [XXXXX][XXXX]
                </div>
                <div class="picture-box">
                  <img src="/img/quest-result-box-pic.webp" alt="result" />
                  <div class="picture-title">The Art of Meditation</div>
                </div>
              </div>
              <div class="result-box recommendation">
                <div class="first-info">RECOMMENDED COURSE FOR YOU</div>
                <div class="box-title">
                  For lasting transformation
                  <br />
                  Art of Living Part 1
                </div>
                <div class="box-desc">
                  Discover SKY Breath Meditation, an evidence-based technique
                  that quickly reduces stress, balances emotions, and restores
                  calm.
                </div>
                <ul class="recommended-course-info">
                  <li>
                    <div class="label">Course</div>
                    <div class="value">
                      3 days with 2.5 hours of live sessions
                    </div>
                  </li>
                  <li>
                    <div class="label">Course format:</div>
                    <div class="value">Online / In Person</div>
                  </li>
                </ul>
                <div class="course-payment-options">
                  <a href="#" class="payment-option">
                    <span class="first-info">
                      Pay as low as{' '}
                      <img
                        src="/img/logo-affirm.webp"
                        height="22"
                        alt="author"
                      />
                    </span>
                    <span class="price">
                      $27<sub>/month</sub>
                    </span>
                    <span class="desc">for 12 months</span>
                  </a>
                  <a href="#" class="payment-option selected">
                    <span class="first-info">One Payment </span>
                    <span class="price">$295</span>
                  </a>
                </div>
                <div class="course-actions">
                  <div class="btn-wrap">
                    <button class="submit-btn">Register now</button>
                    <span class="desc">Select a date & time that suit you</span>
                  </div>
                  <div class="btn-wrap">
                    <button class="submit-btn learn">Learn more</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="testimonials">
              <h2 class="section-title">What people are sharing</h2>
              <div class="testimonials-listing">
                <div class="testimonial-box">
                  <div class="testimonial-text">
                    Learning the SKY breathing technique was one of the best
                    things I did for myself. I have anxiety disorder for many
                    years already, and the problem was escalating despite of
                    taking my anti anxiety medication.
                  </div>
                  <div class="testimonial-info">
                    <div class="author">
                      <img
                        src="/img/quest-result-testimony3.webp"
                        alt="author"
                      />
                      <span class="author-name">Cristina</span>
                    </div>
                    <div class="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div class="testimonial-box">
                  <div class="testimonial-text">
                    I cannot say enough good things about our teachers Naveen
                    Sharma and Poonam Verma. Their love of and reverence for SKY
                    and Sahaj is deep. They are so thorough, making sure that we
                    all understood the practice.
                  </div>
                  <div class="testimonial-info">
                    <div class="author">
                      <img
                        src="/img/quest-result-testimony1.webp"
                        alt="author"
                      />
                      <span class="author-name">Vilja</span>
                    </div>
                    <div class="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div class="testimonial-box">
                  <div class="testimonial-text">
                    I feel renewed with life and joy.I am glad I had the
                    repeater option available and used it.It is after repeating
                    the program I realize how good I feel.My money and time were
                    well invested. Filled with wonder and enthusiasm I am
                    embracing life itself.
                  </div>
                  <div class="testimonial-info">
                    <div class="author">
                      <img
                        src="/img/quest-result-testimony2.webp"
                        alt="author"
                      />
                      <span class="author-name">Revathi</span>
                    </div>
                    <div class="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
                <div class="testimonial-box">
                  <div class="testimonial-text">
                    I laughed, I smiled, I worked, I relaxed more deeply than I
                    thought humanly possible. If you are here reading this, then
                    run (don’t walk) to this program, and let the next beautiful
                    chapter of your life begin.
                  </div>
                  <div class="testimonial-info">
                    <div class="author">
                      <img
                        src="/img/quest-result-testimony4.webp"
                        alt="author"
                      />
                      <span class="author-name">Fulpak</span>
                    </div>
                    <div class="rating">
                      <img
                        src="/img/testimonial-rating.webp"
                        alt="rating"
                        height="16"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="trustpilot-wrap">
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
