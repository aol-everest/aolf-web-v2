/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-inline-styles/no-inline-styles */
import React from 'react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { useState } from 'react';

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

const GuidedMeditation = () => {
  const [accordionIndex, setAccordionIndex] = useState(0);
  return (
    <main class="guided-meditation">
      <section class="banner-section">
        <div class="container">
          <div class="banner-title">
            Your Guide
            <br />
            to Meditation
          </div>
          <div class="banner-desc">
            Meditation is the delicate art of doing nothing and letting go of
            all effort to reconnect with the serenity that is your very nature,
            to feel revived, refreshed, and restored again.
          </div>
          <div class="banner-audio"></div>
        </div>
      </section>
      <section class="benefits-meditation">
        <div class="container">
          <h2 class="section-title">Benefits of meditation</h2>
          <div class="section-desc">
            Science shows that consistent meditation practice can
          </div>
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-focus"></span>
              </div>
              <div class="benefit-text">Increase focus</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-mindfulness"></span>
              </div>
              <div class="benefit-text">Calm the mind</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-sleep"></span>
              </div>
              <div class="benefit-text">Improve sleep</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-lighting"></span>
              </div>
              <div class="benefit-text">Boost energy</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-reduce-stress"></span>
              </div>
              <div class="benefit-text">Reduce stress</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-brain"></span>
              </div>
              <div class="benefit-text">Foster greater mindfulness</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-charity"></span>
              </div>
              <div class="benefit-text">Enhance mind-body health</div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <span class="icon-aol iconaol-emotion"></span>
              </div>
              <div class="benefit-text">Increase positive emotions</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-why-try">
        <div class="container">
          <div class="why-try-content-box">
            <div class="cb-info-container">
              <h2 class="section-title">Why try Art of Living meditations?</h2>
              <p>
                Gurudev is the founder of Art of Living and a world-renowned
                master of meditation. Our guided meditations and techniques are
                rooted in an ancient tradition yet modernized for contemporary
                life.
              </p>
              <p>
                <strong>
                  They take you directly to the heart of meditation in the most
                  deep and effortless way.
                </strong>
              </p>
            </div>
            <div class="cb-image-container">
              <img src="/img/gurudev-talking.webp" alt="gurudev" width="100%" />
            </div>
          </div>
        </div>
      </section>
      <section class="section-quote">
        <div class="container">
          <div class="quote-top-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={106}
              height={52}
              fill="none"
            >
              <g clipPath="url(#a)">
                <mask
                  id="b"
                  width={106}
                  height={107}
                  x={0}
                  y={0}
                  maskUnits="userSpaceOnUse"
                  style={{
                    maskType: 'luminance',
                  }}
                >
                  <path fill="#fff" d="M106 0H0v106.122h106V0Z" />
                </mask>
                <g mask="url(#b)">
                  <path
                    fill="#31364E"
                    d="m62.209-.785-7.686 48.066L79.504 5.52 55.862 48.055l37.742-30.688L56.856 49.24l45.949-15.914-45.421 17.369 48.616.779-48.616.769L102.8 69.623 56.855 53.698l36.742 31.883L55.86 54.884l23.634 42.54-24.973-41.766 7.675 48.067L53 55.926l-9.208 47.797 7.686-48.066L26.495 97.42l23.643-42.535-37.742 30.688 36.748-31.875-45.95 15.915 45.421-17.37L0 51.465l48.615-.77L3.198 33.317 49.144 49.24 12.403 17.358l37.735 30.697-23.633-42.54L51.477 47.28 43.802-.787 53 47.013 62.21-.786Z"
                  />
                </g>
              </g>
              <defs>
                <clipPath id="a">
                  <path fill="#fff" d="M0 0h106v52H0z" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div class="quote-text">
            "You've been meditating even before your birth, when you were in
            your mother's womb, doing nothing-just being. That is meditation.
            There's a natural tendency in every human being to desire that state
            of absolute comfort."
          </div>
          <div class="quote-author">Gurudev Sri Sri Ravi Shankar</div>
        </div>
      </section>
      <section class="section-top-pics">
        <div class="container">
          <h2 class="section-title">Meditation is for everyone</h2>
          <div class="section-desc">Guided meditations for any mood.</div>
          <div class="categories-pills">
            <a href="#" class="cat-pill active">
              Calm
            </a>
            <a href="#" class="cat-pill">
              Gratitude
            </a>
            <a href="#" class="cat-pill">
              Love
            </a>
            <a href="#" class="cat-pill">
              Peace
            </a>
            <a href="#" class="cat-pill">
              Uncertainty
            </a>
            <a href="#" class="cat-pill">
              Stress
            </a>
            <a href="#" class="cat-pill">
              Anxiety
            </a>
            <a href="#" class="cat-pill">
              Focus
            </a>
            <a href="#" class="cat-pill">
              Energy
            </a>
            <a href="#" class="cat-pill">
              Beginners
            </a>
            <a href="#" class="cat-pill">
              Relationships
            </a>
            <a href="#" class="cat-pill">
              Anger
            </a>
            <a href="#" class="cat-pill">
              Contentment
            </a>
            <a href="#" class="cat-pill">
              Self - Esteem
            </a>
          </div>
          <div class="top-picks-container">
            <div class="top-picks-content top-picks-slider swiper">
              <div class="top-picks-header">
                <div class="top-picks-title">Top picks</div>
                <div class="top-picks-actions">
                  <div class="slide-button-prev">
                    <span class="icon-aol iconaol-arrow-long-left"></span>
                  </div>
                  <div class="slide-button-next">
                    <span class="icon-aol iconaol-arrow-long-right"></span>
                  </div>
                </div>
              </div>
              <Swiper {...swiperOption} className="reviews-slider">
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview1.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">05:53</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Experiencing Contentment</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Sri Sri Ravi Shankar
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview2.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">07:17</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Smile that Never Fades</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Poonam Tandon
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview3.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">16:10</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Observing Thoughts</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Vanitha Thulasiraman
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview4.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">04:15</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Settling thoughts</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Bhushan Deodhar
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview3.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">16:10</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Observing Thoughts</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Vanitha Thulasiraman
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div class="swiper-slide">
                    <div class="top-pick-preview-area">
                      <img
                        src="/img/top-pick-preview4.webp"
                        class="top-pick-img"
                        alt="top pick"
                        width="100%"
                      />
                      <div class="preview-info">
                        <div class="play-time">04:15</div>
                        <div class="lock-info">
                          <span class="icon-aol iconaol-lock"></span>
                        </div>
                      </div>
                    </div>
                    <div class="top-pick-content-info">
                      <div class="top-pick-title">Settling thoughts</div>
                      <div class="top-pick-author">
                        <span class="icon-aol iconaol-profile"></span>
                        Bhushan Deodhar
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
      <section class="experience-journey">
        <div class="container">
          <div class="experience-journey-content-wrap">
            <div class="ej-content-info">
              <h2 class="section-title">
                Experience deep calm & inner stillness
              </h2>
              <div class="section-desc">
                <strong>Join the 7-day on-demand meditation journey</strong> to
                deeply relax and reconnect with inner peace, calm, and joy. Dive
                into a profound restorative experience, guided by world-renowned
                meditation master, Gurudev.
              </div>
              <div class="experience-features">
                <div class="ef-item">
                  <div class="ef-icon">
                    <span class="icon-aol iconaol-emotion"></span>
                  </div>
                  <div class="ef-text">Receive a new meditation each day</div>
                </div>
                <div class="ef-item">
                  <div class="ef-icon">
                    <span class="icon-aol iconaol-chat-flower"></span>
                  </div>
                  <div class="ef-text">Acquire new meditation tips</div>
                </div>
                <div class="ef-item">
                  <div class="ef-icon">
                    <span class="icon-aol iconaol-sleep"></span>
                  </div>
                  <div class="ef-text">
                    Release stress & reconnect with calm
                  </div>
                </div>
                <div class="ef-item">
                  <div class="ef-icon">
                    <span class="icon-aol iconaol-key"></span>
                  </div>
                  <div class="ef-text">Gain access to valuable insights</div>
                </div>
              </div>
            </div>
            <div class="journey-form-wrap">
              <h3 class="form-title">FREE 7-Day Meditation Journey</h3>
              <div class="form-item">
                <label>Email address*</label>
                <input
                  type="email"
                  placeholder="Email address"
                  value="olivia@untitledui.com"
                />
              </div>
              <div class="form-item">
                <label>First name*</label>
                <input type="text" placeholder="First name" value="Olivia" />
              </div>
              <div class="form-item">
                <label>Mobile number</label>
                <input
                  type="phone"
                  placeholder="Mobile number"
                  value="+1 (555) 000-0000"
                />
              </div>
              <div class="form-action">
                <input
                  type="submit"
                  class="btn-primary"
                  value="Reserve my free spot"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="featured-in">
        <div class="container">
          <h2 class="section-title">Featured In</h2>
          <div class="featured-listing">
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/WP.webp" alt="washington post" />
              </div>
              <div class="featured-item-text">"Like fresh air to millions"</div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/Harvard.webp" alt="Harvard Health Publishing" />
              </div>
              <div class="featured-item-text">
                "Shows promise in providing relief for depression"
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/Yoga.webp" alt="Yoga Journal" />
              </div>
              <div class="featured-item-text">
                "May be the fastest growing spiritual practice on the planet"
              </div>
            </div>
            <div class="featured-item">
              <div class="featured-item-logo">
                <img src="/img/CNN.webp" alt="CNN" />
              </div>
              <div class="featured-item-text">"Life Changing"</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-testimonials">
        <div class="container">
          <div class="top-text">TESTIMONIALS</div>
          <h2 class="section-title">What people are sharing</h2>
          <div class="testimonials-listing">
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-adinah.webp"
                  alt="Adinah"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “Wow. It made a significant impression on me, was very very
                enjoyable, at times profound, and I plan to keep practicing.”
              </div>
              <div class="author-name">Adinah</div>
            </div>
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-joanna.webp"
                  alt="Joanna"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “It was awesome! I regained my mental health. And I also feel so
                much lighter and happier. I got out of my funk that was getting
                me unmotivated.”
              </div>
              <div class="author-name">Joanna</div>
            </div>
            <div class="testimonial-item">
              <div class="author-picutre">
                <img
                  src="/img/testimony-vijitha.webp"
                  alt="Vijitha"
                  height="70"
                  width="70"
                />
              </div>
              <div class="testimony-text">
                “It was liberating. Any time my mind is wiggling between the
                past and the future, I notice it and have found a hack to bring
                myself back to the present.”
              </div>
              <div class="author-name">Vijitha</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-faq">
        <div class="container">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <div id="accordion" class="accordion">
            <div class="card" onClick={() => setAccordionIndex(0)}>
              <div class="card-header" id="headingOne">
                <h5 class="mb-0">
                  <button
                    class="btn btn-link"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                    aria-expanded={accordionIndex === 0 ? true : false}
                    aria-controls="collapseOne"
                  >
                    Is meditation for me?
                  </button>
                </h5>
              </div>

              <div
                id="collapseOne"
                class={`collapse ${accordionIndex === 0 ? 'show' : ''}`}
                aria-labelledby="headingOne"
                data-parent="#accordion"
              >
                <div class="card-body">
                  Yes! Everyone benefits from meditation. It is accessible to
                  everyone. There are SO many reasons people start
                  meditating—physical, mental, emotional, and more. The benefits
                  are broad and extensive. Experience is the best way to
                  discover just how profound the practice is.
                </div>
              </div>
            </div>
            <div class="card" onClick={() => setAccordionIndex(1)}>
              <div class="card-header" id="headingThree">
                <h5 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseThree"
                    aria-expanded={accordionIndex === 1 ? true : false}
                    aria-controls="collapseThree"
                  >
                    How do I make meditation a habit?
                  </button>
                </h5>
              </div>
              <div
                id="collapseThree"
                class={`collapse ${accordionIndex === 1 ? 'show' : ''}`}
                aria-labelledby="headingThree"
                data-parent="#accordion"
              >
                <div class="card-body">
                  Yes! Everyone benefits from meditation. It is accessible to
                  everyone. There are SO many reasons people start
                  meditating—physical, mental, emotional, and more. The benefits
                  are broad and extensive. Experience is the best way to
                  discover just how profound the practice is.
                </div>
              </div>
            </div>
            <div class="card" onClick={() => setAccordionIndex(2)}>
              <div class="card-header" id="headingFour">
                <h5 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseFour"
                    aria-expanded={accordionIndex === 2 ? true : false}
                    aria-controls="collapseFour"
                  >
                    Do I have to sit cross-legged?
                  </button>
                </h5>
              </div>
              <div
                id="collapseFour"
                class={`collapse ${accordionIndex === 2 ? 'show' : ''}`}
                aria-labelledby="headingFour"
                data-parent="#accordion"
              >
                <div class="card-body">
                  Yes! Everyone benefits from meditation. It is accessible to
                  everyone. There are SO many reasons people start
                  meditating—physical, mental, emotional, and more. The benefits
                  are broad and extensive. Experience is the best way to
                  discover just how profound the practice is.
                </div>
              </div>
            </div>
            <div class="card" onClick={() => setAccordionIndex(3)}>
              <div class="card-header" id="headingFive">
                <h5 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseFive"
                    aria-expanded={accordionIndex === 3 ? true : false}
                    aria-controls="collapseFive"
                  >
                    When is the best time to meditate?
                  </button>
                </h5>
              </div>
              <div
                id="collapseFive"
                class={`collapse ${accordionIndex === 3 ? 'show' : ''}`}
                aria-labelledby="headingFive"
                data-parent="#accordion"
              >
                <div class="card-body">
                  Yes! Everyone benefits from meditation. It is accessible to
                  everyone. There are SO many reasons people start
                  meditating—physical, mental, emotional, and more. The benefits
                  are broad and extensive. Experience is the best way to
                  discover just how profound the practice is.
                </div>
              </div>
            </div>
            <div class="card" onClick={() => setAccordionIndex(4)}>
              <div class="card-header" id="headingSix">
                <h5 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    data-toggle="collapse"
                    data-target="#collapseSix"
                    aria-expanded={accordionIndex === 4 ? true : false}
                    aria-controls="collapseSix"
                  >
                    How do I start meditating?
                  </button>
                </h5>
              </div>
              <div
                id="collapseSix"
                class={`collapse ${accordionIndex === 4 ? 'show' : ''}`}
                aria-labelledby="headingSix"
                data-parent="#accordion"
              >
                <div class="card-body">
                  Yes! Everyone benefits from meditation. It is accessible to
                  everyone. There are SO many reasons people start
                  meditating—physical, mental, emotional, and more. The benefits
                  are broad and extensive. Experience is the best way to
                  discover just how profound the practice is.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-key-highlights">
        <div class="container">
          <div class="key-highlights">
            <div class="key-item">
              <div class="key-item--title">42</div>
              <div class="key-item--desc">Years of transforming lives</div>
            </div>
            <div class="key-item">
              <div class="key-item--title">180</div>
              <div class="key-item--desc">
                Countries where our programs made a difference
              </div>
            </div>
            <div class="key-item">
              <div class="key-item--title">500M+</div>
              <div class="key-item--desc">
                Lives touched through our courses & events
              </div>
            </div>
            <div class="key-item">
              <div class="key-item--title">10,000+</div>
              <div class="key-item--desc">Centers worldwide</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GuidedMeditation;
