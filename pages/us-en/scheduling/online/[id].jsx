/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';
import { useQueryState, parseAsString, parseAsJson } from 'nuqs';
import moment from 'moment';
import {
  api,
  findCourseTypeByKey,
  findSlugByProductTypeId,
  tConvert,
} from '@utils';
import React, { useEffect, useRef, useState } from 'react';
import { StripeExpressCheckoutElement } from '@components/checkout/StripeExpressCheckoutElement';
import dayjs from 'dayjs';
import { sortBy } from 'lodash';
import Flatpickr from 'react-flatpickr';
import { ABBRS, COURSE_MODES, COURSE_TYPES, ALERT_TYPES } from '@constants';
import { useAnalytics } from 'use-analytics';
import { useEffectOnce } from 'react-use';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { PageLoading } from '@components';
import { pushRouteWithUTMQuery, replaceRouteWithUTMQuery } from '@service';
import { useGlobalAlertContext } from '@contexts';
import ErrorPage from 'next/error';
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const COURSE_MODES_BOTH = 'both';

const Scheduling = () => {
  const router = useRouter();
  const { id: workshopId } = router.query;
  const { track, page } = useAnalytics();
  const [loading, setLoading] = useState(false);

  const {
    data: workshop,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'workshopDetail',
    queryFn: async () => {
      const response = await api.get({
        path: 'workshopDetail',
        param: {
          id: workshopId,
          rp: 'checkout',
        },
        isUnauthorized: true,
      });
      return response.data;
    },
    enabled: !!workshopId,
  });

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (isLoading || !workshopId) return <PageLoading />;

  const {
    title,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    phone2,
    timings = [],
    email: contactEmail,
    contactName,
    mode,
  } = workshop;

  const continueToCheckout = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling/checkout/${workshop.id}`,
      query: {
        ctype: workshop?.productTypeId,
        fver: 2,
        mode,
      },
    });
  };

  const scrollToCourseHighlight = (e) => {
    if (e) e.preventDefault();
    setTimeout(() => {
      const timeContainer = document.querySelector('.course-highlight-col');
      if (timeContainer) {
        timeContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  return (
    <>
      {(loading || isLoading) && <div className="cover-spin"></div>}
      <main class="in-person-course-page">
        <section class="top-section">
          <div class="container">
            <h1 class="page-title">{title}</h1>
            <div class="page-description">
              <strong>
                Join the 45 million individuals across 180 countries
              </strong>{' '}
              who have experienced the benefits of this distinctive 3-day course
              (2.5 hours per day)
            </div>
            <div class="mt-3 text-center d-lg-none d-md-none">
              <a
                href="#"
                class="course-highlight-action"
                onClick={scrollToCourseHighlight}
              >
                Course Highlights {'>>'}
              </a>
            </div>
          </div>
        </section>
        <section class="scheduling-stepper">
          <div class="container">
            <div class="step-wrapper">
              <div class="step active">
                <div class="step-icon">
                  <span></span>
                </div>
                <div class="step-text">Complete Your Purchase</div>
              </div>
              <div class="step">
                <div class="step-icon">
                  <span></span>
                </div>
                <div class="step-text">Select Course Date & Time</div>
              </div>
              <div class="step">
                <div class="step-icon">
                  <span></span>
                </div>
                <div class="step-text">Start Your Course</div>
              </div>
            </div>
          </div>
        </section>
        <section class="course-purchase-section">
          <div class="container">
            <div class="course-purchase-wrap">
              <div class="first-col">
                <div class="payment-box">
                  <div class="payment-total-box">
                    <label>Total:</label>
                    <div class="amount">
                      $
                      {`${
                        workshop.unitPrice
                          ? workshop.unitPrice.toFixed(2) || '0'.toFixed(2)
                          : workshop.unitPrice
                      }`}
                    </div>
                  </div>
                  <div class="payment-details">
                    <div class="payby">
                      Pay As Low As{' '}
                      <img src="/img/logo-affirm.webp" height="22" />
                    </div>
                    <div class="price-breakup">
                      <div class="price-per-month">
                        ${workshop?.instalmentAmount}/<span>month</span>
                      </div>
                      <div class="payment-tenure">for 12 months</div>
                    </div>
                  </div>
                  <div class="checkout-details">
                    <div class="section__body">
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="miter"
                              strokeLinecap="butt"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M16.223 17.907c2.297 0 4.16-1.863 4.16-4.16s-1.863-4.16-4.16-4.16c-2.298 0-4.16 1.863-4.16 4.16s1.863 4.16 4.16 4.16z"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="miter"
                              strokeLinecap="butt"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M5.049 11.32c2.627-11.547 19.733-11.533 22.347 0.013 1.533 6.773-2.68 12.507-6.373 16.053-2.68 2.587-6.92 2.587-9.613 0-3.68-3.547-7.893-9.293-6.36-16.067z"
                            ></path>
                          </svg>{' '}
                          Location:
                        </div>
                        <div className="value col-7">{mode}</div>
                      </div>
                    </div>
                  </div>
                  {/* <div class="payment-agreements">
                    <div class="form-item">
                      <input type="checkbox" id="agreement1" />
                      <label class="events-news" for="agreement1">
                        I agree to the{' '}
                        <a href="#">
                          Participant agreement including privacy and
                          cancellation policy
                        </a>
                      </label>
                    </div>
                    <div class="form-item">
                      <input type="checkbox" id="agreement2" />
                      <label class="events-news" for="agreement2">
                        I represent that I am in good physical and mental
                        condition, and fit to participate in this course. I
                        particularly acknowledge that, if I am diagnosed with
                        any mental and/or physical conditions (including complex
                        PTSD, schizophrenia; schizoaffective, bipolar, or
                        seizure disorders; pregnancy; or recent surgery), I will
                        consult with my medical provider prior to participating
                        in the course.
                      </label>
                    </div>
                  </div> */}
                  <div class="payment-actions">
                    {/* <button class="submit-btn gpay">
                      Buy with{' '}
                      <img
                        src="/img/Gpay-Payment-icon.webp"
                        alt="gpay"
                        height="24"
                      />
                    </button> */}
                    <button class="submit-btn" onClick={continueToCheckout}>
                      Checkout
                    </button>
                  </div>
                </div>
                <div class="other-calendar-info">
                  <span class="icon-aol iconaol-clock-bold"></span>Flexible
                  Rescheduling for All Courses
                </div>
                <div class="question-call">
                  <a href="tel:(855)2024400" class="call-cta">
                    Still have questions?{' '}
                    <strong>Call us at (855) 202-4400</strong>
                  </a>
                </div>
              </div>
              <div class="second-col course-highlight-col">
                <div class="course-highlight-box">
                  <div class="box-hero-image-wrap">
                    <img
                      src="/img/course-highlight-box-hero.png"
                      alt="course highlight"
                      width="100%"
                    />
                  </div>
                  <div class="course-highlights-info-box">
                    <h2>Course Highlights:</h2>
                    <ul>
                      <li>
                        <span class="icon-aol iconaol-users"></span>
                        <span>
                          Engage in a <strong>3-day, 2.5-hour</strong> daily
                          course led by a certified instructor in a small group
                        </span>
                      </li>
                      <li>
                        <span class="icon-aol iconaol-world-clock"></span>
                        <span>
                          Available multiple times daily across PT, ET, CT time
                          zones
                        </span>
                      </li>
                      <li>
                        <span class="icon-aol iconaol-yoga"></span>
                        <span>
                          Master <strong>Sudarshan Kriya Yoga (SKY)</strong> and
                          other effective pranayama breathing methods.
                        </span>
                      </li>
                      <li>
                        <span class="icon-aol iconaol-relieved"></span>
                        <span>
                          Receive the "<strong>5 Keys to a Joyful Life</strong>"
                          toolkit, providing essential strategies for lifelong
                          happiness and well-being.
                        </span>
                      </li>
                      <li>
                        <span class="icon-aol iconaol-calendar-2"></span>
                        <span>
                          <strong>Flexible</strong> rescheduling options.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="course-medical-info">
                  <img
                    src="/img/mental_health-vector-icon.svg"
                    width="54"
                    height="54"
                    alt="mental health"
                  />
                  <span>
                    Over <strong>40 years</strong> of research and more than{' '}
                    <strong>100 independent studies</strong> at top institutions
                    like Harvard and Stanford demonstrate that SKY significantly
                    improves sleep quality, reduces stress and anxiety, boosts
                    immunity, and increases focus and energy.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="testimonials">
          <div class="container">
            <div class="top-text">TESTIMONIALS</div>
            <h2 class="section-title">What people are sharing</h2>
            <div class="testimonials-listing">
              <div class="testimonial-item">
                <div class="author-picutre">
                  <img
                    src="/img/testimony-adinah.webp"
                    alt="Adinah"
                    height="70"
                    width="70"
                  />
                </div>
                <div class="testimony-text">
                  “Wow. It made a significant impression on me, was very very
                  enjoyable, at times profound, and I plan to keep practicing.”
                </div>
                <div class="author-name">Adinah</div>
              </div>
              <div class="testimonial-item">
                <div class="author-picutre">
                  <img
                    src="/img/testimony-joanna.webp"
                    alt="Joanna"
                    height="70"
                    width="70"
                  />
                </div>
                <div class="testimony-text">
                  “It was awesome! I regained my mental health. And I also feel
                  so much lighter and happier. I got out of my funk that was
                  getting me unmotivated.”
                </div>
                <div class="author-name">Joanna</div>
              </div>
              <div class="testimonial-item">
                <div class="author-picutre">
                  <img
                    src="/img/testimony-vijitha.webp"
                    alt="Vijitha"
                    height="70"
                    width="70"
                  />
                </div>
                <div class="testimony-text">
                  “It was liberating. Any time my mind is wiggling between the
                  past and the future, I notice it and have found a hack to
                  bring myself back to the present.”
                </div>
                <div class="author-name">Vijitha</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
Scheduling.hideFooter = true;
export default Scheduling;
