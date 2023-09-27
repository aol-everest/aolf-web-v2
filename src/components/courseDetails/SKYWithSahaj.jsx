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
import { priceCalculation } from "@utils";

export const SKYWithSahaj = ({ data }) => {
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

  const { fee, delfee } = priceCalculation({ workshop: data });

  return (
    <>
      <main className="course-filter art-of-living-premium-course">
        <section className="samadhi-top-section">
          <div className="banner">
            <div className="container">
              <div className="courses-title">Courses</div>
              <div className="banner-title"> {title}</div>
              <div className="banner-description">
                Find new levels of calm and energy for life
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
                <img src="/img/aolp-size.png" alt="Reduce" />
              </div>
              <div className="feature-text">
                Reduce stress, anxiety, and depression
              </div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img src="/img/aolp-increase.png" alt="Enhance" />
              </div>
              <div className="feature-text">Increase your energy levels</div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img src="/img/aolp-wellness.png" alt="Wellness" />
              </div>
              <div className="feature-text">
                Learn wellness practices that last a lifetime
              </div>
            </div>
          </div>
          <div className="container content-video-area">
            <div className="video-section-textbox">
              <h2 className="section-title">
                Discover Art of Living's Premium Course
              </h2>
              <div className="discover_premium_course_text">
                <p>
                  This course combines two powerful experiences into one. You
                  will learn Sudarshan Kriya (SKY Breath Meditation), as taught
                  in the Art of Living Part I course, and also acquire a
                  personal mantra, a charged sound that makes meditation easier,
                  introduced in the Sahaj Samadhi Meditation course.
                </p>
                <img src="/img/sky-sahaj.png" />
              </div>
              <p>
                SKY Breath Meditation is an evidence-based breathwork practice
                known to reduce stress and anxiety, with noticeable results in
                just one week. This practice helps you let go of the past and
                access a heightened state of awareness and relaxation, providing
                you with a repeatable tool. Sahaj Samadhi Meditation takes this
                further by deepening your experiences of rest and awareness,
                freeing your mind from day-to-day worries.
              </p>
              <p>
                The combination has a compounding effect that accelerates your
                journey towards tranquility. In the end, you walk away with a
                comprehensive toolkit of breathwork and meditation that mutually
                enhance each other.
              </p>
            </div>
          </div>
          <div className="container samadhi-benefits-section">
            <h2 className="section-title">
              <strong>Course</strong> Highlights
            </h2>
            <div className="samadhi-benefits-wrapper row">
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box1">
                  <div className="benefit-title">
                    <strong>Pranayama</strong>
                  </div>
                  <div className="benefit-text">
                    Improve your energy levels and reduce stress through
                    breathing Exercises
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box2">
                  <div className="benefit-title">
                    <strong>SKY Breath Meditation </strong>(Sudarshan Kriya)
                  </div>
                  <div className="benefit-text">
                    Learn the most powerful breathing technique of our time
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box3 ">
                  <div className="benefit-title">
                    <strong>5 Keys </strong>to Joyful Life
                  </div>
                  <div className="benefit-text">
                    Simple toolkit to help you navigate life joyfully
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box4">
                  <div className="benefit-title">
                    <strong>Community</strong>
                  </div>
                  <div className="benefit-text">
                    Connect with a community of like-minded people and a
                    certified instructor
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
                <div className="breadth-meditation_box box_1">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon1.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-1">
                      +33% Immune Cell Count
                    </span>
                    <span className="content stats-desc">
                      Increase in lymphocytes in 6 weeks & remained in the
                      normal range
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-1 col-md-4 col-lg-4 text-left text-lg-left">
                <div className="breadth-meditation_box box_2">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon2.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-2">21% Life Satisfaction</span>
                    <span className="content stats-desc">
                      Increase within 1 week
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 px-1 col-md-4 col-lg-4 text-left text-lg-left">
                <div className="breadth-meditation_box box_3">
                  <div className="breadth-meditation_logo">
                    <img src="/img/icon3.svg" alt="transforming lives" />
                  </div>
                  <div className="breadth-meditation_content">
                    <span className="title stats-3">-57% Stress Hormone</span>
                    <span className="content stats-desc">
                      Decrease in serum cortisol in 2 weeks
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

        <section className="container banner3">
          <div className="aos-banner-third row">
            <div className="banner-title">
              Unlock new levels of calm and energy for life with this 3-day
              online or in-person course starting at ${fee}
            </div>
            <div className="col-sm-12 col-md-6 banner-text">
              <ul className="first">
                <li>* SKY Breath Meditation</li>
                <li>* Pranayama</li>
                <li>* Personal Mantra</li>
              </ul>
            </div>
            <div className="col-sm-12 col-md-6 banner-text">
              <ul className="second">
                <li>* 5 Keys to Joyful Life</li>
                <li>* 10.5 hrs Duration of the course</li>
              </ul>
            </div>
            <div className="enrollment">
              <div className="banner-text">
                <div className="total-value">
                  Total value -{" "}
                  <span className="orginal-price">
                    {delfee && `$${delfee}`}
                  </span>{" "}
                  <span>${fee}</span>
                </div>
              </div>
              <button className="enroll-btn">Enroll Now →</button>
            </div>
          </div>
        </section>

        <section className="faq">
          <div className="container">
            <h2 className="section-title pl-0 pr-0">FAQs</h2>
            <Accordion defaultActiveKey="0" className="accordion">
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="0">
                    What is the duration of the SKY Breath Meditation workshop?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    You can learn Sahaj Samadhi Meditation in 3 days with 2
                    hours of live online sessions each day with a certified
                    instructor.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="2">
                    How is Sahaj Samadhi Meditation different from guided
                    meditations?
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
                    What is the duration of the SKY Breath Meditation workshop?
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
