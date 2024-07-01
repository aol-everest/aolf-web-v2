/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import { HideOn } from '@components';
import { COURSE_TYPES, MODAL_TYPES, WORKSHOP_MODE } from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { Pagination, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CourseBottomCard } from './CourseBottomCard';
import CourseDetailsCard from './CourseDetailsCard';
import { navigateToLogin } from '@utils';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export const HealingBreath = ({ data, mode: courseViewMode }) => {
  const swiperOption = {
    modules: [Pagination, A11y],
    slidesPerView: 1,
    pagination: { clickable: true },
    spaceBetween: 10,
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

  const { isAuthenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const router = useRouter();

  const {
    title,
    isGuestCheckoutEnabled = false,
    mode,
    sfid,
    productTypeId,
  } = data || {};

  const handleRegister = (e) => {
    e.preventDefault();
    if (isAuthenticated || isGuestCheckoutEnabled) {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/checkout/${sfid}`,
        query: {
          ctype: productTypeId,
          page: 'c-o',
        },
      });
    } else {
      navigateToLogin(
        router,
        `/us-en/course/checkout/${sfid}?ctype=${productTypeId}&page=c-o&${queryString.stringify(
          router.query,
        )}`,
      );
    }
  };

  return (
    <>
      <main className="the-sky-program">
        <section className="sky-top-section">
          <div className="banner">
            <div className="container">
              <div className="left-section">
                <p>{mode}</p>
                <div className="banner-title">{title}</div>
                <div className="banner-features">
                  <ul>
                    <li>Alleviate stress & anxiety</li>
                    <li>Reconnect to the joy in medicine</li>
                    <li>Boost energy & alertness</li>
                    <li>
                      Cultivate inner calm & connectedness with self & others{' '}
                    </li>
                  </ul>
                </div>
                {courseViewMode !== WORKSHOP_MODE.VIEW && (
                  <div className="registration-wrap">
                    <button
                      className="register-button mt-2"
                      onClick={handleRegister}
                    >
                      Register Now
                    </button>
                  </div>
                )}
                <div className="training-eligibility-text">
                  Discover the transformation experienced by over{' '}
                  <strong>7,000 healthcare professionals</strong> since 2016.
                </div>
              </div>
              <div className="right-section">
                <CourseDetailsCard
                  workshop={data}
                  courseType={COURSE_TYPES.SKY_BREATH_MEDITATION}
                  courseViewMode={courseViewMode}
                ></CourseDetailsCard>
              </div>
            </div>
          </div>
        </section>
        <section className="featured-in">
          <div className="container">
            <div className="featuren-in-box">
              <h2 className="title">Featured In</h2>
              <div className="featured-brands">
                <img
                  src="/img/featured-in-cnn.png"
                  width="80"
                  height="60"
                  alt="CNN"
                />
                <img
                  src="/img/featured-in-yoga.png"
                  width="115"
                  height="60"
                  alt="Yoga Journal"
                />
                <img
                  src="/img/featured-in-tnyt.png"
                  width="266"
                  height="70"
                  alt="The New York Times"
                />
                <img
                  src="/img/featured-in-time.png"
                  width="109"
                  height="69"
                  alt="Time"
                />
                <img
                  src="/img/featured-in-wsj.png"
                  width="74"
                  height="47"
                  alt="WSJ"
                />
                <img
                  src="/img/featured-in-forbes.png"
                  width="117"
                  height="64"
                  alt="Forbes"
                />
                <img
                  src="/img/featured-in-nbc.png"
                  width="54"
                  height="65"
                  alt="NBC"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="techniques-to-thrive">
          <div className="container">
            <h2 className="title">Gain evidence-based techniques to thrive</h2>
            <div className="content">
              During the SKY Program, you’ll gain research-backed techniques and
              more, including the world-renowned SKY Breath Meditation, shown to
              significantly reduce stress, improve sleep, and enhance overall
              wellness.
            </div>
          </div>
        </section>
        <section className="the-science">
          <div className="container">
            <div className="science-box">
              <h2 className="title hidden">The Science</h2>
              <div className="image-area">
                <img
                  src="/img/the-science-brain.webp"
                  width="409"
                  height="410"
                  alt="science"
                />
              </div>
              <div className="content-container">
                <h2 className="title">The Science</h2>
                <div className="content">
                  <div className="count">
                    <img
                      src="/img/100-studies.webp"
                      width="275"
                      height="135"
                      alt="studies"
                    />
                  </div>
                  <div className="the-science-text">
                    Research conducted on four continents and published in
                    peer-reviewed journals have demonstrated a comprehensive
                    range of benefits from practicing SKY Breath Meditation
                    (Sudarshan Kriya Yoga and accompanying breathing techniques
                    taught in the SKY Program), including:
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="research-includes">
          <div className="container">
            <div className="research-listing">
              <div className="research-list-item">
                <h3>RESILIENCE</h3>
                <img
                  src="/img/research-count1.webp"
                  width="114"
                  height="119"
                  alt="research"
                />
                <div className="description">IMPROVED IN 6 WEEKS</div>
              </div>
              <div className="research-list-item">
                <h3>
                  CORTISOL
                  <br />
                  Stress hormone
                </h3>
                <img
                  src="/img/research-count2.webp"
                  width="114"
                  height="119"
                  alt="research"
                />
                <div className="description">IN 2 WEEKS</div>
              </div>
              <div className="research-list-item">
                <h3>ANXIENTY</h3>
                <img
                  src="/img/research-count3.webp"
                  width="114"
                  height="119"
                  alt="research"
                />
                <div className="description">ACHIEVED REMISSION IN 4 WEEKS</div>
              </div>
              <div className="research-list-item">
                <h3>
                  SLEEP
                  <br />
                  Slow Wave Sleep
                </h3>
                <img
                  src="/img/research-count4.webp"
                  width="114"
                  height="119"
                  alt="research"
                />
              </div>
              <div className="research-list-item">
                <h3>LIFE SATISFACTION</h3>
                <img
                  src="/img/research-count5.webp"
                  width="114"
                  height="119"
                  alt="research"
                />
                <div className="description">IN 6 WEEKS</div>
              </div>
            </div>
            <div className="view-research">
              <a
                data-action="url"
                data-params="false"
                href="https://healingbreaths.org/the-science"
                target="_blank"
              >
                View Research
              </a>
            </div>
          </div>
        </section>
        <section className="what-to-expect">
          <div className="container">
            <div className="content-area">
              <div className="left-area">
                <h2 className="title">What To Expect</h2>
                <div className="content-box">
                  <p>
                    After completing this program, you will be equipped with the
                    following tools and knowledge to transform all areas of your
                    life. You will:
                  </p>
                  <ul>
                    <li>
                      Gain insight into the compelling science behind the
                      powerful connection between your body, mind, breath, and
                      sense of self.
                    </li>
                    <li>
                      Learn SKY Breath Meditation, the renowned evidence-based
                      technique demonstrated to improve core markers of
                      mind-body health significantly.
                    </li>
                    <li>
                      Discover additional tangible breathing techniques that
                      will increase your energy and reduce stress.
                    </li>
                    <li>
                      Identify and optimize your sources of energy to maximize
                      personal well-being.
                    </li>
                    <li>
                      Develop practical tools and social skills through
                      reflective and interactive processes.
                    </li>
                    <li>
                      Create a regular self-care routine by incorporating
                      cognitive reframing tools and the SKY practice into your
                      daily life.{' '}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="right-area">
                <img
                  className="expect-img"
                  src="/img/healing-breaths-nurse.webp"
                  width="409"
                  height="410"
                  alt="nurse"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="whats-included">
          <div className="container">
            <h2 className="title">What's Included</h2>
            <div className="included-listing">
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">
                  Evidenced-based SKY Breath Meditation technique
                </div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">
                  Max 3 hours daily live online sessions
                </div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">Certified expert instruction</div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">Cognitive reframing skills</div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">
                  Tailored self-care regimen designed for healthcare
                  professionals
                </div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">
                  Latest scientific evidence & research
                </div>
              </div>
              <div className="included-list-item">
                <div className="check-icon">
                  <img
                    src="/img/icon-check-pad.svg"
                    height="60"
                    width="60"
                    alt="icon"
                  />
                </div>
                <div className="text">
                  CEU credits: Physicians, PAs, NPs, Nurses, and Dentists can
                  receive 1 CME/CEU credit for every class hour. Other
                  healthcare professionals can receive a letter of attendance.
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="change-stories">
          <div className="container">
            <h2 className="title">Real Stories of Change</h2>
            <div className="story-video">
              <iframe
                width="669"
                height="376"
                src="https://www.youtube.com/embed/g4I9m_Od89w"
                title="How healthcare Professionals Transform their Organizations"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
            <div className="testimonial-slider-wrapper">
              <div className="testimonials swiper">
                <Swiper
                  className="px-3 px-lg-0 comments__item_new"
                  {...swiperOption}
                >
                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “[After the course] I was feeling better than my
                        baseline, I was able to cut my blood pressure meds by a
                        third.”
                      </p>
                      <div className="name">Dr. Robert McGregor</div>
                      <div className="position">
                        Chief Medical Officer, Akron Children's Hospital
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “When I'm done with the deep breathing and meditation, I
                        have more energy. At night, I sleep better and wake up
                        feeling more refreshed. When I meet with the group, it
                        reinforces my commitment to care for myself first.”
                      </p>
                      <div className="name">Margaretha Cash</div>
                      <div className="position">Clinical Nurse Specialist</div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “This course was very, very good…it really does make you
                        go deep within, and the beauty is that you do get a
                        daily practice that you can carry with you forever. So
                        I'm very appreciative. Very well thought out course, and
                        I really enjoyed it.”
                      </p>
                      <div className="name">Dr. Sandeep Vaishnavi</div>
                      <div className="position">
                        Medical Director,
                        <br />
                        MindPath Care Center
                      </div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “What I benefited most from the SKY Program is the
                        affirmation that it's OK to care about myself and put me
                        first…I will make the commitment to take 15 minutes out
                        of the 1440 minutes a day for me, which will leave me
                        1425 minutes to care for others.”
                      </p>
                      <div className="name">Kimberly Kelley</div>
                      <div className="position">Nurse Director</div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “I had the highest sleep rating I've ever had. I'm eager
                        to continue the practice, and I'm grateful for the
                        training.”
                      </p>
                      <div className="name">Dr. Kaplan</div>
                      <div className="position">LCMC Health System</div>
                    </div>
                  </SwiperSlide>

                  <SwiperSlide className="swiper-slide">
                    <div className="testimony-item">
                      <p>
                        “I thought it was very well organized. For every life in
                        the pandemic now, every minute, every hour really
                        matters. This was time very, very well spent and really
                        necessary for me…”
                      </p>
                      <div className="name">David Mineta</div>
                      <div className="position">
                        CEO, Momentum for Mental Health
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </section>
        <section className="healing-breaths">
          <div className="container">
            <h2 className="title">Some Of Our Partners</h2>
            <div className="org-text">
              List of some of the organizations that have benefited from the Art
              of Living’s Healing Breaths SKY Programs
            </div>

            <div className="benefitted-orgs-list">
              <div>
                <img src="/img/hb-logos-new.png" width="1300" height="512" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <HideOn divID="third" showOnPageInit={false}>
        <CourseBottomCard
          workshop={data}
          onRegister={handleRegister}
          courseViewMode={courseViewMode}
        />
      </HideOn>
    </>
  );
};
