/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { useContext } from "react";
import { MODAL_TYPES, COURSE_MODES, COURSE_TYPES } from "@constants";
import { useAuth, useGlobalModalContext } from "@contexts";
import { Accordion, Card, AccordionContext } from "react-bootstrap";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import classNames from "classnames";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { PriceCard } from "./PriceCard";
import queryString from "query-string";
import { pushRouteWithUTMQuery } from "@service";
import { useRouter } from "next/router";
import { FaArrowRightLong } from "react-icons/fa6";

const settings = {
  slidesToShow: 3,
  slidesToScroll: 1,
  centerMode: false,
  arrows: false,
  dots: true,
  speed: 300,
  centerPadding: "0px",
  infinite: true,
  autoplaySpeed: 5000,
  autoplay: true,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: "40px",
        slidesToShow: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        arrows: false,
        centerMode: true,
        centerPadding: "40px",
        slidesToShow: 1,
      },
    },
  ],
};

export const SKYBreathMeditation = ({ data }) => {
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
            page: "c-o",
          },
        });
      } else {
        showModal(MODAL_TYPES.LOGIN_MODAL, {
          navigateTo: `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
            router.query,
          )}`,
          defaultView: "SIGNUP_MODE",
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
      <main class="sky-breath-course">
        <section class="top-column sky-breath">
          <div class="container first-section">
            <div class="banner-title">
              The Art of Living
              <br />
              <span>Part I Course</span>
            </div>
            <div class="banner-desc">
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
                  class="bi bi-check-circle-fill"
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
                  class="bi bi-check-circle-fill"
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
                  class="bi bi-check-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
                Boost immunity
              </li>
            </ul>
            {!sfid && (
              <div class="hero-register-button-wrapper">
                <a class="hero-register-button" onClick={handleRegister}>
                  <img src="/img/regiter-btn.original.png" alt="" />
                </a>
              </div>
            )}
          </div>
          {sfid && <PriceCard workshop={data} />}
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
                    <span class="title">42 Years</span>
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
                    <span class="title">10,000+ Centers</span>
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
                    <span class="title">180 Countries</span>
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
                    <span class="title">500M+ Lives</span>
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
                  A Signature Meditation Technique
                </h2>
                <div class="col-12 col-lg-6 float-left">
                  <div class="comments__video">
                    <iframe
                      src="https://player.vimeo.com/video/854478087?h=0eaa68b0ef&wmode=opaque"
                      width="100%"
                      height="100%"
                      frameborder="0"
                      allow="autoplay; fullscreen"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
                <div class="col-12 col-lg-6 float-left">
                  <div class="breadth-meditation_content">
                    <p class="">
                      Sudarshan Kriya ({COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                      ) taught in the Art of Living Part I course is a powerful
                      rhythmic breathing technique that harmonizes the body-mind
                      complex. Participants notice reduced stress and anxiety,
                      better sleep, a stronger immune system, and increased
                      energy levels.
                    </p>
                    <button class="register-button" onClick={handleRegister}>
                      Register Now <FaArrowRightLong />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container">
            <div class="row">
              <div class="col-12 px-2 col-lg-12 text-center text-lg-center">
                <img src="/img/smallLine.svg" />
                <h2 class="breadth-meditation__title section-title benefits-title text-center">
                  Impacts of {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                </h2>
                <p class="section-desc text-center">
                  Science-backed benefits of SKY, shown in over 100 independent
                  studies
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
                Key Highlights of
                <br />
                the 3 Day Course
              </h2>
            </div>
            <Slider {...settings}>
              <div class="slide">
                <div class="key-highlight-box">
                  <div class="key-highlight-logo">
                    <img src="/img/key-11.png" alt="transforming lives" />
                  </div>
                  <div class="key-highlight-content">
                    <span class="title">Pranayama</span>
                    <br />
                    <span class="content">
                      Improve your energy levels and reduce stress through
                      breathing exercises
                    </span>
                  </div>
                </div>
              </div>
              <div class="slide">
                <div class="key-highlight-box">
                  <div class="key-highlight-logo">
                    <img src="/img/key-2.jpg" alt="transforming lives" />
                  </div>
                  <div class="key-highlight-content">
                    <span class="title">
                      {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                    </span>
                    <br />
                    <span class="content">
                      Learn the most powerful breathing technique based on an
                      ancient tradition
                    </span>
                  </div>
                </div>
              </div>
              <div class="slide">
                <div class="key-highlight-box">
                  <div class="key-highlight-logo">
                    <img src="/img/key-3.jpg" alt="transforming lives" />
                  </div>
                  <div class="key-highlight-content">
                    <span class="title">5 Keys to a Joyful Life</span>
                    <br />
                    <span class="content">
                      Simple, yet powerful principles to help you navigate life
                      joyfully
                    </span>
                  </div>
                </div>
              </div>
              <div class="slide">
                <div class="key-highlight-box">
                  <div class="key-highlight-logo">
                    <img src="/img/key-4.jpg" alt="transforming lives" />
                  </div>
                  <div class="key-highlight-content">
                    <span class="title">Tap Into Community</span>
                    <br />
                    <span class="content">
                      Connect with live teachers and a like-minded community of
                      people
                    </span>
                  </div>
                </div>
              </div>
              <div class="slide">
                <div class="key-highlight-box">
                  <div class="key-highlight-logo">
                    <img src="/img/key-3.jpg" alt="transforming lives" />
                  </div>
                  <div class="key-highlight-content">
                    <span class="title">Ongoing Support</span>
                    <br />
                    <span class="content">
                      Continued access to teachers, digital content, and weekly
                      group practice
                    </span>
                  </div>
                </div>
              </div>
            </Slider>
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
                    <img src="/img/CNN.png" alt="transforming lives" />
                  </div>
                  <div class="feature-content">
                    <span class="content">"Life Changing"</span>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6 text-left text-lg-left">
                <div class="feature_box greybox">
                  <div class="feature_logo">
                    <img src="/img/Yoga.png" alt="transforming lives" />
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
                    <img src="/img/Harvard.png" alt="transforming lives" />
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
                    <img src="/img/WP.png" alt="transforming lives" />
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
              How is Art of Living Part I Course Changing Lives?
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
            <Accordion defaultActiveKey="0" class="accordion">
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
                    Yes, you must be at least 18 years old to learn {title}.{" "}
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
        <div class="float-bar">
          <div class="float-wrapper clearfix">
            <div class="bar-left">
              <div class="bar-title">Start Your Journey to Inner Peace</div>
            </div>
            <div class="bar-right">
              <a href="#" onClick={handleRegister}>
                <img src="/img/regiter-btn-alt.original.png" alt="" />
              </a>
            </div>
          </div>
        </div>
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
    <h5 class="mb-0">
      <button
        class={classNames("btn btn-link", { collapsed: !isCurrentEventKey })}
        onClick={decoratedOnClick}
      >
        {children}
      </button>
    </h5>
  );
}
