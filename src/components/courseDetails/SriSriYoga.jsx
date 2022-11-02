/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import classNames from "classnames";
import CourseDetailsCard from "./CourseDetailsCard";
import { CourseBottomCard } from "./CourseBottomCard";
import { COURSE_TYPES } from "@constants";
import { priceCalculation } from "@utils";
import { useRouter } from "next/router";
import Style from "./CourseDetails.module.scss";

export const SriSriYoga = ({ data, swiperOption }) => {
  const [activeSlider, setActiveSlider] = useState(0);
  const router = useRouter();

  const handleRegister = (e) => {
    e.preventDefault();
    router.push({
      pathname: `/us-en/course/checkout/${data.sfid}`,
      query: {
        ctype: data.productTypeId,
        page: "c-o",
      },
    });
  };

  const handleSliderBulletClick = (index) => {
    setActiveSlider(index);
  };

  const { title, workshopTotalHours, mode } = data || {};
  const { fee, delfee, offering } = priceCalculation({ workshop: data });

  const activeSliderClass =
    activeSlider === 0
      ? Style.sliderTransformFirst
      : activeSlider === 1
      ? Style.sliderTransformSecond
      : Style.sliderTransformThird;

  return (
    <>
      <main>
        <section className="about-program">
          <div className="about-program__image">
            <img
              src="/img/sri-sri-top-column.png"
              alt="Sri Sri Yoga Foundation Program"
            />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-xl-7">
                <div className="about-program__main">
                  <p className="about-program__main-type">{mode}</p>
                  <h1 className="about-program__main-name">{title}</h1>
                  <ul className="about-program__main-list">
                    <li>Restore, rebalance, & re-energize your mind-body</li>
                    <li>Begin or deepen your yoga journey </li>
                    <li>Gain wisdom for greater health & vitality</li>
                  </ul>
                  <Link
                    activeClassName="active"
                    className="btn-secondary about-program__main-button register-button"
                    to="registerNowBlock"
                    spy={true}
                    smooth={true}
                    duration={500}
                    offset={-100}
                  >
                    Register Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="top-column !tw-bg-none !tw-p-[0px] tw-bottom-24">
            <CourseDetailsCard
              workshop={data}
              courseType={COURSE_TYPES.SRI_SRI_YOGA_MEDITATION}
            ></CourseDetailsCard>
          </div>
        </section>
        <section className="program-benefits">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="program-benefits__quote">
                  <h2 className="program-benefits__quote-title">
                    Discover an authentic, integrated mind-body yoga practice
                    with far-reaching benefits.
                  </h2>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="row">
                  <div className="col-md-6">
                    <div className="program-benefits__item">
                      <img
                        src="/img/Learn.svg"
                        alt="40 years of authentic yoga education"
                        className="program-benefits__item-image"
                      />
                      <h6 className="program-benefits__item-title">
                        40 years of authentic yoga education
                      </h6>
                      <p className="program-benefits__item-text">
                        Discover a transformative practice rooted in tradition,
                        designed for modern life
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="program-benefits__item">
                      <img
                        src="/img/Step.svg"
                        alt="Suitable for beginner to intermediate"
                        className="program-benefits__item-image"
                      />
                      <h6 className="program-benefits__item-title">
                        Suitable for beginner to intermediate
                      </h6>
                      <p className="program-benefits__item-text">
                        Begin, refresh, or deepen your yoga practice from the
                        comfort of your home
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="program-benefits__item">
                      <img
                        src="/img/Online.svg"
                        alt="4-day online program"
                        className="program-benefits__item-image"
                      />
                      <h6 className="program-benefits__item-title">
                        4-day online program
                      </h6>
                      <p className="program-benefits__item-text">
                        2 hours a day of live sessions with experienced and
                        certified instructors
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="program-benefits__item">
                      <img
                        src="/img/Time.svg"
                        alt="Limited time only"
                        className="program-benefits__item-image"
                      />
                      <h6 className="program-benefits__item-title">
                        Limited time only
                      </h6>
                      <p className="program-benefits__item-text">
                        This program is regularly ${delfee} and currently
                        offered online for ${fee}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="program-description">
          <div className="container">
            <div className="row program-description__row">
              <div className="col-lg-6 program-description__content">
                <h2 className="program-description__content-title">
                  Yoga made just for you
                </h2>
                <p className="program-description__content-text">
                  Stretch out the kinks, begin a new empowering healthy habit,
                  gain personal insight, deepen your practice, get strong.{" "}
                </p>
              </div>
              <div className="col-lg-6">
                <div className="program-description__image">
                  <img
                    src="/img/yoga-for-you.png"
                    alt="Yoga made just for you"
                  />
                </div>
              </div>
            </div>
            <div className="row program-description__row">
              <div className="col-lg-6 program-description__content d-lg-none">
                <p className="program-description__content-text">
                  Whatever your motivation, you’ll emerge energized, restored,
                  more self-aware, with the confidence to continue your new
                  transformative yoga journey.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="program-description__image">
                  <img src="/img/sri-sri-yoga.png" alt="Sri Sri Yoga" />
                </div>
              </div>
              <div className="col-lg-6 program-description__content">
                <p className="program-description__content-text d-none d-lg-block">
                  Whatever your motivation, you’ll emerge energized, restored,
                  more self-aware, with the confidence to continue your new
                  transformative yoga journey.
                </p>
                <p className="program-description__content-subtitle">
                  Sri Sri Yoga is deeply relaxing, beneficial, and enjoyable to
                  practice—it is a yoga that makes you feel great on and off the
                  mat!
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="program-banner">
          <Element name="registerNowBlock">
            <div className="program-banner__image">
              <img src="/img/program-banner.png" alt="Limited Time Offer" />
            </div>
            <div className="container">
              <h2 className="program-banner__title">Limited Time Offer</h2>
              <p className="program-banner__subtitle">
                Sri Sri School of Yoga Foundation Program:
              </p>
              <p className="program-banner__price">
                {delfee && (
                  <span className="program-banner__price_previous">
                    ${delfee}
                  </span>
                )}
                <span> ${fee}</span>
              </p>
              <button
                type="button"
                className="btn-secondary program-banner__button register-button"
                onClick={handleRegister}
              >
                Register Today
              </button>
            </div>
          </Element>
        </section>
        <section className="program-experience">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-xl-5">
                <div className="program-experience__quote">
                  <h2 className="program-experience__quote-title">
                    Experience <br />
                    the best of yoga
                  </h2>
                  <p className="program-experience__quote-text">
                    With an expert by your side, you’ll explore the breadth of
                    yoga, and a transformational practice with benefits abound.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 offset-xl-1">
                <div className="program-experience__item">
                  <img
                    src="/img/Lotus.svg"
                    alt="Authentic yoga"
                    className="program-experience__item-image"
                  />
                  <h6 className="program-experience__item-title">
                    Authentic yoga
                  </h6>
                  <p className="program-experience__item-text">
                    Experience the true essence of yoga. Discover an authentic,
                    accessible, and enjoyable practice that deeply benefits
                    mind, body, and spirit. Feel relaxed and restored.
                  </p>
                </div>
                <div className="program-experience__item">
                  <img
                    src="/img/Instructor.svg"
                    alt="Expert instructors"
                    className="program-experience__item-image"
                  />
                  <h6 className="program-experience__item-title">
                    Expert instructors
                  </h6>
                  <p className="program-experience__item-text">
                    Dedicated to yoga and your well-being, our experienced and
                    certified Sri Sri School of Yoga instructors expertly guide
                    you every step of the way. Featuring demos with Q&A and
                    interactive sessions—all within a small group setting.
                  </p>
                </div>
                <div className="program-experience__item">
                  <img
                    src="/img/OpenBook.svg"
                    alt="Mind-body wisdom"
                    className="program-experience__item-image"
                  />
                  <h6 className="program-experience__item-title">
                    Mind-body wisdom
                  </h6>
                  <p className="program-experience__item-text">
                    Gain practical, life-enhancing yogic wisdom and insight into
                    your mind-body well-being for greater health and vitality.{" "}
                  </p>
                </div>
                <div className="program-experience__item">
                  <img
                    src="/img/Opportunity.svg"
                    alt="Empowerment"
                    className="program-experience__item-image"
                  />
                  <h6 className="program-experience__item-title">
                    Empowerment
                  </h6>
                  <p className="program-experience__item-text">
                    You’ll take away your own yoga sequence (and the
                    confidence!) to practice solo at home, plus have the tools
                    to reset and rebalance, anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="program-reviews">
          <div className="container">
            <h2 className="program-reviews__title">What people are saying</h2>
            <div className="program-reviews__slider">
              <div
                className={classNames(
                  "swiper-wrapper program-reviews__slider-wrapper",
                  activeSliderClass,
                )}
              >
                <div className="swiper-slide program-reviews__slide">
                  <div className="program-reviews__slide-item">
                    <div className="program-reviews__slide-item-image">
                      <img src="/img/reviews-karen.png" alt="Karen" />
                    </div>
                    <h3 className="program-reviews__slide-item-name">Karen</h3>
                    <span className="program-reviews__slide-item-location">
                      Long Island, NY
                    </span>
                    <ul className="program-reviews__slide-item-mark">
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star"></li>
                    </ul>
                    <p className="program-reviews__slide-item-text">
                      I was able to sleep better and noticed that I was more
                      productive and alert during the day. The workshop gave me
                      a better understanding of what yoga is all about — not
                      just asana (yoga poses).
                    </p>
                  </div>
                </div>
                <div className="swiper-slide program-reviews__slide">
                  <div className="program-reviews__slide-item">
                    <div className="program-reviews__slide-item-image">
                      <img src="/img/reviews-pooja.png" alt="Pooja" />
                    </div>
                    <h3 className="program-reviews__slide-item-name">Pooja</h3>
                    <span className="program-reviews__slide-item-location">
                      Santa Clara, CA
                    </span>
                    <ul className="program-reviews__slide-item-mark">
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star"></li>
                    </ul>
                    <p className="program-reviews__slide-item-text">
                      The combination of yoga and meditation made my mind and
                      body feel more relaxed with sense of completion. The
                      knowledge given on yoga and how to deal with mind through
                      body was amazing to learn.
                    </p>
                  </div>
                </div>
                <div className="swiper-slide program-reviews__slide">
                  <div className="program-reviews__slide-item">
                    <div className="program-reviews__slide-item-image">
                      <img src="/img/reviews-emmet.png" alt="Emmet" />
                    </div>
                    <h3 className="program-reviews__slide-item-name">Emmet</h3>
                    <span className="program-reviews__slide-item-location">
                      Atlanta, GA
                    </span>
                    <ul className="program-reviews__slide-item-mark">
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star program-reviews__slide-item-mark__star_active"></li>
                      <li className="program-reviews__slide-item-mark__star"></li>
                    </ul>
                    <p className="program-reviews__slide-item-text">
                      I have knee problems, but after the workshop, my knee felt
                      better and less stiff. The instruction were great both in
                      knowledge and style. I love that I could incorporate these
                      sequences of postures in my home practice.
                    </p>
                  </div>
                </div>
              </div>
              <div className="program-reviews__slider-pagination swiper-pagination-clickable swiper-pagination-bullets">
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active": activeSlider === 0,
                  })}
                  tabIndex="0"
                  role="button"
                  aria-label="Go to slide 1"
                  onClick={() => handleSliderBulletClick(0)}
                ></span>
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active": activeSlider === 1,
                  })}
                  tabIndex="1"
                  role="button"
                  aria-label="Go to slide 2"
                  onClick={() => handleSliderBulletClick(1)}
                ></span>
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active": activeSlider === 2,
                  })}
                  tabIndex="2"
                  role="button"
                  aria-label="Go to slide 3"
                  onClick={() => handleSliderBulletClick(2)}
                ></span>
              </div>
            </div>
          </div>
        </section>
        <section className="program-answers">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-xl-5">
                <div className="program-answers__quote">
                  <h2 className="program-answers__quote-title">
                    Why Sri Sri Yoga?
                  </h2>
                  <p className="program-answers__quote-text">
                    Experience the most relaxing style of yoga; a holistic
                    mind-body, multidimensional, and purposeful practice that
                    goes beyond the yoga mat to benefit every area of your life.
                  </p>
                </div>
              </div>
              <div className="col-lg-6 offset-xl-1">
                <div className="program-answers__item">
                  <div className="program-answers__item-image">
                    <img
                      src="/img/sri-sri-answers-1.png"
                      alt="Sri Sri Yoga is unique"
                    />
                  </div>
                  <div className="program-answers__item-info">
                    <h6 className="program-answers__item-info__title">
                      Sri Sri Yoga is unique
                    </h6>
                    <p className="program-answers__item-info__text">
                      This is authentic yoga. Rooted in the original teachings
                      of the ancient yogis—and brought to you in a way that is
                      simple, accessible, and enjoyable to practice. You
                      experience the breadth of yoga and the maximum benefits of
                      a holistic, deep yoga practice.
                    </p>
                  </div>
                </div>
                <div className="program-answers__item">
                  <div className="program-answers__item-image">
                    <img
                      src="/img/sri-sri-answers-2.png"
                      alt="Yoga for every body"
                    />
                  </div>
                  <div className="program-answers__item-info">
                    <h6 className="program-answers__item-info__title">
                      Yoga for every body
                    </h6>
                    <p className="program-answers__item-info__text">
                      Discover a supportive, inclusive yoga practice that meets
                      you, just as you are. You’ll explore your own comfortable
                      edge of stretch and strength to suit your body. And emerge
                      with deeper self-awareness and insight.{" "}
                    </p>
                  </div>
                </div>
                <div className="program-answers__item">
                  <div className="program-answers__item-image">
                    <img
                      src="/img/sri-sri-answers-3.png"
                      alt="Beyond the yoga pose"
                    />
                  </div>
                  <div className="program-answers__item-info">
                    <h6 className="program-answers__item-info__title">
                      Beyond the yoga pose
                    </h6>
                    <p className="program-answers__item-info__text">
                      Experience all aspects of a complete yoga practice,
                      including yoga postures (asanas), simple breathing
                      techniques (pranayamas), guided meditation, and yogic
                      wisdom. Designed to bring about vibrant well-being and
                      connection to calm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="program-quote">
          <div className="program-quote__image">
            <img src="/img/program-quote-bg.png" />
          </div>
          <div className="container">
            <div className="row">
              <div className="col-lg-10 offset-lg-1 col-xl-8 offset-xl-2">
                <h2 className="program-quote__text">
                  “One of the best yoga workshops I’ve taken. I gained a feeling
                  of calmness, stress reduction, and relief from anxiety”
                </h2>
                <h3 className="program-quote__author">
                  — Purti G., School teacher, Texas
                </h3>
              </div>
            </div>
          </div>
        </section>
        <section className="program-inspiration">
          <div className="container">
            <div className="row">
              <div className="col-lg-5">
                <h2 className="program-inspiration__title">
                  Gain well-being tools for life
                </h2>
                <p className="program-inspiration__subtitle">
                  4-day program, 2 hours per day
                </p>
                <button
                  type="button"
                  className="btn-secondary program-inspiration__button program-inspiration__button_desktop register-button"
                  onClick={handleRegister}
                >
                  Let's Get Started
                </button>
              </div>
              <div className="col-lg-7">
                <div className="program-inspiration__items">
                  <div className="program-inspiration__item">
                    <img
                      src="/img/Yoga.svg"
                      alt="Strength and poise"
                      className="program-inspiration__item-image"
                    />
                    <h5 className="program-inspiration__item-title">
                      Strength and poise
                    </h5>
                    <h6 className="program-inspiration__item-subtitle">
                      Yoga poses (asanas)
                    </h6>
                    <p className="program-inspiration__item-text">
                      Strengthen and tone muscles, while burning fat and
                      reducing cholesterol.
                    </p>
                  </div>
                  <div className="program-inspiration__item">
                    <img
                      src="/img/Energy.svg"
                      alt="Energy"
                      className="program-inspiration__item-image"
                    />
                    <h5 className="program-inspiration__item-title">Energy</h5>
                    <h6 className="program-inspiration__item-subtitle">
                      Breathing techniques
                    </h6>
                    <p className="program-inspiration__item-text">
                      Discover the power of yogic breathing practices to
                      energize, calm, and de-stress.
                    </p>
                  </div>
                  <div className="program-inspiration__item">
                    <img
                      src="/img/Candles.svg"
                      alt="Deep rest"
                      className="program-inspiration__item-image"
                    />
                    <h5 className="program-inspiration__item-title">
                      Deep rest
                    </h5>
                    <h6 className="program-inspiration__item-subtitle">
                      Meditation and relaxation
                    </h6>
                    <p className="program-inspiration__item-text">
                      Experience profound rest through guided practices that
                      effortlessly calm the mind and body.
                    </p>
                  </div>
                  <div className="program-inspiration__item">
                    <img
                      src="/img/Idea.svg"
                      alt="Insight"
                      className="program-inspiration__item-image"
                    />
                    <h5 className="program-inspiration__item-title">Insight</h5>
                    <h6 className="program-inspiration__item-subtitle">
                      Wisdom from yoga
                    </h6>
                    <p className="program-inspiration__item-text">
                      Explore the nature of the mind and body and how to live a
                      relaxed, healthy, fulfilling life.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary program-inspiration__button program-inspiration__button_mobile"
              onClick={handleRegister}
            >
              Let's Get Started
            </button>
          </div>
        </section>
      </main>
      <CourseBottomCard workshop={data} />
    </>
  );
};
