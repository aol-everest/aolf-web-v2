/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import dayjs from "dayjs";
import { Link, Element } from "react-scroll";
import { useRouter } from "next/router";
import classNames from "classnames";
import { CourseBottomCard } from "./CourseBottomCard";
import { useGlobalModalContext, useAuth } from "@contexts";
import { ABBRS, MODAL_TYPES } from "@constants";
import { HideOn } from "@components";
import { priceCalculation, tConvert } from "@utils";
import Style from "./CourseDetails.module.scss";
import { pushRouteWithUTMQuery } from "@service";
import queryString from "query-string";
import { Comment } from "./Comment";
import { Swiper, SwiperSlide } from "swiper/react";

export const SKYSilentRetreat = ({ data, swiperOption }) => {
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const router = useRouter();

  const [pastCommentsActiveSlider, setPastCommentsActiveSlider] = useState(0);

  const handlePastCommentsSliderBulletClick = (index) => {
    setPastCommentsActiveSlider(index);
  };

  const {
    title,
    mode,
    eventStartDate,
    eventEndDate,
    timings,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    email,
    phone1,
    phone2,
    sfid,
    productTypeId,
  } = data || {};

  const handleRegister = (e) => {
    e.preventDefault();
    if (authenticated) {
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

  const { fee, delfee } = priceCalculation({ workshop: data });

  const activePastCommentsSliderClass =
    pastCommentsActiveSlider === 0
      ? Style.sliderTransformFirst
      : pastCommentsActiveSlider === 1
      ? Style.sliderTransformSecond
      : Style.sliderTransformThird;

  return (
    <>
      <section className="sky-header">
        <div className="sky-header__image">
          <img src="/img/sky-silent-header.jpg" alt="SKY Silent Retreat" />
        </div>
        <div className="sky-header__container container">
          <div className="sky-header__wrapper">
            <div className="sky-header__status">{mode}</div>
            <h1 className="sky-header__title">{title}</h1>

            <div className="sky-header__description">
              Give yourself the vacation you always wanted…
              <span className="sky-header__description_bold">
                but never knew existed.
              </span>
            </div>

            <div className="sky-header__details details-header">
              <div className="details-header__title">
                A profound, 4-5 day spiritual immersion
              </div>

              <div className="details-header__list">
                <div className="details-header__item">
                  <img
                    className="details-header__item-icon"
                    src="/img/ic-check-blue.svg"
                    alt="header-list-icon"
                  />

                  <div className="details-header__item-text">
                    Do you ever feel like you spend too much time worrying?
                  </div>
                </div>

                <div className="details-header__item">
                  <img
                    className="details-header__item-icon"
                    src="/img/ic-check-blue.svg"
                    alt="header-list-icon"
                  />

                  <div className="details-header__item-text">
                    Is your sense of well being overwhelmed by a flood of
                    anxious thoughts?
                  </div>
                </div>

                <div className="details-header__item">
                  <img
                    className="details-header__item-icon"
                    src="/img/ic-check-blue.svg"
                    alt="header-list-icon"
                  />

                  <div className="details-header__item-text">
                    Or do you feel like life has become a dull, unpleasant
                    routine?
                  </div>
                </div>
              </div>

              <div className="details-header__description">
                If so, the <span>SKY Silent</span> Retreat could be just what
                you need to refresh, recharge, and bring heartfelt joy back into
                your life.
              </div>
            </div>

            <div className="sky-header__actions">
              <Link
                activeClassName="active"
                className="sky-header__register sky-button btn-secondary"
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
      </section>

      <main className="main">
        <section className="sky-course">
          <div className="sky-course__container">
            <div className="sky-course__details">
              <div className="sky-course__title">Course Details</div>
              <div className="sky-course__content course-content">
                <div className="course-content__col">
                  <div className="course-content__body">
                    <div className="course-content__label">Date:</div>
                    <div className="course-content__item">
                      {dayjs
                        .utc(eventStartDate)
                        .isSame(dayjs.utc(eventEndDate), "month") && (
                        <>{`${dayjs
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${dayjs
                          .utc(eventEndDate)
                          .format("DD, YYYY")}`}</>
                      )}
                      {!dayjs
                        .utc(eventStartDate)
                        .isSame(dayjs.utc(eventEndDate), "month") && (
                        <>{`${dayjs
                          .utc(eventStartDate)
                          .format("MMMM DD")}-${dayjs
                          .utc(eventEndDate)
                          .format("MMMM DD, YYYY")}`}</>
                      )}
                    </div>
                  </div>

                  <div className="course-content__body">
                    <div className="course-content__label">Timings:</div>
                    <div className="course-content__list">
                      {timings &&
                        timings.map((time) => {
                          return (
                            <>
                              <div className="course-content__item">
                                {`${dayjs
                                  .utc(time.startDate)
                                  .format("dd")}: ${tConvert(
                                  time.startTime,
                                )}-${tConvert(time.endTime)} ${
                                  ABBRS[time.timeZone]
                                }`}
                              </div>
                            </>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div className="course-content__col">
                  <div className="course-content__body">
                    <div className="course-content__label">Instructor(s):</div>

                    <div className="course-content__list">
                      {primaryTeacherName && (
                        <div className="course-content__item">
                          {primaryTeacherName}
                        </div>
                      )}
                      {coTeacher1Name && (
                        <div className="course-content__item">
                          {coTeacher1Name}
                        </div>
                      )}
                      {coTeacher2Name && (
                        <div className="course-content__item">
                          {coTeacher2Name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="course-content__body">
                    <div className="course-content__label">Contacts:</div>

                    <div className="course-content__list">
                      <a
                        className="course-content__item"
                        href={`tel:${phone1}`}
                      >
                        {phone1}
                      </a>

                      {phone2 && (
                        <a
                          className="course-content__item"
                          href={`tel:${phone2}`}
                        >
                          {phone2}
                        </a>
                      )}

                      <a
                        className="course-content__item"
                        href={`mailto:${email}`}
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sky-meditation">
          <div className="container_md sky-meditation__container">
            <div className="sky-meditation__preview meditation-preview">
              <div className="meditation-preview__title">Phase One</div>
              <h2 className="meditation-preview__description">
                Breathe your stress away with the most powerful breathwork
                meditation of our time
              </h2>

              <img
                className="meditation-preview__background"
                src="/img/meditation-ellipse.png"
                alt="meditation-bg"
              />
            </div>

            <div className="sky-meditation__content meditation-content">
              <div className="meditation-content__text">
                Stress is the single biggest obstacle to happiness in our lives.
                We all face it, but very few of us have been taught how to
                effectively manage it.
              </div>
              <div className="meditation-content__text">
                That’s where <span>SKY Breath Meditation</span> comes in.
              </div>
              <div className="meditation-content__text">
                In phase one of our retreat, you will learn and practice this
                powerful technique that has transformed the lives of millions.
              </div>
              <div className="meditation-content__text">
                SKY has shown remarkable results in stress reduction in more
                than 100 independent, peer-reviewed studies, and the results
                participants experience are nothing short of amazing.
              </div>
            </div>
          </div>
        </section>

        <section className="benefits">
          <div className="benefits__container container_md">
            <div className="benefits__content">
              <h4 className="benefits__title meditation-title">
                So what exactly are the benefits?
              </h4>

              <ul className="benefits__list">
                <li className="benefits__item">
                  <img
                    className="benefits__icon"
                    src="/img/ic-check-fade.svg"
                    alt="benefits-icon"
                  />
                  <div className="benefits__text">
                    Significant reductions in stress, anxiety, and depression
                  </div>
                </li>

                <li className="benefits__item">
                  <img
                    className="benefits__icon"
                    src="/img/ic-check-fade.svg"
                    alt="benefits-icon"
                  />
                  <div className="benefits__text">
                    Increased energy levels and immune function
                  </div>
                </li>

                <li className="benefits__item">
                  <img
                    className="benefits__icon"
                    src="/img/ic-check-fade.svg"
                    alt="benefits-icon"
                  />
                  <div className="benefits__text">Renewed joy in life</div>
                </li>
              </ul>
            </div>
            <div className="benefits__img">
              <img src="/img/benefits-content.png" alt="benefits-content" />
            </div>
          </div>
        </section>

        <section className="highlights">
          <div className="highlights__container">
            <h4 className="highlights__title meditation-title_blue">
              Research highlights
            </h4>

            <div className="highlights__description meditation-title">
              "The Easy Breathing Technique That Can Lower Your Anxiety 44%"
            </div>

            <div className="highlights__logos">
              <div className="highlights__col">
                <img src="/img/research-yoga-gray.png" alt="highlights-img" />
                <img src="/img/research-cnn.png" alt="highlights-img" />
              </div>
              <div className="highlights__col">
                <img
                  src="/img/research-washington-post.png"
                  alt="highlights-img"
                />
                <img src="/img/research-harvard.png" alt="highlights-img" />
              </div>
            </div>
          </div>
        </section>

        <section className="practices">
          <div className="practices__container container_md">
            <h4 className="practices__title">
              Evidence-based practices that reduce stress from the very first
              session
            </h4>

            <div className="practices__row">
              <div className="practices__stats stats-practices">
                <div className="stats-practices__wrapper">
                  <div className="stats-practices__metrics">100</div>
                  <div className="stats-practices__details">
                    independent studies
                  </div>
                </div>

                <div className="stats-practices__sign">
                  on SKY Breath Meditation (SK&P)
                </div>

                <img
                  className="stats-practices__background"
                  src="/img/meditation-ellipse.png"
                  alt="meditation-bg"
                />
              </div>

              <div className="practices__content">
                <p className="practices__text">
                  Studies conducted on four continents and published in
                  peer-reviewed journals by the likes of Harvard and Yale have
                  demonstrated a comprehensive range of benefits from practicing
                  SKY Breath Meditation.
                </p>

                <p className="practices__text">
                  These include statistically significant reductions in stress
                  and anxiety, markers of post traumatic stress disorder, and
                  feelings of depression, as well as increases in deep sleep and
                  overall quality of life.
                </p>

                <p className="practices__text">
                  But don’t take our word for it, have a look for yourself.
                </p>

                <a className="practices__link" href="#">
                  Learn more
                </a>
              </div>
            </div>

            <div className="studies__result">
              <h3 className="studies__result-title section-title">
                Research result key findings
              </h3>
              <div className="studies__list">
                <div className="container col-12 col-lg-10">
                  <div className="row">
                    <div className="col-12 col-md-3 studies__item studies__item_violet">
                      <h3>Deep Sleep Increases</h3>

                      <div className="studies__item-img">
                        218%
                        <img src="/img/ic-arrow-violet.svg" alt="violet" />
                      </div>

                      <div className="studies__item-text">
                        <h3>Deep Sleep Increases</h3>
                        <p>
                          <span>INCREASE</span>
                          in deep sleep
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-3 studies__item studies__item_violet">
                      <h3>Well-Being Hormones Increase</h3>

                      <div className="studies__item-img">
                        50%
                        <img src="/img/ic-arrow-violet.svg" alt="violet" />
                      </div>

                      <div className="studies__item-text">
                        <h3>Well-Being Hormones Increase</h3>
                        <p>
                          <span>INCREASE</span>
                          serum prolactin
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-3 studies__item studies__item_blue">
                      <h3>Depression Decreases</h3>

                      <div className="studies__item-img">
                        70%
                        <img src="/img/ic-arrow-blue.svg" alt="blue" />
                      </div>

                      <div className="studies__item-text">
                        <h3>Depression Decreases</h3>
                        <p>
                          <span>REMISSION RATE</span> in depression in 1 month
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-3 studies__item studies__item_blue">
                      <h3>Stress Hormones Decrease</h3>

                      <div className="studies__item-img">
                        56%
                        <img src="/img/ic-arrow-blue.svg" alt="blue" />
                      </div>

                      <div className="studies__item-text">
                        <h3>Stress Hormones Decrease</h3>
                        <p>
                          <span>REDUCTION</span>
                          serum cortisol
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="comments">
          <div className="container">
            <h2 className="comments__title section-title text-center">
              The data is impressive, but what are real people saying about SKY
            </h2>
          </div>

          <div className="comments__video">
            <iframe
              src="https://player.vimeo.com/video/428103610"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
          <Swiper className="px-3 px-lg-0" {...swiperOption}>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="When I come to work having already centered myself, it's way easier to plan... delegate tasks to other people, or work with other people. Now I come to work in a much better mindset, and that in turn translates into the quality of work and the way I deal with people at work. Just the way I process emotions, thoughts, and feelings is different from before."
                fullText="When I come to work having already centered myself, it's way easier to plan... delegate tasks to other people, or work with other people. Now I come to work in a much better mindset, and that in turn translates into the quality of work and the way I deal with people at work. Just the way I process emotions, thoughts, and feelings is different from before."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img
                        className="rounded-circle tw-w-full tw-h-full"
                        src="/img/Dan-Joy.jpg"
                        alt="comments"
                      />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Dan J. </h3>
                      <p className="comments__person-about">
                        Chef
                        <br />
                        Asheville, NC
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">
                    “Come to Work in a Better Mindset”
                  </p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="I joined the Happiness program after an introductory meet up
                    at the Art of Living Center. It felt like it could be a
                    great program for me, and before I could change my mind, I
                    signed up for it. If I had waited until later to join, I
                    would have missed out on a truly life transforming
                    experience. The program gave me great insights and practical
                    too…"
                fullText="I joined the Happiness program after an introductory meet up
                    at the Art of Living Center. It felt like it could be a
                    great program for me, and before I could change my mind, I
                    signed up for it. If I had waited until later to join, I
                    would have missed out on a truly life transforming
                    experience. The program gave me great insights and practical
                    tools to dealing with life's stressful situations. I met
                    some really good friends that I still stay in contact with."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/2-comments.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Tiffany Guynes</h3>
                      <p className="comments__person-about">
                        Chef & private caterer,
                        <br />
                        Austin, TX
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">
                    “Great insights and practical tools”
                  </p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="Before the Happiness Program, I was on medication for panic
                    and anxiety attacks. After the first day of the Happiness
                    Program, I experienced a full night’s sleep, which was rare
                    for me. The next morning was one of the happiest I had ever
                    felt. I’ve been constant with my SKY meditation practice for
                    the..."
                fullText="Before the Happiness Program, I was on medication for panic
                    and anxiety attacks. After the first day of the Happiness
                    Program, I experienced a full night’s sleep, which was rare
                    for me. The next morning was one of the happiest I had ever
                    felt. I’ve been constant with my SKY meditation practice for
                    the last two years - it makes me feel so alive. My friends
                    and family tell me that I am much more confident and
                    happier. Despite the struggles last year - my grandfather
                    passed away, I lost my job and I went through a divorce - I
                    still did not have a panic or anxiety attack. I feel
                    grateful for this inner strength because I don’t know where
                    I would be without it."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/3-comments.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Robert Delmont</h3>
                      <p className="comments__person-about">
                        Elementary music teacher,
                        <br />
                        Boston, MA
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">
                    “Much more confident and happier, despite the struggles”
                  </p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="I was at the height of my career, with a high profile job
                    and a wonderful family. But stress was taking a toll on my
                    physical and mental health – and I was relying on
                    antibiotics and pain medicine regularly. Practicing SKY
                    Meditation has reduced my stress levels and improved my
                    immune system…"
                fullText="I was at the height of my career, with a high profile job
                    and a wonderful family. But stress was taking a toll on my
                    physical and mental health – and I was relying on
                    antibiotics and pain medicine regularly. Practicing SKY
                    Meditation has reduced my stress levels and improved my
                    immune system dramatically. I haven’t needed medication for
                    4 years now! This course is the best financial investment I
                    have made in myself"
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/4-comments.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Uma Vishwanath</h3>
                      <p className="comments__person-about">
                        Team lead in a high-tech company,
                        <br />
                        Lexington, MA
                      </p>
                    </div>
                  </div>

                  <p className="comments__quote">
                    “The best financial investment I have made in myself”
                  </p>
                </>
              </Comment>
            </SwiperSlide>
          </Swiper>
        </section>

        <section className="silence">
          <div className="container_md silence__container">
            <div className="silence__preview meditation-preview">
              <div className="meditation-preview__title">Phase Two</div>
              <h2 className="meditation-preview__description">
                Go deep with the art of silence
              </h2>

              <img
                className="meditation-preview__background"
                src="/img/meditation-ellipse.png"
                alt="meditation-bg"
              />
            </div>

            <div className="silence__image">
              <img src="/img/silence-img.png" alt="silence-bg" />
            </div>
          </div>
        </section>

        <section className="occupation">
          <div className="container_md occupation__container">
            <div className="occupation__player player-occupation">
              <div className="comments__video">
                <iframe
                  src="https://player.vimeo.com/video/432237531?wmode=opaque"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            <div className="occupation__body">
              <h6 className="occupation__title paragraph-title">
                Build on your experience of freedom from SKY Breath Meditation.
              </h6>

              <ul className="occupation__list">
                <li className="occupation__item">
                  <img
                    className="occupation__icon"
                    src="/img/ic-house.svg"
                    alt="occupation-icon"
                  />
                  <div className="occupation__text">
                    Experience the rejuvenating effects of silence
                  </div>
                </li>

                <li className="occupation__item">
                  <img
                    className="occupation__icon"
                    src="/img/ic-meditation.svg"
                    alt="occupation-icon"
                  />
                  <div className="occupation__text">
                    Go deeper with advanced guided chakra-based meditation,
                    advanced pranayama, and gentle yoga
                  </div>
                </li>

                <li className="occupation__item">
                  <img
                    className="occupation__icon"
                    src="/img/ic-bulb.svg"
                    alt="occupation-icon"
                  />
                  <div className="occupation__text">
                    Realign with your inner truth
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="experience">
          <div className="container_md experience__container meditation-row">
            <div className="experience__preview">
              <div className="experience__content">
                <h2 className="experience__title block-title">
                  Silence and deep meditation for everyone
                </h2>

                <div className="experience__description">
                  Many people recognize the tremendous benefit that meditation
                  can offer, but feel unable to experience it for themselves.
                  They want to meditate, but their mind just won’t stop racing.
                </div>

                <p className="experience__sign">
                  Phase two or our <span>SKY Silent Retreat</span> offers the
                  solution.
                </p>
              </div>

              <img
                className="experience__background"
                src="/img/meditation-ellipse.png"
                alt="meditation-bg"
              />
            </div>

            <div className="experience__cards">
              <div className="experience__card card-experience">
                <img
                  src="/img/experience-1.png"
                  className="card-experience__image"
                  alt="experience-img"
                />
                <div className="card-experience__content">
                  <h6 className="card-experience__title">
                    Experience deep rest and rejuvenation
                  </h6>
                  <p className="card-experience__text">
                    After de-stressing with SKY Breath Meditation in phase one,
                    participants are primed and ready to experience the deep
                    rest and rejuvenation that come in meditation.
                  </p>
                </div>
              </div>

              <div className="experience__card card-experience">
                <img
                  src="/img/experience-2.png"
                  className="card-experience__image"
                  alt="experience-img"
                />
                <div className="card-experience__content">
                  <h6 className="card-experience__title">
                    Break the cycle of negative thinking
                  </h6>
                  <p className="card-experience__text">
                    The silent phase of our retreat provides optimal conditions
                    for sinking deep within and breaking the cycle of negative
                    thinking.
                  </p>
                </div>
              </div>

              <div className="experience__card card-experience">
                <img
                  src="/img/experience-3.png"
                  className="card-experience__image"
                  alt="experience-img"
                />
                <div className="card-experience__content">
                  <h6 className="card-experience__title">
                    Experience the bliss of meditation
                  </h6>
                  <p className="card-experience__text">
                    Each day is carefully crafted to offer the most relaxing and
                    transformational experience possible, allowing even the
                    busiest-minded participants to experience the bliss of
                    meditation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pillars">
          <div className="pillars__container container_md">
            <h3 className="pillars__title block-title">
              Pillars of the silence phase
            </h3>

            <ul className="pillars__list">
              <li className="pillars__item pillar">
                <img
                  className="pillar__icon"
                  src="/img/ic-mediation-fade.svg"
                  alt="pillars-icon"
                />
                <h6 className="pillar__title">Deep Meditations</h6>
                <p className="pillar__description">
                  Experience guided meditations created by Gurudev designed
                  specifically to draw out the deepest layers of stress and
                  tension from our nervous systems. These “Hollow and Empty”
                  sessions guide new practitioners and seasoned meditators alike
                  into deep meditation.
                </p>
              </li>

              <li className="pillars__item pillar">
                <img
                  className="pillar__icon"
                  src="/img/ic-calm-fade.svg"
                  alt="pillars-icon"
                />
                <h6 className="pillar__title">Silence</h6>
                <p className="pillar__description">
                  True silence means more than just not speaking. It means
                  taking a break from the storm of mental chatter constantly
                  raging in our minds. Our course is specially designed to allow
                  true silence to dawn, and the results are astounding.
                </p>
              </li>

              <li className="pillars__item pillar">
                <img
                  className="pillar__icon"
                  src="/img/ic-energy-fade.svg"
                  alt="pillars-icon"
                />
                <h6 className="pillar__title">Mudras and Pranayama</h6>
                <p className="pillar__description">
                  Here we build upon the breathing exercises taught during SKY
                  Breath Meditation and teach a series of mudra/pranayama
                  combinations that positively affect the subtle flow of energy
                  in our systems, balancing the mind and emotions.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <section className="offer">
          <div className="offer__container container_md">
            <h3 className="offer__title block-title">
              Experience powerful shifts for less than a cup of coffee a day
            </h3>

            <div className="offer__row meditation-row">
              <div className="offer__questions">
                <h6 className="offer__subtitle">How much do we spend on</h6>

                <div className="offer__list">
                  <div className="offer__item">
                    <img
                      className="offer__item-icon"
                      src="/img/ic-plate.svg"
                      alt="offer-icon"
                    />
                    <p className="offer__item-info">A dinner out for 4?</p>
                  </div>

                  <div className="offer__item">
                    <img
                      className="offer__item-icon"
                      src="/img/ic-coffee.svg"
                      alt="offer-icon"
                    />
                    <p className="offer__item-info">A Starbucks habit?</p>
                  </div>

                  <div className="offer__item">
                    <img
                      className="offer__item-icon"
                      src="/img/ic-gym-blue.svg"
                      alt="offer-icon"
                    />
                    <p className="offer__item-info">Going to the gym?</p>
                  </div>
                </div>
              </div>

              <div className="offer__content">
                <p className="offer__text">
                  A gym membership can easily cost you upwards of{" "}
                  <span>$650</span> a year.
                </p>
                <p className="offer__text">
                  A daily Starbucks habit? That’s <span>$1,100</span> a year or
                  more when you add it all up, according to a recent study of
                  1,008 coffee drinkers!
                </p>
                <p className="offer__text">
                  How much do we invest in a calm and clear mind? In feeling
                  energized and excited about life? In equipping ourselves with
                  tools to clear the mind and boost your energy — so that you
                  can better care for your family, your friends, and your work?
                </p>
                <p className="offer__text">
                  Imagine waking up each day, knowing you have a morning routine
                  that leaves you strong, calm, and ready to face your day,
                  whatever comes.
                </p>
                <p className="offer__text">
                  Now’s your chance. For <span>$495</span>, less cost and more
                  energy than a cup of coffee a day.
                </p>
              </div>
            </div>
            <Element name="registerNowBlock">
              <div className="offer__banner banner-offer">
                <h5 className="banner-offer__title meditation-title_blue">
                  Limited time offer
                </h5>

                <div className="banner-offer__price block-title">
                  SKY Silent Retreat: ${fee}
                </div>

                <div className="banner-offer__discount">
                  Regular course cost: <span>${delfee}</span>
                </div>

                <button
                  className="banner-offer__register sky-button btn-secondary"
                  onClick={handleRegister}
                >
                  Register today
                </button>
              </div>
            </Element>
          </div>
        </section>

        <section className="sky-reviews">
          <div className="sky-reviews__container container_md">
            <h3 className="sky-reviews__title block-title">
              Here’s what past participants are saying
            </h3>

            <div className="swiper sky-reviews__slider">
              <div
                className={classNames(
                  "swiper-wrapper reviews__wrapper",
                  activePastCommentsSliderClass,
                )}
              >
                <div className="swiper-slide reviews__slide review-card">
                  <img
                    src="/img/daniel-moss.jpg"
                    className="review-card__logo"
                    alt="review-logo"
                  />

                  <h6 className="review-card__title">Daniel Moss</h6>
                  <div className="review-card__description">
                    Long Island, NY
                  </div>

                  <div className="review-card__rating">
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                  </div>

                  <p className="review-card__text">
                    I feel more like myself after the silent retreat. My life
                    goes smoother after, and I feel the difference for a good
                    3-6 months
                  </p>

                  <div className="review-card__quotes">
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                  </div>
                </div>

                <div className="swiper-slide reviews__slide review-card">
                  <img
                    src="/img/max-goldberg.png"
                    className="review-card__logo"
                    alt="review-logo"
                  />

                  <h6 className="review-card__title">Max Goldberg</h6>
                  <div className="review-card__description">
                    Santa Clara, CA
                  </div>

                  <div className="review-card__rating">
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                  </div>

                  <p className="review-card__text">
                    It was very, very powerful. I gained such a sense of calm,
                    more than I ever could have imagined.
                  </p>

                  <div className="review-card__quotes">
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                  </div>
                </div>

                <div className="swiper-slide reviews__slide review-card">
                  <img
                    src="/img/julie-madeley.jpg"
                    className="review-card__logo"
                    alt="review-logo"
                  />

                  <h6 className="review-card__title">Julie Madeley</h6>
                  <div className="review-card__description">Atlanta, GA</div>

                  <div className="review-card__rating">
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                    <img
                      className="review-card__star"
                      src="/img/ic-star.svg"
                      alt="rating-icon"
                    />
                  </div>

                  <p className="review-card__text">
                    It helped me to put into practice the valuable wisdom I
                    picked up with SKY Breath Meditation. I came away relaxed,
                    refreshed, and happier than I had felt in a long time.
                  </p>

                  <div className="review-card__quotes">
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                    <img src="/img/ic-quote.svg" alt="review-quotes-icon" />
                  </div>
                </div>
              </div>

              <div className="swiper-pagination sky-reviews__pagination reviews__pagination swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal">
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active":
                      pastCommentsActiveSlider === 0,
                  })}
                  tabIndex="0"
                  role="button"
                  aria-label="Go to slide 1"
                  aria-current={pastCommentsActiveSlider === 0}
                  onClick={() => handlePastCommentsSliderBulletClick(0)}
                ></span>
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active":
                      pastCommentsActiveSlider === 1,
                  })}
                  tabIndex="0"
                  role="button"
                  aria-label="Go to slide 2"
                  aria-current={pastCommentsActiveSlider === 1}
                  onClick={() => handlePastCommentsSliderBulletClick(1)}
                ></span>
                <span
                  className={classNames("swiper-pagination-bullet", {
                    "swiper-pagination-bullet-active":
                      pastCommentsActiveSlider === 2,
                  })}
                  tabIndex="0"
                  role="button"
                  aria-label="Go to slide 3"
                  aria-current={pastCommentsActiveSlider === 2}
                  onClick={() => handlePastCommentsSliderBulletClick(2)}
                ></span>
              </div>
            </div>
          </div>
        </section>

        <section className="transformations">
          <div className="transformations__container container_sm">
            <h3 className="transformations__title">
              Are you ready for real transformation?
            </h3>

            <div className="transformations__list">
              <div className="transformations__item">
                Give yourself the gift of true rest and rejuvenation with our
                SKY Silent Retreat, and experience the bliss of a real vacation.
              </div>
              <div className="transformations__item">
                Vacate the stress, vacate the worry, vacate the cycle of
                negative thinking, and get back to being your best self.
              </div>
              <div className="transformations__item">
                You will leave feeling calm, centered, and happy; with
                evidence-based tools to help you maintain your new glow.
              </div>
            </div>
          </div>
        </section>

        <section className="retreat">
          <div className="container_md retreat__container">
            <div className="retreat__row meditation-row">
              <div className="meditation-preview retreat__preview">
                <h3 className="retreat__title block-title">
                  Refresh and recharge with the SKY Silent Retreat, and give
                  yourself the gift of a lifetime
                </h3>

                <img
                  className="retreat__background meditation-preview__background"
                  src="/img/meditation-ellipse.png"
                  alt="meditation-bg"
                />

                <Link
                  activeClassName="active"
                  className="retreat__register sky-button btn-secondary"
                  to="registerNowBlock"
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-100}
                >
                  Register
                </Link>
              </div>

              <div className="retreat__img">
                <img src="/img/retreat-bg.png" alt="retreat-img" />
              </div>

              <Link
                activeClassName="active"
                className="retreat__register_responsive sky-button btn-secondary"
                to="registerNowBlock"
                spy={true}
                smooth={true}
                duration={500}
                offset={-100}
              >
                Register
              </Link>
            </div>
          </div>
        </section>

        <section className="about-sky">
          <div className="about-sky__container container_sm">
            <h3 className="about-sky__title block-title">
              About the Art of Living
            </h3>

            <div className="about-sky__list">
              <div className="about-sky__item about-item">
                <img
                  className="about-item__icon"
                  src="/img/ic-hearts-blue.svg"
                  alt="about-item-icon"
                />
                <h6 className="about-item__title">42 years</h6>
                <p className="about-item__info">of service to society</p>
              </div>

              <div className="about-sky__item about-item">
                <img
                  className="about-item__icon"
                  src="/img/ic-world-blue.svg"
                  alt="about-item-icon"
                />
                <h6 className="about-item__title">10,000+ centers</h6>
                <p className="about-item__info">worldwide</p>
              </div>

              <div className="about-sky__item about-item">
                <img
                  className="about-item__icon"
                  src="/img/ic-geo-blue.svg"
                  alt="about-item-icon"
                />
                <h6 className="about-item__title">180 countries</h6>
                <p className="about-item__info">
                  where our programs made a difference
                </p>
              </div>

              <div className="about-sky__item about-item">
                <img
                  className="about-item__icon"
                  src="/img/ic-social-blue.svg"
                  alt="about-item-icon"
                />
                <h6 className="about-item__title">500M+ lives</h6>
                <p className="about-item__info">
                  touched through our courses & events
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* <div className="course-bottom-card d-block">
        <div className="container_md">
          <div className="course-bottom-card__container">
            <div className="course-bottom-card__info-block">
              <div className="course-bottom-card__img d-none d-lg-block">
                <img src="/img/footer-bg.png" alt="img" />
              </div>
              <div className="course-bottom-card__info">
                <p>March 25-27, 2022</p>
                <div>
                  <h6 className="course-bottom-card__info-course-name">
                    SKY Silent Retreat
                  </h6>
                  <ul>
                    <li>
                      <b className="course-bottom-card__discount">
                        Limited offer $495 <span>$815</span>
                      </b>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <button className="course-bottom-card__register sky-button btn-secondary">
              Register now
            </button>
          </div>
        </div>
      </div> */}
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard workshop={data} />
      </HideOn>
    </>
  );
};
