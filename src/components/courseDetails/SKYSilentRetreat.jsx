/* eslint-disable no-inline-styles/no-inline-styles */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { MODAL_TYPES, COURSE_TYPES } from "@constants";
import classNames from "classnames";
import { useAuth, useGlobalModalContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { FaArrowRightLong } from "react-icons/fa6";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import { useRouter } from "next/router";
import queryString from "query-string";
import { Swiper, SwiperSlide } from "swiper/react";
import { PriceCard } from "./PriceCard";
import { Pagination, A11y } from "swiper";
import { Accordion, Card, AccordionContext } from "react-bootstrap";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { useContext } from "react";

export const SKYSilentRetreat = ({ data }) => {
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const router = useRouter();

  const swiperOption = {
    modules: [Pagination, A11y],
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: { clickable: true },
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  };

  const { title, sfid, productTypeId, isGuestCheckoutEnabled } = data || {};

  const handleRegister = (e) => {
    e.preventDefault();
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
  };

  const ContextAwareToggle = ({ children, eventKey, callback }) => {
    const currentEventKey = useContext(AccordionContext);

    const decoratedOnClick = useAccordionToggle(
      eventKey,
      () => callback && callback(eventKey),
    );

    const isCurrentEventKey = currentEventKey === eventKey;

    return (
      <h5 className="mb-0">
        <button
          className={classNames("btn btn-link", {
            collapsed: !isCurrentEventKey,
          })}
          onClick={decoratedOnClick}
        >
          {children}
        </button>
      </h5>
    );
  };

  return (
    <>
      <main className="course-filter course-silence-retreat">
        <section className="samadhi-top-section">
          <div className="banner">
            <div className="container">
              <div className="courses-title">Courses</div>
              <div className="banner-title"> {title}</div>
              <div className="banner-description">
                Renew your energy & focus for the whole year
              </div>
              {!sfid && (
                <div className="hero-register-button-wrapper">
                  <button
                    className="hero-register-button"
                    onClick={handleRegister}
                  >
                    Register Now <FaArrowRightLong className="fa-solid" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {sfid && <PriceCard workshop={data} />}
          <div className="container samadhi-featuers">
            <div className="feature-box">
              <div className="feature-icon">
                <img src="/img/silence-retreat-icon-1.png" alt="Elevate" />
              </div>
              <div className="feature-text">Enjoy deep rest & rejuvenation</div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img src="/img/silence-retreat-icon-2.png" alt="Enhance" />
              </div>
              <div className="feature-text">
                Find freedom from the mind’s chatter
              </div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img src="/img/silence-retreat-icon-3.png" alt="Unlock" />
              </div>
              <div className="feature-text">
                Learn wellness practices to last a lifetime
              </div>
            </div>
          </div>
          <div className="container content-video-container">
            <div className="content-video-area">
              <div className="video-section-textbox">
                <h2 className="section-title">
                  Why take 3-4 days out of your busy life for a Silent Retreat
                </h2>
                <p>
                  The Silent Retreat is a powerful mix of restorative breathing
                  practices, yoga, deep wisdom, silence, and powerful guided
                  meditations. It combines the Art of Living Part I and II
                  courses into one transformative experience.
                </p>
                <p>
                  Many people report remarkable shifts during the
                  retreat—renewed perspective, fresh insight, a clearer mind.
                  These few days also make the rest of your year more alive,
                  productive, and full of energy. When you emerge, you feel
                  centered and refreshed, ready to take on life with greater
                  focus and joy.
                </p>
              </div>
              <div className="video-wrapper">
                <iframe
                  width="519"
                  height="291"
                  src="https://player.vimeo.com/video/860926723?h=8bf163df0e&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                  frameBorder="0"
                  title="Sahaj Samadhi"
                ></iframe>
              </div>
            </div>
            <p>
              You'll also learn the powerful breathing practice, Sudarshan Kriya
              also known as {COURSE_TYPES.SKY_BREATH_MEDITATION.name} taught in
              the Art of Living Part I course.
            </p>
          </div>

          <div className="container samadhi-benefits-section">
            <h2 className="section-title">
              <strong>Highlights</strong> of the Silent Retreat
            </h2>
            <div className="section-description">
              Powerful breathing techniques and wisdom that can change your life
            </div>
            <div className="samadhi-benefits-wrapper row">
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box1">
                  <div className="benefit-title">
                    <strong>Breathwork</strong>
                    <br />
                  </div>
                  <div className="benefit-text">
                    Improve your energy levels and reduce stress through
                    breathing exercises
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box2">
                  <div className="benefit-title">
                    <strong>Sudarshan</strong> Kriya
                  </div>
                  <div className="benefit-text">
                    Learn the most powerful breathing technique based on an
                    ancient tradition
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box3 ">
                  <div className="benefit-title">
                    <strong>Deep</strong> Meditations
                  </div>
                  <div className="benefit-text">
                    <strong>Exclusive to this course</strong>—immerse in unique
                    guided meditations crafted by Gurudev to release deep layers
                    of stress and tension
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box4">
                  <div className="benefit-title">
                    <strong>Silence</strong>
                    <br />
                  </div>
                  <div className="benefit-text">
                    Experience the extraordinary peace and rest that come from
                    spending time in silence.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="breadth-meditation sudarshan-kriya">
          <div className="container">
            <div className="row">
              <div className="col-12 px-1 col-lg-12 text-center text-lg-center">
                <h2 className="section-title">
                  <strong>Impacts</strong> of Sudarshan Kriya
                </h2>
                <div className="section-description">
                  Science-backed benefits of Sudarshan Kriya, shown in over 100
                  independent studies
                </div>
              </div>
              <div className="col-12 px-1 col-md-4 col-lg-4 text-left text-lg-left">
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
                    <span className="content stats-desc">
                      Increase in lymphocytes in 6 weeks & remained in the
                      normal range
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-1 col-md-4 col-lg-4 text-left text-lg-left">
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
                    <span className="content stats-desc">
                      Increase within 1 week
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-1 col-md-4 col-lg-4 text-left text-lg-left">
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
                    <span className="content stats-desc">
                      Decrease in serum cortisol in 2 weeks
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container refreshing-silence">
            <div className="row">
              <div className="col-12 px-1">
                <h2 className="section-title">
                  Discover just how refreshing silence can be
                </h2>
              </div>
              <div className="col-12 px-1 col-lg-8 text-left text-lg-left">
                <p>
                  Many people may find it challenging knowing how to quiet their
                  mind. The Silent Retreat provides techniques and optimal
                  conditions for sinking deep within and breaking free from
                  mental chatter. Your whole experience is carefully guided and
                  crafted to give you as relaxing and transformative an
                  experience as possible.{" "}
                </p>
                <p className="desktopView">
                  It’s no wonder that many retreat participants refer to it as
                  the ideal vacation for body, mind, and spirit.
                </p>
              </div>
              <div className="col-12 px-1 col-lg-4 text-left text-lg-left mobileColumn">
                <p className="mobileView">
                  It’s no wonder that many retreat participants refer to it as
                  the ideal vacation for body, mind, and spirit.
                </p>
                <div className="body-mind-spirit"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div className="container">
            <div className="feature_block">
              <h2 className="section-title">
                <strong>Art of Living</strong>
                <br /> as seen in
              </h2>
            </div>
            <div className="row">
              <div className="col-12 col-md-6 col-lg-3 text-left text-lg-left">
                <div className="feature_box">
                  <div className="feature_logo">
                    <img src="/img/CNN.png" alt="transforming lives" />
                  </div>
                  <div className="feature-content">
                    <span className="content">"Life Changing"</span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3 text-left text-lg-left">
                <div className="feature_box">
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
              <div className="col-12 col-md-6 col-lg-3 text-left text-lg-left">
                <div className="feature_box">
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
              <div className="col-12 col-md-6 col-lg-3 text-left text-lg-left">
                <div className="feature_box feature_box-no_border_line">
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

        <section className="section-sahaj-reviews">
          <h2 className="section-title">Transforming Lives through {title}</h2>
          <Swiper {...swiperOption} className="reviews-slider">
            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">
                  ...very, very powerful...such a sense of calm
                </div>
                <div className="review-text">
                  It was very, very powerful. I gained such a sense of calm,
                  more than I ever could have imagined.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/max-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Max Goldberg</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">
                  relaxed, refreshed, and happier
                </div>
                <div className="review-text">
                  It helped me to put into practice the valuable wisdom which I
                  had picked up on the {COURSE_TYPES.SKY_BREATH_MEDITATION.name}{" "}
                  course. I came away relaxed, refreshed and happier than I had
                  felt for a long time.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/julie-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Julie Madeley</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">Felt more balanced</div>
                <div className="review-text">
                  I've been on quite a few silent retreats in the past and this
                  felt more balanced, nourishing and comfortable than any other
                  retreat I'd been on.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/michelle-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Michelle Garisson</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">
                  extremely relaxing, yet energizing experience
                </div>
                <div className="review-text">
                  The meditations are deep! It was an extremely relaxing yet
                  energizing experience.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/vinita-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Vinita D.</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">wonderful, peaceful retreat</div>
                <div className="review-text">
                  A wonderful, peaceful retreat ... extremely joyful and easy.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/aarti-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Aarti R.</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">I feel more like myself</div>
                <div className="review-text">
                  I feel more like myself after the Silence Retreat. My life
                  goes smoother after it and I feel the difference for a good
                  3-6 months.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/daniel-review.png" alt="reviewer" />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Daniel M.</div>
                    <div className="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          <div className="swiper-pagination"></div>
        </section>

        <section className="faq">
          <div className="container">
            <h2 className="section-title pl-0 pr-0">FAQs</h2>
            <Accordion defaultActiveKey="0" className="accordion">
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="0">
                    Who is it for?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    For those who have not taken the Art of Living Part I Course
                    or {COURSE_TYPES.SKY_BREATH_MEDITATION.name} workshop and
                    would like to learn the tools and techniques to begin a
                    meditation practice and experience the power of silence —
                    gentle, light, and easy.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="1">
                    What’s included in this course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    The Silent Retreat course features:
                    <ul style={{ listStyle: "inside" }}>
                      <li>Daily Yoga</li>
                      <li>Daily Meditation</li>
                      <li>Wisdom Tools and Techniques</li>
                      <li>Learning Sudarshan Kriya (SKY) and its benefits</li>
                      <li>Contemplative Silence</li>
                      <li>Mindful Guided Meditations</li>
                      <li>Experience the 7-Levels of Your Existence</li>
                      <li>Different Yoga Mudras</li>
                    </ul>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="2">
                    What’s the structure of the course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="2">
                  <Card.Body>
                    <p>
                      You'll spend the first full day of the program learning
                      breathing techniques and other tools to manage and calm
                      the mind, which includes different processes. You'll enter
                      into silence on day two. You'll have ample opportunities
                      for questions during designated talking periods.
                    </p>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="3">
                    What’s the cost of the Silent Retreat Course?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="3">
                  <Card.Body>
                    <p>
                      Silent Retreat course is available in two formats: an
                      online course for $495 and an in-person course for $695.
                    </p>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
        </section>
        <div className="float-bar">
          <div className="float-wrapper clearfix">
            <div className="bar-left">
              <div className="bar-title">
                Reserve Your Journey to a Worry-Free Mind
              </div>
            </div>
            <div className="bar-right">
              <button className="register-button" onClick={handleRegister}>
                Register Now <FaArrowRightLong className="fa-solid" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
