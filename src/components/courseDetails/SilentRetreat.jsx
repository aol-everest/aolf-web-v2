/* eslint-disable react/no-unescaped-entities */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { PriceCard } from "./PriceCard";
import { MODAL_TYPES, COURSE_MODES, COURSE_TYPES } from "@constants";
import { useAuth, useGlobalModalContext } from "@contexts";
import { pushRouteWithUTMQuery } from "@service";
import { useRouter } from "next/router";
import queryString from "query-string";
import { FaArrowRightLong } from "react-icons/fa6";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

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

export const SilentRetreat = ({ data }) => {
  const { sfid, title, mode, productTypeId, isGuestCheckoutEnabled } =
    data || {};
  const router = useRouter();
  const { authenticated = false } = useAuth();
  const { showModal } = useGlobalModalContext();

  const handleRegister = (e) => {
    e.preventDefault();
    if (sfid) {
      if (authenticated || isGuestCheckoutEnabled) {
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
    } else {
      pushRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling`,
        query: {
          courseType: "SILENT_RETREAT",
        },
      });
    }
  };
  return (
    <>
      <main class="course-filter art-of-silence">
        <section class="samadhi-top-section">
          <div class="banner">
            <div class="container">
              <div class="courses-title">Courses</div>
              <div class="banner-title">Art of Living Part II</div>
              <div class="banner-description">
                Give yourself a true vacation for body, mind, and spirit
              </div>
              {!sfid && (
                <div class="hero-register-button-wrapper">
                  <button class="hero-register-button" onClick={handleRegister}>
                    Register Now <FaArrowRightLong className="fa-solid" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {sfid && <PriceCard workshop={data} />}
          <div class="container samadhi-featuers">
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/aos-eye-icon.png" alt="Elevate" />
              </div>
              <div class="feature-text">
                Immerse yourself in deep rest & rejuvenation
              </div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/aos-flower-icon.png" alt="Enhance" />
              </div>
              <div class="feature-text">
                Naturally elevate your energy levels
              </div>
            </div>
            <div class="feature-box">
              <div class="feature-icon">
                <img src="/img/aos-uparrow-icon.png" alt="Unlock" />
              </div>
              <div class="feature-text">
                Uncover the profound art of inner silence
              </div>
            </div>
          </div>

          <div class="container content-video-area">
            <div class="video-section-textbox">
              <h2 class="section-title">
                Why take a few days to unplug from the world for a silent
                retreat?
              </h2>
              <p>
                The Part II course builds on your Part I experience* with a
                unique blend of advanced breathwork, signature guided
                meditations, daily yoga, and profound insights into the mind.
                This is all designed to{" "}
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
                *You can take the Part II Course only after completing the Part
                I course. If you would like to do a silent retreat and have not
                yet done Part I, please visit{" "}
                <Link href="/us-en/course?courseType=SKY_BREATH_MEDITATION">
                  this page
                </Link>
                .{" "}
              </p>
            </div>
            <div class="video-wrapper">
              <iframe
                width="400"
                height="315"
                src="https://www.youtube.com/embed/w2ixmLA37ck?si=TXikDVJxA89TzEsm"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          </div>
          <div class="container samadhi-benefits-section">
            <h2 class="section-title">
              <strong>Course</strong> Highlights
            </h2>

            <div class="samadhi-benefits-wrapper row">
              <div class="col-md-6 py-1 px-1">
                <div class="samadhi-benefit-box box1">
                  <div class="benefit-title">
                    <strong>Deep</strong> Meditations
                  </div>
                  <div class="benefit-text">
                    Exclusive to this course—immerse in unique guided
                    meditations crafted by Gurudev to release deep layers of
                    stress and tension.
                  </div>
                </div>
              </div>
              <div class="col-md-6 py-1 px-1">
                <div class="samadhi-benefit-box box2">
                  <div class="benefit-title">
                    <strong>Silence</strong>
                  </div>
                  <div class="benefit-text">
                    Experience the extraordinary peace and rest that come from
                    spending time in silence.
                  </div>
                </div>
              </div>
              <div class="col-md-6 py-1 px-1">
                <div class="samadhi-benefit-box box3 ">
                  <div class="benefit-title">
                    <strong>Yoga</strong>
                  </div>
                  <div class="benefit-text">
                    Unite mind and body through invigorating morning yoga
                    sessions.
                  </div>
                </div>
              </div>
              <div class="col-md-6 py-1 px-1">
                <div class="samadhi-benefit-box box4">
                  <div class="benefit-title">
                    <strong>Ancient</strong>Wisdom
                  </div>
                  <div class="benefit-text">
                    Tap into timeless teachings that equip you to lead a joyful
                    and fulfilling life, unshaken by outer circumstances.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="container banner2">
          <div class="aos-banner-second">
            <div class="guru-quote">
              "Meditation is absolute comfort, coming back to the serenity that
              is your original nature."
            </div>
            <div class="quote-author">~ Gurudev Sri Sri Ravi Shankar</div>
          </div>
        </section>
        <section class="container banner3">
          <div class="aos-banner-third">
            <div class="banner-title">Escape the mind's clutter</div>
            <div class="banner-text">
              The Part II course provides the ideal environment to dive deep
              within, breaking free from the constant chatter of the mind. Each
              day is carefully structured to offer a transformative and relaxing
              experience, a true vacation for your body, mind, and soul.
            </div>
            <button class="enroll-btn" onClick={handleRegister}>
              Enroll Now →
            </button>
          </div>
        </section>
        <section class="section-sahaj-reviews">
          <h2 class="section-title">
            Transforming lives through silent retreats
          </h2>
          <Swiper {...swiperOption} className="reviews-slider">
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">
                  ...very, very powerful...such a sense of calm
                </div>
                <div class="review-text">
                  It was very, very powerful. I gained such a sense of calm,
                  more than I ever could have imagined.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/max-review.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Max Goldberg</div>
                    <div class="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">relaxed, refreshed, and happier</div>
                <div class="review-text">
                  It helped me to put into practice the valuable wisdom which I
                  had picked up on the {COURSE_TYPES.SKY_BREATH_MEDITATION.name}{" "}
                  course. I came away relaxed, refreshed and happier than I had
                  felt for a long time.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/reviewer-photo.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Julie Madeley</div>
                    <div class="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">Felt more balanced</div>
                <div class="review-text">
                  I've been on quite a few silent retreats in the past and this
                  felt more balanced, nourishing and comfortable than any other
                  retreat I'd been on.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/michelle-review.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Michelle Garisson</div>
                    <div class="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">
                  extremely relaxing, yet energizing experience
                </div>
                <div class="review-text">
                  The meditations are deep! It was an extremely relaxing yet
                  energizing experience.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/vinita-review.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Vinita D.</div>
                    <div class="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">wonderful, peaceful retreat</div>
                <div class="review-text">
                  A wonderful, peaceful retreat ... extremely joyful and easy.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/aarti-review.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Aarti R.</div>
                    <div class="reviwer-position">
                      Silent Retreat participant
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div class="review-box">
                <div class="review-title">I feel more like myself</div>
                <div class="review-text">
                  I feel more like myself after the Silence Retreat. My life
                  goes smoother after it and I feel the difference for a good
                  3-6 months.
                </div>
                <div class="review-author">
                  <div class="reviewer-photo">
                    <img src="/img/daniel-review.png" alt="reviewer" />
                  </div>
                  <div class="reviewer-info">
                    <div class="reviewer-name">Daniel M.</div>
                    <div class="reviwer-position">
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
