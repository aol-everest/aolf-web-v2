/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { HideOn } from '@components';
import { ALERT_TYPES, COURSE_MODES, COURSE_TYPES } from '@constants';
import { useGlobalAlertContext } from '@contexts';
import { priceCalculation } from '@utils';
import { Element, Link } from 'react-scroll';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CourseBottomCard } from './CourseBottomCard';
import CourseDetailsCard from './CourseDetailsCard';
import { RegisterPanel } from './RegisterPanel';
import { ResearchFindingSource } from './ResearchFindingSource';
import { ResearchPagination } from './ResearchPagination';

export const SKYHappinessRetreat = ({ data, swiperOption }) => {
  const { showAlert } = useGlobalAlertContext();

  const showResearchModal = (e) => {
    if (e) e.preventDefault();
    showAlert(ALERT_TYPES.CUSTOM_ALERT, {
      title: 'Success',
      children: <ResearchFindingSource />,
      className: 'research-detail-modal',
      hideConfirm: true,
    });
  };

  const autoSwiperOption = {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
      delay: 2000,
    },
    pagination: {
      el: '.research__list-pagination',
      clickable: true,
    },
  };

  const { title, mode } = data || {};

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
            courseType={COURSE_TYPES.SKY_BREATH_MEDITATION}
          ></CourseDetailsCard>
        </section>
        <section className="progress-section">
          <div className="container">
            <div className="featured-in tw-mt-[120px] max-[770px]:tw-mt-[60px]">
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
        <section className="how-it-works">
          <div className="container">
            <div className="how-it-works__block">
              <h2 className="how-it-works__title section-title">
                Why this workshop is so powerful
              </h2>
              <p className="how-it-works__text">
                Breathe your stress away with this evidence-based practice.
                Using the science of breath, you can raise your energy, manage
                your emotions, and find lasting ease...so you’re ready to face
                your day. Every day!
              </p>
            </div>
            <div className="how-it-works__list">
              <h2>How it works</h2>
              <div className="how-it-works__item">
                <p>
                  <span>Clear</span> stress from every cell of your body
                </p>
                {COURSE_TYPES.SKY_BREATH_MEDITATION.name}, the most powerful
                breathing technique of our time, uses specific, natural rhythms
                of the breath to deeply clear more than 90% of the toxins and
                accumulated stress tension on a cellular level. Removing all the
                negativity from your whole system, leaving you restored, clear,
                and energized.
              </div>
              <div className="how-it-works__item">
                <p>
                  <span>Unlock</span> your freedom & joy within
                </p>
                <div>
                  Like atoms, our central core is positive. The electrons, or
                  negative charge, are only on the surface.
                </div>
                Since positivity is within you, it's not something you have to
                learn or get. On the contrary, through specific breathing
                techniques, you can drop stress and negativity. Then you
                naturally connect with your positive core—energy, ease, and
                clarity.
              </div>
              <div className="how-it-works__item">
                <p>
                  <span>Transform</span> your life
                </p>
                With the inner freedom you’ll gain from this practice, you’ll be
                able to:
                <ul>
                  <li>
                    <span>Take action & feel empowered</span>
                  </li>
                  <li>
                    <span>Handle stressful situations with ease</span>
                  </li>
                  <li>
                    <span>Connect more deeply and easily with others</span>
                  </li>
                  <li>
                    <span>Improve life-work balance</span>
                  </li>
                  <li>
                    <span>Attract the things you want</span>
                  </li>
                  <li>
                    <span>Heal your mind and body</span>
                  </li>
                  <li>
                    <span>Release old patterns and habits</span>
                  </li>
                  <li>
                    <span>
                      Feel empowered to make positive change in your life.
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
              src="https://player.vimeo.com/video/786088775"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        </section>
        <section className="powerful" id="third">
          <div className="container">
            <div className="col-lg-10 p-0 m-auto">
              <Element name="registerNowBlock">
                <RegisterPanel workshop={data} />
              </Element>
            </div>
          </div>
        </section>
        <section className="quote-section">
          <div className="container">
            <div className="offset-lg-6">
              <p className="quote-section__name">
                Gurudev Sri Sri Ravi Shankar
                <span>Founder of The Art of Living</span>
              </p>
              <p className="quote-section__quote">
                “
                <span>
                  Meditation is the journey from sound to silence, from movement
                  to stillness, from a limited identity to unlimited space.
                </span>
              </p>
            </div>
          </div>
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
                  <h3 className="studies__number">100</h3>
                  <h3 className="studies__name">
                    independent <br />
                    studies
                  </h3>
                  <img src="/img/mask.svg" alt="mask" />
                </div>
                <p>on {COURSE_TYPES.SKY_BREATH_MEDITATION.name} (SK&P)</p>
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
                  comprehensive range of benefits from practicing SKY
                  Meditation.
                </span>

                <p className="summary_detail_c">
                  Summary of Independent Research Findings and{' '}
                  <a href="#" onClick={showResearchModal}>
                    Sources
                  </a>
                </p>
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
        <section className="research text-center">
          <div className="container">
            <h2 className="research__title section-title">
              Research highlights
            </h2>
            <ResearchPagination></ResearchPagination>

            <Swiper
              className="d-lg-none research__list-container swiper-container"
              {...autoSwiperOption}
            >
              <SwiperSlide className="research__list-item swiper-slide">
                <p className="research__quote">
                  "Improved immune cell counts within as little as 3 weeks"
                </p>
                <div>
                  <img
                    src="/img/research-highlights-ijoy-color.png"
                    alt="ljoy"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide className="research__list-item swiper-slide">
                <p className="research__quote">
                  “3x more time spent in deep, restful stages of sleep.”
                </p>
                <div>
                  <img
                    src="/img/research-highlights-sabr-color.png"
                    alt="sabr"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide className="research__list-item swiper-slide">
                <p className="research__quote">
                  "The Easy Breathing Technique That Can Lower Your Anxiety 44%"
                </p>
                <div>
                  <img
                    src="/img/research-highlights-prevention-color.png"
                    alt="prevention"
                  />
                </div>
              </SwiperSlide>
              <SwiperSlide className="research__list-item swiper-slide">
                <p className="research__quote">
                  "Shows promise in providing relief for depression"
                </p>
                <div>
                  <img src="/img/research-highlights-hhp-color.png" alt="hhp" />
                </div>
              </SwiperSlide>
              <div className="research__list-pagination"></div>
            </Swiper>
          </div>
        </section>
        <section className="life-time">
          <div className="container">
            <h2 className="life-time__title section-title">
              Learn tools for a lifetime
            </h2>
            <div className="life-time__block">
              <h3>Experience the essence of meditation</h3>
              <p className="life-time__text">
                Discover advanced breathing techniques that have been
                scientifically shown to effectively reduce anxiety, calm the
                mind, and take you into a state of deep meditation.
              </p>
            </div>
            <div className="life-time__block">
              <h3>Mental hygiene kit</h3>
              <p className="life-time__text">
                Discover how the wisdom of yoga can be applied in everyday life
                to not accumulate stress to begin with.
              </p>
            </div>
            <div className="life-time__block">
              <h3>Lifetime access to a global community</h3>
              <p className="life-time__text">
                This course doesn't just end after three days.. You’ll have
                access to weekly practice groups around the world and a
                community of positive, like-minded people for connection and
                support—online and in-person.
              </p>
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
              Let’s Get Started
            </Link>
          </div>
        </section>
        <section className="about">
          <div className="container">
            <h2 className="about__title section-title text-center">
              About the Art of Living And International Association for Human
              Values
            </h2>
            <div className="row">
              <div className="col-12 col-md-3 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-39-years.svg" alt="years" />
                </div>
                <p className="about__text">
                  <span>42 years</span> of service to society
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-3000-centers.svg" alt="centers" />
                </div>
                <p className="about__text">
                  <span>10,000+ centers</span> worldwide
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-156-countries.svg" alt="countries" />
                </div>
                <p className="about__text">
                  <span>180 countries</span> where our programs made a
                  difference
                </p>
              </div>
              <div className="col-12 col-md-3 mt-4 mt-md-0 text-center about__card">
                <div className="about__logo">
                  <img src="/img/ic-450-m-lives.svg" alt="lives" />
                </div>
                <p className="about__text">
                  <span>500M+ lives</span> touched through our courses & events
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
        <CourseBottomCard workshop={data} />
      </HideOn>
    </>
  );
};
