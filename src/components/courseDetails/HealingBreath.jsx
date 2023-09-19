/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { HideOn } from "@components";
import { COURSE_TYPES, MODAL_TYPES } from "@constants";
import { useAuth, useGlobalModalContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { useRouter } from "next/router";
import queryString from "query-string";
import { Link } from "react-scroll";
import { Swiper, SwiperSlide } from "swiper/react";
import { CourseBottomCard } from "./CourseBottomCard";
import CourseDetailsCard from "./CourseDetailsCard";
import { ResearchPaginationHB } from "./ResearchPaginationHB";

export const HealingBreath = ({ data, swiperOption }) => {
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const router = useRouter();

  const { title, workshopTotalHours, mode, sfid, productTypeId } = data || {};

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

  const autoSwiperOption = {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
      delay: 2000,
    },
    pagination: {
      el: ".research__list-pagination",
      clickable: true,
    },
  };

  return (
    <>
      <main>
        <section className="top-column">
          <div className="container">
            <p className="type-course">{mode}</p>
            <h1 className="course-name">{title}</h1>
            <ul className="course-details-list">
              <li>Relieve stress, anxiety, and tension</li>
              <li>Improve your energy & calm</li>
              <li>Experience deep meditation</li>
            </ul>
            <Link
              activeClassName="active"
              className="btn-secondary v2"
              to="registerNowBlock"
              onClick={handleRegister}
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
            courseType={COURSE_TYPES.HEALING_BREATH}
          ></CourseDetailsCard>
        </section>
        <section className="progress-section">
          <div className="container">
            <h5 className="progress-section__title">
              Discover the transformation that 4,000+
              <br />
              <span>healthcare professionals</span> have
              <br />
              experienced since 2016.
            </h5>
            <div className="achivment">
              <div className="row">
                <div className="col-12 col-lg-3 text-center text-lg-left">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img
                        src="/img/ic-70-independent-studies.svg"
                        alt="years"
                      />
                    </div>
                    <h6 className="achivment__title">
                      Backed by 100+ <br />
                      independent studies
                    </h6>
                    <p className="achivment__text">
                      <span>2x</span> better sleep <br />
                      <span> 56% </span> reduced anxiety <br />
                      <span>5x</span> improved immunity
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-4 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/ic-3-day-online-course.svg" alt="day" />
                    </div>
                    <h6 className="achivment__title">
                      3-Day {mode}
                      <br />
                      course
                    </h6>
                    <p className="achivment__text">
                      {workshopTotalHours} hours a day live interactive sessions
                      with certified instructors
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-4 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/ic-comfort-of-your-home.svg" alt="day" />
                    </div>
                    <h6 className="achivment__title">SKY community</h6>
                    <p className="achivment__text">
                      You’ll have access to online follow-up sessions to help
                      support your continual self-care journey
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-3 text-center text-lg-left mt-4 mt-lg-0">
                  <div className="logo-achivment">
                    <div className="achivment__logo">
                      <img src="/img/ic-limited-time-only.svg" alt="day" />
                    </div>
                    <h6 className="achivment__title">
                      CEs available for every
                      <br />
                      hour of attendance
                    </h6>
                    <p className="achivment__text">
                      Accredited program by NYU
                      <br />
                      Langone School of Medicine
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="featured-in">
              <h2 className="featured-in__title">Featured in</h2>
              <div className="featured-in__box d-none d-lg-flex">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-tnyt.png" alt="tnyt" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
              </div>
              <div className="featured-in__box d-flex d-lg-none">
                <img src="/img/featured-in-cnn.png" alt="cnn" />
                <img src="/img/featured-in-yoga.png" alt="yoga" />
                <img src="/img/featured-in-nbc.png" alt="nbc" />
                <img src="/img/featured-in-wsj.png" alt="wsj" />
                <img src="/img/featured-in-forbes.png" alt="forbes" />
                <img src="/img/featured-in-time.png" alt="time" />
                <img
                  className="m-auto"
                  src="/img/featured-in-tnyt.png"
                  alt="tnyt"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="how-it-works how-it-works_alt">
          <div className="container">
            <div className="how-it-works__block">
              <h2 className="how-it-works__title section-title">
                Our Program:
              </h2>
            </div>
            <div className="how-it-works__list">
              <div className="how-it-works__item">
                <ul>
                  <li>
                    <span>
                      Our resilience programs help healthcare professionals cope
                      with stress, resulting in a greater sense of calm and
                      focus.
                    </span>
                  </li>
                  <li>
                    <span>
                      Our research-backed techniques can help individuals manage
                      burnout and regain a feeling of increased energy and
                      balance in their lives.
                    </span>
                  </li>
                  <li>
                    <span>
                      Our interactive well-being course allows participants to
                      access that inner quiet space within each of us amid all
                      the external chaos.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="comments">
          <div className="container">
            <h2 className="comments__title section-title text-center">
              How this workshop is changing lives
            </h2>
          </div>
          <div className="comments__video">
            <iframe
              src="https://player.vimeo.com/video/555823694"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
          <div className="container mb-5">
            <h2 className="comments__title section-title text-center">
              Testimonials
            </h2>
          </div>
          <Swiper className="px-3 px-lg-0 comments__item_new" {...swiperOption}>
            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  I feel humane. I have all the clinical skills to teach me not
                  to feel bad, to be professional, to keep up with everything
                  around me. This course helped me accept and deal with things
                  and process what I can control and take things as it is.
                </p>
              </div>
              <p className="comments__quote text-right">
                - Sokhamony Pheng,
                <br /> Mental Health Caseworker
              </p>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  The providers thoroughly enjoyed the class and found the
                  techniques learned and taught to be tremendously beneficial
                  for their overall health and well-being. Per the evaluations,
                  the providers appreciated the overall content and structure of
                  the class. In addition, the participants found profound
                  differences within themselves and with their overall emotional
                  and mental well-being.
                </p>
              </div>
              <p className="comments__quote text-right">
                - Kaiser Permanente Staff
              </p>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  Fabulous! Excellent! Very Positive! I will recomment it to
                  everyone I know. All physicians need it! Excellent!
                  Outstanding program! Good! Great! Fantastic! Excellent! I will
                  recommend it to patients and providers! In a nice and warm
                  environment, to learn new perspectives and skills!
                </p>
              </div>
              <p className="comments__quote text-right">
                - Kaiser Permanente Staff
              </p>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  This course was an eye opener for me. I have never experienced
                  anything like that before. The breathing exercises, meditation
                  and the yoga really gave me a new perspective on leading a
                  meaningful life. I would recommend this program to anyone who
                  is searching for peace and tranquility in their life.
                </p>
              </div>
              <p className="comments__quote text-right">
                - S. Chandramohan, M.D
              </p>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  A lot of us deal with very sick patients, with very needy
                  families and we just give, give, give and it's hard to give
                  into ourselves. This course really makes you think about
                  self-care in a different way. That feels so good to know that
                  I have something that I can take with me and do day after day
                  and know that it works.
                </p>
              </div>
              <p className="comments__quote text-right">
                - Theiline T. Gborkorquellie, MD
              </p>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div className="comments__text">
                <p>
                  I am now committed to myself and to make this program work for
                  me. I can honestly say that when I’m done with the deep
                  breathing and meditation that I have more energy. At night, I
                  sleep better and wake up feeling more refreshed.
                </p>
              </div>
              <p className="comments__quote text-right">
                - Margaretha Cash,
                <br /> Clinical Nurse Specialist, NICU
              </p>
            </SwiperSlide>
          </Swiper>
        </section>
        <section className="studies">
          <div className="container">
            <h2 className="col-lg-10 p-0 mx-auto studies__title section-title">
              An evidence-based practice that can significantly lower stress
              from the very 1st session!
            </h2>
            <div className="studies__block">
              <div className="studies__info-block">
                <div className="studies__info">
                  <h4 className="studies__number">100+</h4>
                  <h4 className="studies__name">
                    independent <br />
                    studies
                  </h4>
                  <img src="/img/mask.svg" alt="mask" />
                </div>
                <p>on {COURSE_TYPES.SKY_BREATH_MEDITATION.name} (SKY)</p>
              </div>
              <p className="studies__text">
                <span>
                  From reducing stress to getting better rest, the SKY Breath
                  Meditation techniques have demonstrated measurable impact on
                  quality of life.
                </span>
                <span>
                  Over 100 independent studies conducted on four continents and
                  published in peer review journals, have demonstrated a
                  comprehensive range of benefits from practicing SKY Breath.
                </span>
                {/*
                  <p className="summary_detail_c">
                    Summary of Independent Research Findings and{' '}
                    <a onClick={(e) => this.openResearchModal(e)}>Sources</a>
                  </p> */}
              </p>
            </div>
            <div className="studies__result">
              <h3 className="studies__result-title section-title">
                Research result key findings
              </h3>
              <div className="studies__list">
                <div className="container col-12 col-lg-10">
                  <div className="row">
                    <div className="col-12 col-md-3 studies__item studies__item_violet">
                      <h6>Deep Sleep Increases</h6>

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
                      <h6>Well-Being Hormones Increase</h6>

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
                      <h6>Depression Decreases</h6>

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
                      <h6>Stress Hormones Decrease</h6>

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
        <section className="research text-center">
          <div className="container">
            <h2 className="research__title section-title research__title_new">
              Research highlights
            </h2>

            <ResearchPaginationHB></ResearchPaginationHB>

            <Swiper
              className="d-lg-none research__list-container swiper-container"
              {...autoSwiperOption}
            >
              <SwiperSlide className="research__list-item swiper-slide">
                <p
                  className="research__quote"
                  onClick={() =>
                    window.open(
                      "https://news.yale.edu/2020/07/27/improve-students-mental-health-yale-study-finds-teach-them-breathe",
                    )
                  }
                >
                  "Improved immune cell counts within as little as 3 weeks"
                </p>
                <div>
                  <img src="/img/yale-news-color.png" alt="ljoy" />
                </div>
              </SwiperSlide>
              <SwiperSlide className="research__list-item swiper-slide">
                <p
                  className="research__quote"
                  onClick={() =>
                    window.open(
                      "https://news.stanford.edu/news/2014/september/meditation-helps-ptsd-090514.html",
                    )
                  }
                >
                  “Stanford scholar helps veterans recover from war trauma”
                </p>
                <div>
                  <img src="/img/stanford-news-color.png" alt="sabr" />
                </div>
              </SwiperSlide>
              <SwiperSlide className="research__list-item swiper-slide">
                <p
                  className="research__quote"
                  onClick={() =>
                    window.open("https://hms.harvard.edu/news/be-kind-unwind")
                  }
                >
                  "Be Kind and Unwind"
                </p>
                <div>
                  <img
                    src="/img/harvard-medical-school-color.png"
                    alt="prevention"
                  />
                </div>
              </SwiperSlide>
              <div className="research__list-pagination"></div>
            </Swiper>
          </div>
        </section>

        <section className="about">
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
                  <span>Since 2016</span> providing service to healthcare
                  professionals
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-15-hospitals.svg" alt="centers" />
                </div>
                <p className="about__text">
                  <span>15+ hospitals</span> across the U.S
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-30-cities.svg" alt="countries" />
                </div>
                <p className="about__text">
                  <span>30+ cities</span> where our programs made a difference
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-450-m-lives.svg" alt="lives" />
                </div>
                <p className="about__text">
                  <span>4,000+ lives</span> touched through our courses & events
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* <section className="details">
          <div className="container"></div>
        </section> */}
      </main>
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard workshop={data} onRegister={handleRegister} />
      </HideOn>
    </>
  );
};
