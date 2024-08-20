/* eslint-disable react/no-unescaped-entities */
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { PriceCard } from './PriceCard';
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
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
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

export const SilentRetreat = ({
  data,
  mode: courseViewMode,
  handleRegister,
}) => {
  const { sfid, title } = data || {};

  return (
    <>
      <main className="course-filter art-of-silence">
        <section className="samadhi-top-section">
          <div className="banner">
            <div className="container">
              <div className="courses-title">Courses</div>
              <div className="banner-title">
                hhhh
                {title || 'Art of Living Part 2'}
              </div>
              <div className="banner-description">
                Give yourself a true vacation for body, mind, and spirit
              </div>
              {!sfid && courseViewMode !== WORKSHOP_MODE.VIEW && (
                <div className="hero-register-button-wrapper">
                  <button
                    className="hero-register-button"
                    onClick={handleRegister('SILENT_RETREAT')}
                  >
                    Register Now <FaArrowRightLong className="fa-solid" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {sfid && (
            <PriceCard
              workshop={data}
              courseViewMode={courseViewMode}
              handleRegister={handleRegister('SILENT_RETREAT')}
            />
          )}
          <div className="container samadhi-featuers">
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/aos-eye-icon.webp"
                  alt="Elevate"
                  width="61"
                  height="50"
                />
              </div>
              <div className="feature-text">
                Immerse yourself in deep rest & rejuvenation
              </div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/aos-flower-icon.webp"
                  alt="Enhance"
                  width="50"
                  height="50"
                />
              </div>
              <div className="feature-text">
                Naturally elevate your energy levels
              </div>
            </div>
            <div className="feature-box">
              <div className="feature-icon">
                <img
                  src="/img/aos-uparrow-icon.webp"
                  alt="Unlock"
                  width="55"
                  height="55"
                />
              </div>
              <div className="feature-text">
                Uncover the profound art of inner silence
              </div>
            </div>
          </div>

          <div className="container content-video-area">
            <div className="video-section-textbox">
              <h2 className="section-title">
                Why take a few days to unplug from the world for a silent
                retreat?
              </h2>
              <p>
                The Part 2 course builds on your Part 1 experience* with a
                unique blend of advanced breathwork, signature guided
                meditations, daily yoga, and profound insights into the mind.
                This is all designed to{' '}
                <strong>
                  provide an optimal environment to break free from a busy mind
                </strong>
                , dive deep within, and experience transformative shifts—fresh
                perspective, deep insights, and clarity. These moments
                supercharge the rest of your year, making it more vibrant,
                productive, and full of energy. As you emerge, you feel
                centered, recharged, and ready to embrace life with renewed
                focus and joy. This retreat is your avenue to rekindle your
                connection with {COURSE_TYPES.SKY_BREATH_MEDITATION.name},
                elevating your energy to new heights.
              </p>

              <p>
                *You can take the Part 2 Course only after completing the Part 1
                course. If you would like to do a silent retreat and have not
                yet done Part 1, please visit{' '}
                <Link href="/us-en/course?courseType=SKY_BREATH_MEDITATION">
                  this page
                </Link>
                .{' '}
              </p>
            </div>
            <div className="video-wrapper">
              <iframe
                width="400"
                height="315"
                src="https://www.youtube.com/embed/w2ixmLA37ck?si=TXikDVJxA89TzEsm"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
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
                    <strong>Deep</strong> Meditations
                  </div>
                  <div className="benefit-text">
                    Exclusive to this course—immerse in unique guided
                    meditations crafted by Gurudev to release deep layers of
                    stress and tension.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box2">
                  <div className="benefit-title">
                    <strong>Silence</strong>
                  </div>
                  <div className="benefit-text">
                    Experience the extraordinary peace and rest that come from
                    spending time in silence.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box3 ">
                  <div className="benefit-title">
                    <strong>Yoga</strong>
                  </div>
                  <div className="benefit-text">
                    Unite mind and body through invigorating morning yoga
                    sessions.
                  </div>
                </div>
              </div>
              <div className="col-md-6 py-1 px-1">
                <div className="samadhi-benefit-box box4">
                  <div className="benefit-title">
                    <strong>Ancient</strong>Wisdom
                  </div>
                  <div className="benefit-text">
                    Tap into timeless teachings that equip you to lead a joyful
                    and fulfilling life, unshaken by outer circumstances.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container banner2">
          <div className="aos-banner-second">
            <div className="guru-quote">
              "Meditation is absolute comfort, coming back to the serenity that
              is your original nature."
            </div>
            <div className="quote-author">~ Gurudev Sri Sri Ravi Shankar</div>
          </div>
        </section>
        <section className="container banner3">
          <div className="aos-banner-third">
            <div className="banner-title">Escape the mind's clutter</div>
            <div className="banner-text">
              The Part 2 course provides the ideal environment to dive deep
              within, breaking free from the constant chatter of the mind. Each
              day is carefully structured to offer a transformative and relaxing
              experience, a true vacation for your body, mind, and soul.
            </div>
            <button
              className="enroll-btn"
              onClick={handleRegister('SILENT_RETREAT')}
            >
              Enroll Now →
            </button>
          </div>
        </section>
        <section className="section-sahaj-reviews">
          <h2 className="section-title">
            Transforming lives through silent retreats
          </h2>
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
                    <img src="/img/max-review.webp" alt="reviewer" />
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
                  had picked up on the {COURSE_TYPES.SKY_BREATH_MEDITATION.name}{' '}
                  course. I came away relaxed, refreshed and happier than I had
                  felt for a long time.
                </div>
                <div className="review-author">
                  <div className="reviewer-photo">
                    <img src="/img/reviewer-photo.webp" alt="reviewer" />
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
                    <img src="/img/michelle-review.webp" alt="reviewer" />
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
                    <img src="/img/vinita-review.webp" alt="reviewer" />
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
                    <img src="/img/aarti-review.webp" alt="reviewer" />
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
                    <img src="/img/daniel-review.webp" alt="reviewer" />
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
        </section>
      </main>
    </>
  );
};
