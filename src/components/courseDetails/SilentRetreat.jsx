/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import CourseDetailsCard from "./CourseDetailsCard";
import { CourseBottomCard } from "./CourseBottomCard";
import { ABBRS, COURSE_TYPES } from "@constants";
import { RegisterPanel } from "./RegisterPanel";
import { HideOn } from "react-hide-on-scroll";

export const SilentRetreat = ({ data, swiperOption }) => {
  const { title, mode } = data || {};
  return (
    <>
      <main>
        <section className="top-column silent-retreat">
          <div className="container">
            <p className="type-course">{mode}</p>
            <h1 className="course-name">{title}</h1>

            <ul className="course-details-list">
              <li>Discover a profound depth of inner silence</li>
              <li>Enjoy deep rest & rejuvenation</li>
              <li>Begin or renew a restorative meditation practice</li>
            </ul>
            <Link
              activeClassName="active"
              className="btn-secondary v2"
              to="registerNowBlock"
              spy={true}
              smooth={true}
              duration={500}
              offset={0}
            >
              Register Now
            </Link>
          </div>
          <CourseDetailsCard
            workshop={data}
            courseType={COURSE_TYPES.SILENT_RETREAT}
          ></CourseDetailsCard>
        </section>
        <section className="why-course">
          <div className="container">
            <h2 className="col-lg-7 p-0 section-title why-course__title">
              Why take few days out of your busy life for a Silent Retreat?
            </h2>
            <p className="col-xl-8 col-lg-7 p-0 why-course__text">
              <span>
                The Silent Retreat is a wonderful mix of restorative breathing
                practices, daily yoga, deep wisdom, silence, and powerful guided
                meditations.
              </span>
              <span>
                Many people report remarkable shifts during the retreat—renewed
                perspective, fresh insight, a clearer mind. These few days also
                make the rest of your year more alive, productive, and full of
                energy. When you emerge, you feel centered and refreshed, ready
                to take on life with greater focus and joy.
              </span>
              <span>
                The retreat is an ideal way to reconnect with your practices and
                the experience of SKY Breath Meditation and take your energy to
                another level.
              </span>
            </p>
          </div>
        </section>
        <section className="how-it-works silent-retreat">
          <div className="container">
            <div className="col-xl-6 col-lg-7 p-0">
              <div className="how-it-works__block">
                <h2 className="how-it-works__title silent-retreat__title section-title">
                  Discover just how refreshing silence can be
                </h2>
              </div>
              <div className="how-it-works__list">
                <div className="how-it-works__item">
                  <p>
                    <span>A renewal in mind, body, and spirit</span>
                  </p>
                  The practice of silence—of consciously withdrawing our energy
                  and attention from outer distractions—has been used in
                  different traditions for thousands of years as a pathway to
                  physical, mental, and spiritual renewal. On the retreat, you
                  experience an extraordinary sense of peace and renewed
                  vitality, that will increase your resilience to stress and
                  enhance your ability to thrive.
                </div>
                <div className="how-it-works__item">
                  <p>
                    <span>Create shifts in your life</span>
                  </p>
                  The Silent Retreat can help you drop limiting beliefs, regrets
                  and worries, bringing you more fully into the present moment
                  and into a bigger vision for yourself. You may find a joy that
                  is unshaken by outer circumstances.
                </div>
                <div className="how-it-works__item">
                  <p>
                    <span>Find freedom from the mind’s chatter</span>
                  </p>
                  Many people may find it challenging knowing how to quiet their
                  mind. The Silent Retreat provides optimal conditions for
                  sinking deep within and breaking free from mental chatter.
                  Your whole day is carefully guided and crafted to give you as
                  relaxing and transformative an experience possible. It’s no
                  wonder that many retreat participants refer to it as the ideal
                  vacation for body, mind, and spirit.
                </div>
              </div>
              <p className="silent-retreat-condition">
                <span>*</span>
                <span>
                  SKY Breath Meditation is a prerequisite to enroll in the
                  Silent Retreat. You can learn more{" "}
                  <a
                    className="link silent-retreat__link"
                    href="https://event.us.artofliving.org/us-en/online-course-2/"
                    target="blank"
                  >
                    here
                  </a>
                  .
                </span>
              </p>
            </div>
          </div>
        </section>
        <section className="comments silent-retreat">
          <div className="container">
            <h2 className="comments__title section-title text-center">
              How lives are transformed
            </h2>
          </div>
          <div className="comments__video">
            <iframe
              src="https://player.vimeo.com/video/432237531"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
          <Swiper className="px-3 px-lg-0" {...swiperOption}>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/1-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Max Goldberg</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p className="comments__quote">
                “...very, very powerful...such a sense of calm”
              </p>
              <div className="comments__text">
                <p className="short">
                  It was very, very powerful. I gained such a sense of calm,
                  more than I ever could have imagined.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/2-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Julie Madeley</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p className="comments__quote">
                “relaxed, refreshed, and happier”
              </p>
              <div className="comments__text">
                <p className="short">
                  It helped me to put into practice the valuable wisdom which I
                  had picked up on the SKY Breath Meditation course. I came away
                  relaxed, refreshed and happier than I had felt for a long
                  time.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/3-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Michelle Garisson</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p className="comments__quote">“felt more balanced”</p>
              <div className="comments__text">
                <p className="short">
                  I've been on quite a few silent retreats in the past and this
                  felt more balanced, nourishing and comfortable than any other
                  retreat I'd been on.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/4-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Vinita D.</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p className="comments__quote">
                “extremely relaxing, yet energizing experience”
              </p>
              <div className="comments__text">
                <p className="short">
                  The meditations are deep! It was an extremely relaxing yet
                  energizing experience.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/5-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Aarti R.</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p className="comments__quote">“wonderful, peaceful retreat”</p>
              <div className="comments__text">
                <p className="short">
                  A wonderful, peaceful retreat ... extremely joyful and easy.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <div className="comments__person">
                <div className="comments__person-img">
                  <img src="/img/6-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div className="comments__person-info">
                  <h3 className="comments__name">Daniel M.</h3>
                  <p className="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p className="comments__quote">“I feel more like myself”</p>
              <div className="comments__text">
                <p className="short">
                  I feel more like myself after the Silence Retreat. My life
                  goes smoother after it and I feel the difference for a good
                  3-6 months.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>
        <Element name="registerNowBlock">
          <section className="powerful silent-retreat" id="third">
            <div className="container">
              <div className="col-lg-10 p-0 m-auto">
                <h2 className="text-center mb-3 silent-retreat__title">
                  Even just a few minutes of true silence gives a rest far
                  deeper than sleep, and possibly anything else you’ve
                  experienced in life.
                </h2>
                <h2 className="text-center silent-retreat__title">
                  Discover true silence.
                </h2>
                <RegisterPanel workshop={data} />
              </div>
            </div>
          </section>
        </Element>

        <section className="quote-section">
          <div className="container">
            <div className="offset-lg-6">
              <p className="quote-section__name">
                Sri Sri Ravi Shankar
                <span>Founder of The Art of Living</span>
              </p>
              <p className="quote-section__quote">
                “
                <span>
                  True laughter and celebration are born only out of deep
                  silence...
                </span>
              </p>
            </div>
          </div>
        </section>
        <section className="life-time silent-retreat">
          <div className="container">
            <div className="col-xl-5 col-lg-6 p-0">
              <h2 className="life-time__title section-title">
                Renewed energy & focus that lasts the whole year
              </h2>
              <div className="life-time__block">
                <h3>Release deep layers of stress</h3>
                <p className="life-time__text">
                  Experience a set of unique guided meditations, designed by
                  meditation master, Sri Sri Ravi Shankar, geared towards
                  drawing out the deepest layers of stress and tension from the
                  nervous system, leaving you with a feeling of lightness,
                  freedom, energy, and joy.
                </p>
              </div>
              <div className="life-time__block">
                <h3>Gain life-changing insight & self-awareness</h3>
                <p className="life-time__text">
                  Transform every aspect of your daily life through enhanced
                  self-awareness and practical wisdom tools that tap into the
                  profound connection to bliss.
                </p>
              </div>
              <div className="life-time__block">
                <h3>Reconnect with YOU</h3>
                <p className="life-time__text">
                  Enjoy practices that powerfully realign and reconnect you with
                  your authentic self. Guided meditation, yoga, silent
                  self-inquiry, wisdom, and live interactive sessions with our
                  certified instructors—we take care of your journey.
                </p>
              </div>
              <Link
                activeClassName="active"
                className="btn-secondary v2"
                to="registerNowBlock"
                spy={true}
                smooth={true}
                duration={500}
                offset={0}
              >
                Register Today
              </Link>
            </div>
          </div>
        </section>
        <section className="about tw-pb-[200px]">
          <div className="container">
            <h2 className="about__title section-title text-center">
              About the Art of Living
            </h2>
            <div className="row">
              <div className="col-12 col-md-3 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-39-years.svg" alt="years" />
                </div>
                <p className="about__text">
                  <span>40 years</span> of service to society
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-3000-centers.svg" alt="centers" />
                </div>
                <p className="about__text">
                  <span>3,000+ centers</span> worldwide
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-156-countries.svg" alt="countries" />
                </div>
                <p className="about__text">
                  <span>156 countries</span> where our programs made a
                  difference
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-450-m-lives.svg" alt="lives" />
                </div>
                <p className="about__text">
                  <span>450M+ lives</span> touched through our courses & events
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard workshop={data} />
      </HideOn>
    </>
  );
};
