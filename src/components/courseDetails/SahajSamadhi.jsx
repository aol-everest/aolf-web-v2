import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, Element, animateScroll as scroll } from "react-scroll";
import CourseDetailsCard from "./CourseDetailsCard";
import { Comment } from "./Comment";
import { CourseBottomCard } from "./CourseBottomCard";
import { ALERT_TYPES, COURSE_TYPES } from "@constants";
import { RegisterPanel } from "./RegisterPanel";
import { HideOn } from "react-hide-on-scroll";
import { useGlobalAlertContext } from "@contexts";

export const SahajSamadhi = ({ data, swiperOption }) => {
  const { showAlert } = useGlobalAlertContext();

  const showResearchModal = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: "Success",
      className: "research-detail-modal",
      hideConfirm: true,
    });
  };

  const { title, mode } = data || {};
  return (
    <>
      <main>
        <section className="top-column sahaj-samadhi">
          <div className="container">
            <p className="type-course">{mode}</p>
            <h1 className="course-name">
              {title}
              <span>&trade;</span>
            </h1>

            <ul className="course-details-list">
              <li>Discover lasting calm with clear focus</li>
              <li>Reduce stress, worry, and anxiety</li>
              <li>
                Incredibly easy to learn and practice: <br />
                Start to experience positive results from week one
              </li>
            </ul>

            <Link
              activeClassName="active"
              className="btn-secondary v2"
              to="registerNowBlock"
              spy={true}
              smooth={true}
              duration={500}
              offset={-100}
            >
              Register Now
            </Link>
          </div>
          <CourseDetailsCard
            workshop={data}
            courseType={COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION}
          ></CourseDetailsCard>
        </section>
        <section className="meditation-details sahaj-details">
          <div className="container mb-4">
            <div className="meditation-details__block">
              <h2 className="meditation-details__block__title meditation-details__block__title-main">
                Meditation is easier than you think
              </h2>
              <p className="meditation-details__block__text">
                Meditation doesn’t need to be difficult, either to learn or to
                practice. In fact, it’s probably easier than you think. And the
                science shows that meditation helps you feel and perform better
                in all areas of life from lowering stress to improving
                relationships, from sleep to overall health. Who wouldn’t want
                that?
              </p>
            </div>
          </div>
          <div className="meditation-details__img">
            <img
              src="/img/sahaj-samadhi-woman-mobile.png"
              className="w-100 h-100"
              alt=""
            />
          </div>
          <div className="container">
            <div className="meditation-details__block meditation-details__block-second">
              <h2 className="meditation-details__block__title">
                A powerful way to meditate, naturally
              </h2>
              <p className="meditation-details__block__text">
                You’ll learn a practice called “Sahaj Samadhi Meditation”. Sahaj
                means effortless. Samadhi means a state of true meditation.
                Simply put, it’s an effective, personalized way to easily enter
                into a deep meditative state. Using the power of ancient sound,
                or mantra, you can effortlessly cut through mental chatter and
                connect with a state of deep rest and relaxation.
              </p>
            </div>

            <div className="meditation-details__unique">
              <h6 className="meditation-details__unique__title">
                What makes Sahaj Samadhi Meditation unique?
              </h6>
              <ul className="meditation-details__unique__list">
                <li>
                  <span>
                    Perfect complement to deepen and strengthen your SKY
                    practice
                  </span>
                </li>
                <li>
                  <span>
                    Classes capped at 10 people for personal attention
                  </span>
                </li>
                <li>
                  <span>
                    Learn a personalized meditation practice with a certified
                    instructor. All instructors have a minimum of five years
                    prior teaching experience. So you’re in good hands!
                  </span>
                </li>
                <li>
                  <span>Easy to learn, yet effective</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section className="meditation">
          <div className="container">
            <h6 className="meditation__title">
              Meditation: it’s a global phenomenon
            </h6>
            <h2 className="meditation__quote">
              When you meditate, you’re not alone. You’re part of a movement
              towards mental wellness that has touched{" "}
              <span>over 40 million lives</span> worldwide.
            </h2>
          </div>
        </section>
        <section className="steps">
          <div className="container">
            <h3 className="steps__title">
              3 easy steps to start a meditation practice that works for you
            </h3>
            <div className="steps__list">
              <div className="steps__step">
                <div className="steps__step__number">
                  <span>1</span>
                </div>
                <p className="steps__step__text">
                  Join a class LIVE ONLINE with a certified meditation
                  instructor.
                </p>
              </div>
              <div className="steps__step">
                <div className="steps__step__number">
                  <span>2</span>
                </div>
                <p className="steps__step__text">
                  Get real time answers to your questions as you train and
                  practice together with your teacher in a small group.
                </p>
              </div>
              <div className="steps__step">
                <div className="steps__step__number">
                  <span>3</span>
                </div>
                <p className="steps__step__text">
                  Download the app to get further content and guided practice.
                </p>
              </div>
            </div>
            <Link
              activeClassName="active"
              className="btn-secondary v2"
              to="registerNowBlock"
              spy={true}
              smooth={true}
              duration={500}
              offset={-100}
            >
              Register Today
            </Link>
          </div>
        </section>

        <section className="comments sahaj-samadhi">
          <div className="container">
            <h2 className="comments__title text-center">
              Why Sahaj Samadhi Meditation<span>&trade;</span>&nbsp;?
            </h2>
            <p className="comments__subtitle text-center">
              The benefits of meditation are many. Here are some that
              participants share:
            </p>
          </div>
          <Swiper className="px-3 px-lg-0" {...swiperOption}>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment shortText="I am enjoying the calmness and peace that comes with Sahaj Samadhi meditation.">
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/1-sahaj-comment.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Dr. Lewis</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">Calmness and peace</p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="Sahaj Samadhi allows me to tap into a reservoir of energy, which leaves me rejuvenated
                                and revitalized, like a new person."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/2-sahaj-comment.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Brian</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">Reservoir of energy</p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment shortText="I got so happy for no reason. I hadn’t experienced that in a long time.">
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <img src="/img/slider-bg.png" alt="comments" />
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Phillip</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">Happy</p>
                </>
              </Comment>
            </SwiperSlide>
          </Swiper>
        </section>
        <section className="research sahaj-samadhi">
          <div className="container">
            <h2 className="research__title">The research behind meditation</h2>
            <p className="research__text">
              From the cover of Time Magazine to more than 3,000 scientific
              studies, the benefits of meditation are becoming clearer and
              clearer. Sahaj Samadhi itself has been shown in independent
              research to significantly reduce anxiety and depression. Here are
              just some of the scientifically validated benefits of meditation:
            </p>
            <div className="research__list">
              <div className="research__list__item">
                <h6>Experience deeper sleep</h6>
                <p>Nix insomnia and have deeper, more restorative sleep.</p>
              </div>

              <div className="research__list__item">
                <h6>Decrease anxiety and increase happiness</h6>
                <p>
                  Meditation increases activity in those parts of the brain
                  responsible for happiness and other positive emotions.
                </p>
              </div>

              <div className="research__list__item">
                <h6>Improve mental focus</h6>
                <p>
                  Meditation has been associated with increased blood flow to
                  the brain and increased activity in the brain region
                  responsible for mental focus and executive function.
                </p>
              </div>

              <div className="research__list__item">
                <h6>Promote longevity</h6>
                <p>
                  Quieting the brain through meditation helps you live longer.
                  Meditation slows the shortening of telomeres (the caps at the
                  end of our chromosomes). Longer telomeres mean slower aging.
                </p>
              </div>
            </div>
          </div>
          <div className="research__list__mobile-img">
            <img
              src="/img/bg-mobile-research.png"
              className="w-100 h-100"
              alt=""
            />
          </div>
        </section>
        <Element name="registerNowBlock">
          <section className="powerful silent-retreat">
            <div className="container">
              <div className="col-lg-10 p-0 m-auto" id="third">
                <RegisterPanel workshop={data} />
              </div>
            </div>
          </section>
        </Element>
        <section className="experiences">
          <div className="container">
            <h2 className="experiences__title text-center">More experiences</h2>
            <p className="experiences__subtitle text-center">
              The benefits of meditation are many. Here are some that
              participants share:
            </p>
          </div>
          <Swiper className="px-3 px-lg-0" {...swiperOption}>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="Sahaj Samadhi is helping me to feel calmer and less anxious, but best of all it has
                                helped me to wake up early in the mornings feeling more relaxed, productive, and
                                happier. Also, things are smoother at work."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <span className="comments__person-img_none">M</span>
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Manu</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">
                    Helping me to feel calmer and less anxious
                  </p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment shortText="My mind became clear and I became more comfortable in my body.">
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <span className="comments__person-img_none">P</span>
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Patricia</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>
                  <p className="comments__quote">My mind became clear</p>
                </>
              </Comment>
            </SwiperSlide>
            <SwiperSlide className="swiper-slide comments__item">
              <Comment
                shortText="I always feel more peace of mind…I have a knee that’s giving me trouble. After the
                                session I have less sense of the pain. It sort of overrides the physical issues."
              >
                <>
                  <div className="comments__person">
                    <div className="comments__person-img">
                      <span className="comments__person-img_none">A</span>
                      <span>“</span>
                    </div>
                    <div className="comments__person-info">
                      <h3 className="comments__name">Alison</h3>
                      <p className="comments__person-about">
                        Sahaj Samadhi participant
                      </p>
                    </div>
                  </div>

                  <p className="comments__quote">
                    Better able to manage physical pain”
                  </p>
                </>
              </Comment>
            </SwiperSlide>
          </Swiper>
        </section>

        <section className="details">
          <div className="container"></div>
        </section>
      </main>
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard workshop={data} />
      </HideOn>
    </>
  );
};
