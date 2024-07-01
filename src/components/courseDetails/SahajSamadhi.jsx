/* eslint-disable react/no-unescaped-entities */
import classNames from 'classnames';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import { Accordion, Card, AccordionContext } from 'react-bootstrap';
import { PriceCard } from './PriceCard';
import { useContext } from 'react';
import {
  MODAL_TYPES,
  COURSE_MODES,
  COURSE_TYPES,
  WORKSHOP_MODE,
} from '@constants';
import { useAuth, useGlobalModalContext } from '@contexts';
import { pushRouteWithUTMQuery } from '@service';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { FaArrowRightLong } from 'react-icons/fa6';
import { priceCalculation } from '@utils';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { navigateToLogin } from '@utils';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

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
export const SahajSamadhi = ({ data, mode: courseViewMode }) => {
  const { sfid, title, isGuestCheckoutEnabled, productTypeId } = data || {};
  const router = useRouter();
  const { isAuthenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();
  const { fee, delfee } = sfid ? priceCalculation({ workshop: data }) : {};

  const handleRegister = (e) => {
    e.preventDefault();
    if (sfid) {
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
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling`,
        query: {
          courseType: COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.code,
        },
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
          className={classNames('btn btn-link', {
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
      <main className="course-filter course-sahaj-samadhi">
        <section className="samadhi-top-section">
          <div className="banner">
            <div className="container">
              <div className="courses-title">Courses</div>
              <div className="banner-title">
                {title}
                <sup>TM</sup>: Your Path to Effortless Ease
              </div>
              <div className="banner-description">
                Experience freedom from worry and anxiety
              </div>
              {!sfid && courseViewMode !== WORKSHOP_MODE.VIEW && (
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
          {sfid && (
            <PriceCard workshop={data} courseViewMode={courseViewMode} />
          )}
          <div className="container samadhi-featuers">
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/sahaj-samadhi-uparrow-icon.webp"
                  alt="Enhance"
                  width="65"
                  height="64"
                />
              </div>
              <div className="feature-text">Feel clearer & lighter</div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/sahaj-samadhi-eye-icon.webp"
                  alt="Elevate"
                  width="78"
                  height="63"
                />
              </div>
              <div className="feature-text">Unlock intuitive skills</div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/sahaj-samadhi-smile-icon.webp"
                  alt="Enhance"
                  width="64"
                  height="64"
                />
              </div>
              <div className="feature-text">Enhance emotional well-being</div>
            </div>
          </div>

          <div className="container content-video-area">
            <div className="video-section-textbox">
              <h2 className="section-title">What is {title}?</h2>
              <p>
                Sahaj translates to "effortless," and Samadhi signifies a state
                of profound meditation. In simple terms, it's a technique to
                effortlessly enjoy deep meditation, as well as the profound rest
                and wealth of other benefits that meditation provides.{' '}
              </p>
              <p>
                You'll receive a personalized mantra, a charged sound, that
                makes meditation easier and more effective. The mantra acts as a
                conduit, guiding you through mental clutter into a state of
                serene repose.
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
          <div className="container samadhi-benefits-section">
            <h2 className="section-title">
              <strong>Benefits</strong> of {title}
            </h2>
            <div className="section-description">
              Powerful breathing techniques and wisdom that can change your life
            </div>
            <div className="samadhi-benefits-wrapper row">
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box1">
                  <div className="benefit-title">
                    <strong>Revitalize</strong>
                    <br />
                    physical health
                  </div>
                  <div className="benefit-text">
                    By soothing and rejuvenating your nervous system, Sahaj
                    Samadhi Meditation radiates positive effects throughout your
                    body. Experience improved cardiovascular, digestive, and
                    respiratory system functionality for enhanced overall
                    health.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box2">
                  <div className="benefit-title">
                    <strong>Unlock</strong>
                    <br />
                    intuitive skills
                  </div>
                  <div className="benefit-text">
                    In the midst of mental clutter and repetitive overthinking,
                    Sahaj Samadhi Meditation guides you to your authentic inner
                    voice. Tap into this innate wisdom and you strengthen your
                    intuition, refine your judgment, and experience new
                    insights.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box3 ">
                  <div className="benefit-title">
                    <strong>Find</strong>
                    <br />
                    mental clarity
                  </div>
                  <div className="benefit-text">
                    Quieting the constant stream of thoughts, Sahaj Samadhi
                    Meditation gives greater clarity of mind and heightened
                    awareness. Enjoy a longer attention span, greater
                    self-awareness, and improved decision-making skills.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box4">
                  <div className="benefit-title">
                    <strong>Experience</strong>
                    <br />
                    effortless ease
                  </div>
                  <div className="benefit-text">
                    Sahaj Samadhi Meditation is the epitome of effortless ease
                    and tranquility. With a personalized mantra, you
                    effortlessly transcend mental chatter and negative thought
                    patterns, immersing yourself in deep rest and relaxation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {sfid && courseViewMode !== WORKSHOP_MODE.VIEW && (
          <section className="register-to-unlock">
            <div className="container">
              <div className="unlock-title">
                Unlock your Inner Peace with this 3-day course for ${fee}
              </div>
              <div className="unlock-register">
                <button className="register-button" onClick={handleRegister}>
                  Register Now <FaArrowRightLong className="fa-solid" />
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="section-sahaj-reviews">
          <h2 className="section-title">How {title} is Changing Lives?</h2>
          <Swiper {...swiperOption} className="reviews-slider">
            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">Calmness and peace</div>
                <div className="review-text">
                  I am enjoying the calmness and peace that comes with Sahaj
                  Samadhi meditation.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img
                      src="/img/dr-lewis-review.webp"
                      alt="reviewer"
                      width="69"
                      height="69"
                    />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Dr. Lewis</div>
                    <div className="reviwer-position">
                      Sahaj Samadhi participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">Reservoir of energy</div>
                <div className="review-text">
                  Sahaj Samadhi allows me to tap into a reservoir of energy,
                  which leaves me rejuvenated and revitalized, like a new
                  person.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img
                      src="/img/brian-review.webp"
                      alt="reviewer"
                      width="69"
                      height="69"
                    />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Brian</div>
                    <div className="reviwer-position">
                      Sahaj Samadhi participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="review-box">
                <div className="review-title">Happy</div>
                <div className="review-text">
                  I got so happy for no reason. I hadn’t experienced that in a
                  long time.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img
                      src="/img/phillip-review.webp"
                      alt="reviewer"
                      width="69"
                      height="69"
                    />
                  </div>
                  <div className="reviewer-info">
                    <div className="reviewer-name">Phillip</div>
                    <div className="reviwer-position">
                      Sahaj Samadhi participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>
        <section className="faq">
          <div className="container">
            <h2 className="section-title pl-0 pr-0">FAQs</h2>
            <Accordion defaultActiveKey="0" className="accordion">
              <Card>
                <Card.Header>
                  <ContextAwareToggle eventKey="0">
                    What is the duration of the Sahaj Samadhi Meditation course?
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
                  <ContextAwareToggle eventKey="1">
                    How is Sahaj Samadhi Meditation different from guided
                    meditation?
                  </ContextAwareToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    Guided meditations help you meditate with verbal
                    instructions and music. They help you relax and unwind by
                    providing a soothing and peaceful ambience. On the other
                    hand, Sahaj Samadhi Meditation is a mantra-based meditation
                    technique. The mantra is a charged, subtle sound that takes
                    you to deeper states of consciousness. Guided meditations
                    require, well, guidance, but once you learn Sahaj Samadhi
                    Meditation, you can meditate on your own with this
                    technique. It needs 20 minutes of your time, and a quiet
                    corner where you can sit comfortably. With regular practice,
                    you will feel more at peace and start noticing the
                    improvements in your physical health, mental acumen,
                    increased awareness, and sharpened intuitive skills.
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
        </section>
        {courseViewMode !== WORKSHOP_MODE.VIEW && (
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
        )}
      </main>
    </>
  );
};
