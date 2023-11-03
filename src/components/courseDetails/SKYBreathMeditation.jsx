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

export const SKYBreathMeditation = ({ data, mode: courseViewMode }) => {
  const { sfid, title, isGuestCheckoutEnabled, productTypeId } = data || {};
  const router = useRouter();
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();

  const handleRegister = (e) => {
    e.preventDefault();
    if (sfid) {
      if (authenticated || isGuestCheckoutEnabled) {
        pushRouteWithUTMQuery(router, {
          pathname: `/us-en/course/checkout/${sfid}`,
          query: {
            ctype: productTypeId,
            page: 'c-o',
          },
        });
      } else {
        showModal(MODAL_TYPES.LOGIN_MODAL, {
          navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
            router.query,
          )}`,
          defaultView: 'SIGNUP_MODE',
        });
      }
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling`,
        query: {
          courseType: COURSE_TYPES.SKY_BREATH_MEDITATION.code,
        },
      });
    }
  };

  return (
    <>
      <main className="sky-breath-course">
        <section className="top-column sky-breath">
          <div className="container first-section">
            <div className="banner-title">
              The Art of Living
              <br />
              <span>Part I Course</span>
            </div>
            <div className="banner-desc">
              Discover Gurudev Sri Sri Ravi Shankar’s
              <br />
              <span>ancient secret to modern well-being</span>
            </div>

            <ul>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#ED930F"
                  className="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
                Reduce stress, anxiety, and depression
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#ED930F"
                  className="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
                Improve sleep
              </li>
              <li>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#ED930F"
                  className="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
                Boost immunity
              </li>
            </ul>
            {!sfid && courseViewMode !== WORKSHOP_MODE.VIEW && (
              <div className="hero-register-button-wrapper">
                <a className="hero-register-button" onClick={handleRegister}>
                  <img src="/img/regiter-btn.original.png" alt="" />
                </a>
              </div>
            )}
          </div>
          {sfid && (
            <PriceCard workshop={data} courseViewMode={courseViewMode} />
          )}
        </section>
        <section className="progress-section">
          <div className="container">
            <div className="row">
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="progress_box">
                  <div className="progress_logo">
                    <img
                      src="/img/transforming-lives.svg"
                      alt="transforming lives"
                    />
                  </div>
                  <div className="progress_content">
                    <span className="title">42 Years</span>
                    <br />
                    <span className="content">of transforming lives</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="progress_box">
                  <div className="progress_logo">
                    <img src="/img/worldwide.svg" alt="transforming lives" />
                  </div>
                  <div className="progress_content">
                    <span className="title">10,000+ Centers</span>
                    <br />
                    <span className="content">worldwide</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="progress_box">
                  <div className="progress_logo">
                    <img src="/img/countries.svg" alt="transforming lives" />
                  </div>
                  <div className="progress_content">
                    <span className="title">180 Countries</span>
                    <br />
                    <span className="content">
                      where our programs made a difference
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="progress_box">
                  <div className="progress_logo">
                    <img src="/img/people.svg" alt="transforming lives" />
                  </div>
                  <div className="progress_content">
                    <span className="title">500M+ Lives</span>
                    <br />
                    <span className="content">
                      touched through our courses & events
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="breadth-meditation">
          <div className="container">
            <div className="row">
              <div className="breadth-meditation__block">
                <h2 className="breadth-meditation__title section-title text-center">
                  A Signature Meditation Technique
                </h2>
                <div className="col-12 col-lg-6 float-left">
                  <div className="comments__video">
                    <iframe
                      src="https://player.vimeo.com/video/854478087?h=0eaa68b0ef&wmode=opaque"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
                <div className="col-12 col-lg-6 float-left">
                  <div className="breadth-meditation_content">
                    <p className="">
                      Sudarshan Kriya ({COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                      ) taught in the Art of Living Part I course is a powerful
                      rhythmic breathing technique that harmonizes the body-mind
                      complex. Participants notice reduced stress and anxiety,
                      better sleep, a stronger immune system, and increased
                      energy levels.
                    </p>
                    {courseViewMode !== WORKSHOP_MODE.VIEW && (
                      <button
                        className="register-button"
                        onClick={handleRegister}
                      >
                        Register Now <FaArrowRightLong />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">
              <div className="col-12 px-2 col-lg-12 text-center text-lg-center">
                <img src="/img/smallLine.svg" />
                <h2 className="breadth-meditation__title section-title benefits-title text-center">
                  Impacts of {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                </h2>
                <p className="section-desc text-center">
                  Science-backed benefits of SKY, shown in over 100 independent
                  studies
                </p>
              </div>
              <div className="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div className="breadth-meditation_box">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon1.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-1">
                      +33%
                      <br />
                      Immune Cell Count
                    </span>
                    <br />
                    <span className="content stats-desc">
                      Increase in lymphocytes in 6 weeks & remained in the
                      normal range
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div className="breadth-meditation_box">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon2.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-2">
                      21%
                      <br />
                      Life Satisfaction
                    </span>
                    <br />
                    <span className="content stats-desc">
                      Increase within 1 week
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-2 col-lg-4 text-left text-lg-left">
                <div className="breadth-meditation_box">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon3.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-3">
                      -57%
                      <br />
                      Stress Hormone
                    </span>
                    <br />
                    <span className="content stats-desc">
                      Decrease in serum cortisol in 2 weeks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="key-highlight-section">
          <div className="container">
            <div className="key-highlight_block">
              <h2 className="key-highlight_title section-title text-center">
                Key Highlights of
                <br />
                the 3 Day Course
              </h2>
            </div>
            <Slider {...settings}>
              <div className="slide">
                <div className="key-highlight-box">
                  <div className="key-highlight-logo">
                    <img src="/img/key-11.png" alt="transforming lives" />
                  </div>
                  <div className="key-highlight-content">
                    <span className="title">Pranayama</span>
                    <br />
                    <span className="content">
                      Improve your energy levels and reduce stress through
                      breathing exercises
                    </span>
                  </div>
                </div>
              </div>
              <div className="slide">
                <div className="key-highlight-box">
                  <div className="key-highlight-logo">
                    <img src="/img/key-2.jpg" alt="transforming lives" />
                  </div>
                  <div className="key-highlight-content">
                    <span className="title">
                      {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                    </span>
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
                    <img src="/img/key-3.jpg" alt="transforming lives" />
                  </div>
                  <div className="key-highlight-content">
                    <span className="title">5 Keys to a Joyful Life</span>
                    <br />
                    <span className="content">
                      Simple, yet powerful principles to help you navigate life
                      joyfully
                    </span>
                  </div>
                </div>
              </div>
              <div className="slide">
                <div className="key-highlight-box">
                  <div className="key-highlight-logo">
                    <img src="/img/key-4.jpg" alt="transforming lives" />
                  </div>
                  <div className="key-highlight-content">
                    <span className="title">Tap Into Community</span>
                    <br />
                    <span className="content">
                      Connect with live teachers and a like-minded community of
                      people
                    </span>
                  </div>
                </div>
              </div>
              <div className="slide">
                <div className="key-highlight-box">
                  <div className="key-highlight-logo">
                    <img src="/img/key-3.jpg" alt="transforming lives" />
                  </div>
                  <div className="key-highlight-content">
                    <span className="title">Ongoing Support</span>
                    <br />
                    <span className="content">
                      Continued access to teachers, digital content, and weekly
                      group practice
                    </span>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
        </section>

        <section className="quote-section">
          <div className="container">
            <div className="col-12 main-area">
              <p className="quote-section__quote">
                <span>
                  “Meditation is the journey from sound to silence, from
                  movement to stillness, from a limited identity to unlimited
                  space”
                </span>
              </p>
              <p className="quote-section__text">
                <img src="/img/Guruji-2.png" />
                <br />~ Gurudev Sri Sri Ravi Shankar
              </p>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div className="container">
            <div className="feature_block">
              <h2 className="feature_title section-title text-center">
                Featured in
              </h2>
            </div>
            <div className="row">
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="feature_box pinkbox">
                  <div className="feature_logo">
                    <img src="/img/CNN.png" alt="transforming lives" />
                  </div>
                  <div className="feature-content">
                    <span className="content">"Life Changing"</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="feature_box greybox">
                  <div className="feature_logo">
                    <img src="/img/Yoga.png" alt="transforming lives" />
                  </div>
                  <div className="feature-content">
                    <span className="content">
                      "May be the fastest growing spiritual practice on the
                      planet"
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="feature_box pinkbox">
                  <div className="feature_logo">
                    <img src="/img/Harvard.png" alt="transforming lives" />
                  </div>
                  <div className="feature-content">
                    <span className="content">
                      "Show promise in providing relief for depression"
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-6 text-left text-lg-left">
                <div className="feature_box greybox">
                  <div className="feature_logo">
                    <img src="/img/WP.png" alt="transforming lives" />
                  </div>
                  <div className="feature-content">
                    <span className="content">
                      "Like Fresh air to millions"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="comments">
          <div className="container">
            <h2 className="comments__title section-title text-center">
              How is Art of Living Part I Course Changing Lives?
            </h2>
          </div>
          <div className="comments__video">
            <iframe
              src="https://player.vimeo.com/video/428103610"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
        </section>

        <section className="faq">
          <div className="container">
            <h2 className="section-title pl-0 pr-0">
              Frequently Asked Questions
              <img src="/img/FAQ.svg" />
            </h2>
            <Accordion defaultActiveKey="0" className="accordion">
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="0">
                    What is the duration of the {title} workshop?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    You can learn {title} in 3 days with 2.5 hours of live
                    online sessions each day with a certified instructor.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="1">
                    What are the benefits of practicing {title}?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    {title} has been researched in over 100 independent,
                    peer-reviewed studies and shown significant mind and body
                    benefits. It lowers stress levels, improves mental clarity,
                    enhances emotional well-being, contributes to better sleep,
                    raises energy levels, and provides a greater sense of inner
                    peace. The physical benefits include boosting immunity,
                    heart health, and more.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="2">
                    Can I reschedule my {title} course after my initial
                    registration?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                  <Card.Body>
                    Yes, you can reschedule to a different {title} course if you
                    are unable to attend the original dates selected.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="3">
                    Is there an age limit to learn {title}?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="3">
                  <Card.Body>
                    Yes, you must be at least 18 years old to learn {title}.{' '}
                    <br />
                    The Art of Living offers alternative programs for children
                    and teens (18 years and under). Contact us at
                    support@us.artofliving.org to learn more.
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
                    <p>The online {title} course is $295*</p>
                    <p>What’s included:</p>
                    <ul>
                      <li>
                        <strong>&bull;</strong> 2.5 hour daily live sessions
                      </li>
                      <li>
                        <strong>&bull;</strong> certified expert instruction
                      </li>
                      <li>
                        <strong>&bull;</strong> guided techniques with Q&A
                      </li>
                      <li>
                        <strong>&bull;</strong> real-time support
                      </li>
                      <li>
                        <strong>&bull;</strong> interactive wisdom sessions
                      </li>
                      <li>
                        <strong>&bull;</strong> small group size
                      </li>
                    </ul>
                    <p>
                      You’ll gain a life-transforming breathwork technique
                      backed by over 100+ independent studies you can practice
                      anytime you need.
                    </p>
                    <p>
                      *A one-time payment for a LIVE course, and not a
                      subscription.
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
                <a href="#" onClick={handleRegister}>
                  <img src="/img/regiter-btn-alt.original.png" alt="" />
                </a>
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
