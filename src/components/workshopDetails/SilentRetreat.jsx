import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import CourseDetailsCard from "./CourseDetailsCard";
import { CourseBottomCard } from "./CourseBottomCard";
import { ABBRS, COURSE_TYPES } from "@constants";
import { RegisterPanel } from "./RegisterPanel";
import { HideOn } from "react-hide-on-scroll";

export const SilentRetreat = ({ data }) => {
  SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

  let swiperOption = {
    allowTouchMove: false,
    slidesPerView: 4,
    spaceBetween: 30,
    slidesOffsetBefore: 300,
    preventInteractionOnTransition: true,
    navigation: true,
  };
  if (typeof window !== "undefined") {
    if (window.matchMedia("(max-width: 768px)").matches) {
      swiperOption = {
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
        navigation: false,
      };
    } else if (window.matchMedia("(max-width: 1024px)").matches) {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 2,
        spaceBetween: 30,
        centeredSlides: true,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    } else if (window.matchMedia("(max-width: 1440px)").matches) {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 3,
        spaceBetween: 30,
        slidesOffsetBefore: 150,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    } else {
      swiperOption = {
        allowTouchMove: false,
        slidesPerView: 4,
        spaceBetween: 30,
        slidesOffsetBefore: 300,
        preventInteractionOnTransition: true,
        navigation: true,
      };
    }
  }

  const { title, mode } = data || {};
  return (
    <>
      <main>
        <section class="top-column silent-retreat">
          <div class="container">
            <p class="type-course">{mode}</p>
            <h1 class="course-name">{title}</h1>

            <ul class="course-details-list">
              <li>Discover a profound depth of inner silence</li>
              <li>Enjoy deep rest & rejuvenation</li>
              <li>Begin or renew a restorative meditation practice</li>
            </ul>
            <Link
              activeClass="active"
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
        <section class="why-course">
          <div class="container">
            <h2 class="col-lg-7 p-0 section-title why-course__title">
              Why take few days out of your busy life for a Silent Retreat?
            </h2>
            <p class="col-xl-8 col-lg-7 p-0 why-course__text">
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
        <section class="how-it-works silent-retreat">
          <div class="container">
            <div class="col-xl-6 col-lg-7 p-0">
              <div class="how-it-works__block">
                <h2 class="how-it-works__title silent-retreat__title section-title">
                  Discover just how refreshing silence can be
                </h2>
              </div>
              <div class="how-it-works__list">
                <div class="how-it-works__item">
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
                <div class="how-it-works__item">
                  <p>
                    <span>Create shifts in your life</span>
                  </p>
                  The Silent Retreat can help you drop limiting beliefs, regrets
                  and worries, bringing you more fully into the present moment
                  and into a bigger vision for yourself. You may find a joy that
                  is unshaken by outer circumstances.
                </div>
                <div class="how-it-works__item">
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
              <p class="silent-retreat-condition">
                <span>*</span>
                <span>
                  SKY Breath Meditation is a prerequisite to enroll in the
                  Silent Retreat. You can learn more{" "}
                  <a
                    class="link silent-retreat__link"
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
        <section class="comments silent-retreat">
          <div class="container">
            <h2 class="comments__title section-title text-center">
              How lives are transformed
            </h2>
          </div>
          <div class="comments__video">
            <iframe
              src="https://player.vimeo.com/video/432237531"
              width="100%"
              height="100%"
              frameborder="0"
              allow="autoplay; fullscreen"
              allowfullscreen
            ></iframe>
          </div>
          <Swiper className="px-3 px-lg-0" {...swiperOption}>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/1-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Max Goldberg</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p class="comments__quote">
                “...very, very powerful...such a sense of calm”
              </p>
              <div class="comments__text">
                <p class="short">
                  It was very, very powerful. I gained such a sense of calm,
                  more than I ever could have imagined.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/2-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Julie Madeley</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p class="comments__quote">“relaxed, refreshed, and happier”</p>
              <div class="comments__text">
                <p class="short">
                  It helped me to put into practice the valuable wisdom which I
                  had picked up on the SKY Breath Meditation course. I came away
                  relaxed, refreshed and happier than I had felt for a long
                  time.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/3-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Michelle Garisson</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>
              <p class="comments__quote">“felt more balanced”</p>
              <div class="comments__text">
                <p class="short">
                  I've been on quite a few silent retreats in the past and this
                  felt more balanced, nourishing and comfortable than any other
                  retreat I'd been on.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/4-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Vinita D.</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p class="comments__quote">
                “extremely relaxing, yet energizing experience”
              </p>
              <div class="comments__text">
                <p class="short">
                  The meditations are deep! It was an extremely relaxing yet
                  energizing experience.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/5-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Aarti R.</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p class="comments__quote">“wonderful, peaceful retreat”</p>
              <div class="comments__text">
                <p class="short">
                  A wonderful, peaceful retreat ... extremely joyful and easy.
                </p>
              </div>
            </SwiperSlide>
            <SwiperSlide class="swiper-slide comments__item">
              <div class="comments__person">
                <div class="comments__person-img">
                  <img src="/img/6-silent-comments.png" alt="comments" />
                  <span>“</span>
                </div>
                <div class="comments__person-info">
                  <h3 class="comments__name">Daniel M.</h3>
                  <p class="comments__person-about">
                    Silent Retreat participant
                  </p>
                </div>
              </div>

              <p class="comments__quote">“I feel more like myself”</p>
              <div class="comments__text">
                <p class="short">
                  I feel more like myself after the Silence Retreat. My life
                  goes smoother after it and I feel the difference for a good
                  3-6 months.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>
        <Element name="registerNowBlock">
          <section class="powerful silent-retreat" id="third">
            <div class="container">
              <div class="col-lg-10 p-0 m-auto">
                <h2 class="text-center mb-3 silent-retreat__title">
                  Even just a few minutes of true silence gives a rest far
                  deeper than sleep, and possibly anything else you’ve
                  experienced in life.
                </h2>
                <h2 class="text-center silent-retreat__title">
                  Discover true silence.
                </h2>
                <RegisterPanel workshop={data} />
              </div>
            </div>
          </section>
        </Element>

        <section class="quote-section">
          <div class="container">
            <div class="offset-lg-6">
              <p class="quote-section__name">
                Sri Sri Ravi Shankar
                <span>Founder of The Art of Living</span>
              </p>
              <p class="quote-section__quote">
                “
                <span>
                  True laughter and celebration are born only out of deep
                  silence...
                </span>
              </p>
            </div>
          </div>
        </section>
        <section class="life-time silent-retreat">
          <div class="container">
            <div class="col-xl-5 col-lg-6 p-0">
              <h2 class="life-time__title section-title">
                Renewed energy & focus that lasts the whole year
              </h2>
              <div class="life-time__block">
                <h3>Release deep layers of stress</h3>
                <p class="life-time__text">
                  Experience a set of unique guided meditations, designed by
                  meditation master, Sri Sri Ravi Shankar, geared towards
                  drawing out the deepest layers of stress and tension from the
                  nervous system, leaving you with a feeling of lightness,
                  freedom, energy, and joy.
                </p>
              </div>
              <div class="life-time__block">
                <h3>Gain life-changing insight & self-awareness</h3>
                <p class="life-time__text">
                  Transform every aspect of your daily life through enhanced
                  self-awareness and practical wisdom tools that tap into the
                  profound connection to bliss.
                </p>
              </div>
              <div class="life-time__block">
                <h3>Reconnect with YOU</h3>
                <p class="life-time__text">
                  Enjoy practices that powerfully realign and reconnect you with
                  your authentic self. Guided meditation, yoga, silent
                  self-inquiry, wisdom, and live interactive sessions with our
                  certified instructors—we take care of your journey.
                </p>
              </div>
              <Link
                activeClass="active"
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
        <section class="about" style={{ paddingBottom: "200px" }}>
          <div class="container">
            <h2 class="about__title section-title text-center">
              About the Art of Living
            </h2>
            <div class="row">
              <div class="col-12 col-md-3 text-center about__card">
                <div class="about__logo">
                  <img src="/img/ic-39-years.svg" alt="years" />
                </div>
                <p class="about__text">
                  <span>40 years</span> of service to society
                </p>
              </div>
              <div class="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div class="about__logo">
                  <img src="/img/ic-3000-centers.svg" alt="centers" />
                </div>
                <p class="about__text">
                  <span>3,000+ centers</span> worldwide
                </p>
              </div>
              <div class="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div class="about__logo">
                  <img src="/img/ic-156-countries.svg" alt="countries" />
                </div>
                <p class="about__text">
                  <span>156 countries</span> where our programs made a
                  difference
                </p>
              </div>
              <div class="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div class="about__logo">
                  <img src="/img/ic-450-m-lives.svg" alt="lives" />
                </div>
                <p class="about__text">
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
