/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { useContext } from 'react';
import {
  MODAL_TYPES,
  COURSE_MODES,
  COURSE_TYPES,
  WORKSHOP_MODE,
} from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { Accordion, Card, AccordionContext } from 'react-bootstrap';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import classNames from 'classnames';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { PriceCard } from './PriceCard';
import queryString from 'query-string';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import { FaArrowRightLong } from 'react-icons/fa6';
import { navigateToLogin, priceCalculation } from '@utils';

const settings = {
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: false,
  arrows: false,
  dots: true,
  speed: 300,
  centerPadding: '0px',
  infinite: true,
  autoplaySpeed: 5000,
  autoplay: true,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 1,
      },
    },
  ],
};

export const SKYBreathMeditation = ({
  data,
  mode: courseViewMode,
  handleRegister,
}) => {
  const { sfid, title } = data || {};
  const { delfee } = priceCalculation({ workshop: data });

  return (
    <>
      <main class="aol-part-one">
        <section class="top-column sky-breath">
          <div class="container first-section">
            <div class="banner-title">
              Breathe Out Stress
              <br />
              <span>from Day One</span>
            </div>
            <div class="banner-desc">with Evidence-Based Breathwork</div>
            <ul>
              <li>
                <img
                  src="/img/aol-orange-tick.png"
                  alt="Tick"
                  height="32"
                  width="32"
                />
                Reduce stress, anxiety, and depression
              </li>
              <li>
                <img
                  src="/img/aol-orange-tick.png"
                  alt="Tick"
                  height="32"
                  width="32"
                />
                Increase your energy levels
              </li>
              <li>
                <img
                  src="/img/aol-orange-tick.png"
                  alt="Tick"
                  height="32"
                  width="32"
                />
                Improve your sleep
              </li>
            </ul>
          </div>

          {sfid && (
            <PriceCard
              workshop={data}
              courseViewMode={courseViewMode}
              handleRegister={handleRegister(
                COURSE_TYPES.SKY_BREATH_MEDITATION.code,
              )}
              showPriceHeading={false}
            />
          )}
        </section>

        <section class="progress-section">
          <div class="container">
            <div class="row">
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="progress_box">
                  <div class="progress_logo">
                    <img
                      src="/img/transforming-lives.svg"
                      alt="transforming lives"
                    />
                  </div>
                  <div class="progress_content">
                    <span class="title">
                      <strong>43</strong> Years
                    </span>
                    <br />
                    <span class="content">of transforming lives</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="progress_box">
                  <div class="progress_logo">
                    <img src="/img/worldwide.svg" alt="transforming lives" />
                  </div>
                  <div class="progress_content">
                    <span class="title">
                      <strong>10,000+</strong> Centers
                    </span>
                    <br />
                    <span class="content">worldwide</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="progress_box">
                  <div class="progress_logo">
                    <img src="/img/countries.svg" alt="transforming lives" />
                  </div>
                  <div class="progress_content">
                    <span class="title">
                      <strong>182</strong> Countries
                    </span>
                    <br />
                    <span class="content">
                      where our programs made a difference
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="progress_box">
                  <div class="progress_logo">
                    <img src="/img/people.svg" alt="transforming lives" />
                  </div>
                  <div class="progress_content">
                    <span class="title">
                      <strong>800M+</strong> Lives
                    </span>
                    <br />
                    <span class="content">
                      touched through our courses & events
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="breadth-meditation">
          <div class="container">
            <div class="row">
              <div class="breadth-meditation__block">
                <h2 class="breadth-meditation__title section-title text-center">
                  What is the Art of Living Part 1 Course?
                </h2>
                <div class="col-12 col-lg-5 float-left">
                  <div class="comments__video">
                    <iframe
                      src="https://player.vimeo.com/video/854478087"
                      width="100%"
                      height="100%"
                      frameborder="0"
                      allow="autoplay; fullscreen"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
                <div class="col-12 col-lg-7 float-left">
                  <div class="breadth-meditation_content">
                    <p class="">
                      The Art of Living-Part 1 Course teaches Sudarshan
                      Kriya™—a powerful rhythmic breathing technique that
                      harmonizes the body-mind complex. Participants notice
                      reduced stress and anxiety, better sleep, a stronger
                      immune system, and increased energy levels.
                    </p>
                    <button class="register-button">
                      Register Now <FaArrowRightLong className="fa-solid" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="row">
              <div class="col-12 px-2 col-lg-12 text-center text-lg-center mb-4">
                <img src="/img/smallLine.svg" class="separator" />
                <h2 class="breadth-meditation__title section-title benefits-title text-center">
                  Impacts of Sudarshan Kriya™
                </h2>
                <p class="section-desc text-center">
                  Science-backed benefits of Sudarshan Kriya™, shown in over
                  100 independent studies
                </p>
              </div>
              <div class="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div class="breadth-meditation_box">
                  <div class="breadth-meditation_logo">
                    <img src="/img/icon1.svg" alt="transforming lives" />
                  </div>
                  <div class="breadth-meditation_content">
                    <span class="title stats-1">
                      +33%
                      <br />
                      Immune Cell Count
                    </span>
                    <br />
                    <span class="content stats-desc">
                      Increase in lymphocytes in 6 weeks & remained in the
                      normal range
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div class="breadth-meditation_box">
                  <div class="breadth-meditation_logo">
                    <img src="/img/icon2.svg" alt="transforming lives" />
                  </div>
                  <div class="breadth-meditation_content">
                    <span class="title stats-2">
                      21%
                      <br />
                      Life Satisfaction
                    </span>
                    <br />
                    <span class="content stats-desc">
                      Increase within 1 week
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div class="breadth-meditation_box">
                  <div class="breadth-meditation_logo">
                    <img src="/img/icon3.svg" alt="transforming lives" />
                  </div>
                  <div class="breadth-meditation_content">
                    <span class="title stats-3">
                      -57%
                      <br />
                      Stress Hormone
                    </span>
                    <br />
                    <span class="content stats-desc">
                      Decrease in serum cortisol in 2 weeks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="key-highlight-section">
          <div class="container">
            <div class="key-highlight_block">
              <h2 class="key-highlight_title section-title text-center">
                Key Highlights of the 3 Day Art of Living-Part 1 Course
              </h2>
            </div>
            <div class="highlights-slider">
              <Slider {...settings}>
                <div className="slide">
                  <div className="key-highlight-box">
                    <div className="key-highlight-logo">
                      <img
                        src="/img/key-11.webp"
                        alt="transforming lives"
                        width="350"
                        height="233"
                      />
                    </div>
                    <div className="key-highlight-content">
                      <span className="title">Pranayama</span>
                      <br />
                      <span className="content">
                        Breathing exercise to improve your energy levels and
                        reduce stress
                      </span>
                    </div>
                  </div>
                </div>
                <div className="slide">
                  <div className="key-highlight-box">
                    <div className="key-highlight-logo">
                      <img
                        src="/img/key-2.webp"
                        alt="transforming lives"
                        width="350"
                        height="233"
                      />
                    </div>
                    <div className="key-highlight-content">
                      <span className="title">Sudarshan Kriya™</span>
                      <br />
                      <span className="content">
                        Learn the most powerful breathing technique based on an
                        ancient tradition
                      </span>
                    </div>
                  </div>
                </div>
                <div className="slide">
                  <div className="key-highlight-box">
                    <div className="key-highlight-logo">
                      <img
                        src="/img/key-3.webp"
                        alt="transforming lives"
                        width="350"
                        height="233"
                      />
                    </div>
                    <div className="key-highlight-content">
                      <span className="title">5 Keys to a Joyful Life</span>
                      <br />
                      <span className="content">
                        Simple toolkit to help you navigate life joyfully
                      </span>
                    </div>
                  </div>
                </div>
                <div className="slide">
                  <div className="key-highlight-box">
                    <div className="key-highlight-logo">
                      <img
                        src="/img/key-4.webp"
                        alt="transforming lives"
                        width="350"
                        height="233"
                      />
                    </div>
                    <div className="key-highlight-content">
                      <span className="title">Lifetime Access</span>
                      <br />
                      <span className="content">
                        Join weekly for in-person or online group SKY practice
                      </span>
                    </div>
                  </div>
                </div>
              </Slider>
            </div>
          </div>
        </section>

        <section class="quote-section">
          <div class="container">
            <div class="col-12 main-area">
              <p class="quote-section__quote">
                <span>
                  “Meditation is the journey from sound to silence, from
                  movement to stillness, from a limited identity to unlimited
                  space”
                </span>
              </p>
              <p class="quote-section__text">
                <img src="/img/Guruji-2.png" />
                <br />~ Gurudev Sri Sri Ravi Shankar
              </p>
            </div>
          </div>
        </section>

        <section class="feature-section">
          <div class="container">
            <div class="feature_block">
              <h2 class="feature_title section-title text-center">
                Featured in
              </h2>
            </div>
            <div class="row">
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="feature_box pinkbox">
                  <div class="feature_logo">
                    <img src="/img/CNN.webp" alt="transforming lives" />
                  </div>
                  <div class="feature-content">
                    <span class="content">"Life Changing"</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="feature_box greybox">
                  <div class="feature_logo">
                    <img src="/img/Yoga.webp" alt="transforming lives" />
                  </div>
                  <div class="feature-content">
                    <span class="content">
                      "May be the fastest growing spiritual practice on the
                      planet"
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="feature_box pinkbox">
                  <div class="feature_logo">
                    <img src="/img/Harvard.webp" alt="transforming lives" />
                  </div>
                  <div class="feature-content">
                    <span class="content">
                      "Show promise in providing relief for depression"
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="feature_box greybox">
                  <div class="feature_logo">
                    <img src="/img/WP.webp" alt="transforming lives" />
                  </div>
                  <div class="feature-content">
                    <span class="content">"Like Fresh air to millions"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="comments">
          <div class="container">
            <h2 class="comments__title section-title text-center">
              How is Art of Living
              <br />
              Changing Lives?
            </h2>
          </div>
          <div class="comments__video">
            <iframe
              src="https://player.vimeo.com/video/428103610"
              width="100%"
              height="100%"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </section>

        <section class="faq">
          <div class="container">
            <h2 class="section-title pl-0 pr-0">
              Frequently Asked Questions
              <img src="/img/FAQ.svg" />
            </h2>
            <Accordion defaultActiveKey="0" className="accordion">
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="0">
                    What is the duration of the {title} course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    You can learn the Sudarshan Kriya™ practice taught in the{' '}
                    {title} Course in 3 days with 2.5-3 hours of live online or
                    in-person sessions each day with a certified instructor.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="1">
                    What are the benefits of Sudarshan Kriya™?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    Sudarshan Kriya™ taught in the {title} course has been
                    researched in over{' '}
                    <a href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                      100 independent studies
                    </a>{' '}
                    and shown significant mind and body benefits. It lowers
                    stress levels, improves mental clarity, enhances emotional
                    well-being, contributes to better sleep, raises energy
                    levels, and provides a greater sense of inner peace. The
                    physical benefits include boosting immunity, heart health,
                    and more.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="2">
                    Can I reschedule my {title} Course after my initial
                    registration?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                  <Card.Body>
                    Yes, you can reschedule to a different {title} Course if you
                    are unable to attend the original dates selected.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="3">
                    Is there an age limit to attend the {title} Course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="3">
                  <Card.Body>
                    Yes, you must be at least 18 years old to attend. The Art of
                    Living offers alternative programs for{' '}
                    <a href="http://skyforkids.org">kids and teens</a> (18 years
                    and under). Contact us at{' '}
                    <a href="mailto:youthprograms@iahv.org">
                      youthprograms@iahv.org
                    </a>{' '}
                    to learn more.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="4">
                    What’s the cost of the {title} course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="4">
                  <Card.Body>
                    <p>
                      The {title} course is available in two formats: a 3-day
                      course for ${delfee}
                      <br />
                      <br />
                    </p>
                    <p class="mb-2">What’s included:</p>
                    <ul>
                      <li>-3 hours daily live sessions</li>
                      <li>certified expert instruction</li>
                      <li>guided techniques with Q&A</li>
                      <li>real-time support</li>
                      <li>interactive wisdom sessions</li>
                      <li>small group size</li>
                    </ul>
                    <p>
                      You’ll gain a life-transforming breathwork technique
                      backed by over{' '}
                      <a href="https://www.artofliving.org/us-en/meditation/benefits/research-sudarshan-kriya">
                        100 independent studies
                      </a>{' '}
                      you can practice anytime you need.
                    </p>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
        </section>
        {courseViewMode !== WORKSHOP_MODE.VIEW && (
          <div className="float-bar">
            <div className="float-wrapper clearfix">
              <div className="bar-left">
                <div className="bar-title">
                  Start Your Journey to Inner Peace
                </div>
              </div>
              <div className="bar-right">
                <button
                  className="register-button"
                  onClick={handleRegister(
                    COURSE_TYPES.SKY_BREATH_MEDITATION.code,
                  )}
                >
                  Register Now <FaArrowRightLong className="fa-solid" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

function ContextAwareToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <h5 className="mb-0">
      <button
        className={classNames('btn btn-link', {
          collapsed: !isCurrentEventKey,
        })}
        onClick={decoratedOnClick}
      >
        {children}
      </button>
    </h5>
  );
}
