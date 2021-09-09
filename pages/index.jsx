import React from "react";
import { api, isSSR } from "@utils";
import { withSSRContext } from "aws-amplify";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/pagination/pagination.min.css";
import "swiper/components/a11y/a11y.min.css";
import "swiper/components/scrollbar/scrollbar.min.css";

const Meditation = ({ workshops, authenticated }) => {
  SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

  let slidesPerView = 5;
  if (!isSSR) {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1600 && screenWidth > 1200) {
      slidesPerView = 4.3;
    } else if (screenWidth < 1200 && screenWidth > 981) {
      slidesPerView = 3.3;
    } else if (screenWidth < 981 && screenWidth > 767) {
      slidesPerView = 3;
    } else if (screenWidth < 767) {
      slidesPerView = 2.2;
    }
  }

  let swiperOption = {
    allowTouchMove: true,
    slidesPerView: slidesPerView,
    spaceBetween: 30,
    preventInteractionOnTransition: true,
    navigation: true,
    breakpoints: {
      320: {
        slidesPerView: 2.2,
      },
      767: {
        slidesPerView: 3,
      },
      981: {
        slidesPerView: 3.3,
      },
      1200: {
        slidesPerView: 4.3,
      },
      1600: {
        slidesPerView: 5,
      },
    },
  };

  return (
    <main class="background-image meditation">
      <section class="top-column meditation-page">
        <div class="container">
          <p class="type-course">Guided Meditations</p>
          <h1 class="course-name">Breath of Relaxation</h1>
          <p class="type-guide">Alan Watts</p>
          <button type="button" id="play" name="play" play="false">
            <div id="playIcon">
              <img class="ic-play-static" src="img/ic-play.svg" alt="" />
              <img class="ic-play-hover" src="img/ic-play-hover.svg" alt="" />
              <img class="ic-pause-static" src="img/ic-pause.svg" alt="" />
              <img class="ic-pause-hover" src="img/ic-pause_hover.svg" alt="" />
            </div>
          </button>
        </div>
      </section>
      <div id="player" class="visible">
        <audio preload="auto" controls id="audioHeader">
          <source src="/sound/demo.mp3" />
        </audio>
        <img src="/img/ic-close-24-r.svg" class="close-player" />
        <img
          src="/img/ic-expand.svg"
          class="expand-player"
          data-toggle="modal"
          data-target="#modal_player"
        />
      </div>
      <section class="courses courses-dop pb-4">
        <div class="search_course_form_mobile d-md-none d-block">
          <div class="">
            <div class="row m-0 justify-content-between align-items-center">
              <p class="title mb-0">Find a Meditation</p>
              <div class="filter">
                <div class="filter--button">
                  <img src="/img/ic-filter.svg" alt="filter" />
                  Filters
                  <span id="filter-count">0</span>
                </div>
              </div>
            </div>
            <div class="filter--box">
              <div class="browse-category mb-3">
                <div class="buttons-wrapper">
                  <div
                    class="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    id="topic-button_mobile"
                  >
                    <a class="btn" href="#">
                      Topic
                    </a>
                  </div>
                  <div
                    id="topic-modal_mobile"
                    data-topic="null"
                    data-course-initial="Topic"
                    class="mobile-modal"
                  >
                    <div class="mobile-modal--header">
                      <div id="topic-close_mobile" class="mobile-modal--close">
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 class="mobile-modal--title">Topic</h2>
                      <div class="dropdown">
                        <button
                          class="custom-dropdown"
                          type="button"
                          id="dropdownTopicButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          Select topic
                        </button>
                        <ul
                          class="dropdown-menu"
                          aria-labelledby="dropdownTopicButton"
                        >
                          <li class="dropdown-item">Gratitude</li>
                          <li class="dropdown-item">Calm</li>
                          <li class="dropdown-item">Beginners</li>
                          <li class="dropdown-item">Peace</li>
                          <li class="dropdown-item">Energy</li>
                        </ul>
                      </div>
                    </div>
                    <div class="mobile-modal--body">
                      <div class="row m-0 align-items-center justify-content-between">
                        <div class="clear">Clear</div>
                        <div class="btn_box_primary select-btn">Select</div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    id="duration-button_mobile"
                  >
                    <a class="btn" href="#">
                      Duration
                    </a>
                  </div>
                  <div
                    id="duration-modal_mobile"
                    data-duration="null"
                    data-course-initial="Duration"
                    class="mobile-modal"
                  >
                    <div class="mobile-modal--header">
                      <div
                        id="duration-close_mobile"
                        class="mobile-modal--close"
                      >
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 class="mobile-modal--title">Duration</h2>
                      <div class="dropdown">
                        <button
                          class="custom-dropdown"
                          type="button"
                          id="dropdownDurationButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          Select duration
                        </button>
                        <ul
                          class="dropdown-menu"
                          aria-labelledby="dropdownTopicButton"
                        >
                          <li class="dropdown-item">5 minutes</li>
                          <li class="dropdown-item">10 minutes</li>
                          <li class="dropdown-item">15 minutes</li>
                        </ul>
                      </div>
                    </div>
                    <div class="mobile-modal--body">
                      <div class="row m-0 align-items-center justify-content-between">
                        <div class="clear">Clear</div>
                        <div class="btn_box_primary select-btn">Select</div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    aria-describedby="tooltip"
                    id="instructor-button_mobile"
                  >
                    <a class="btn" href="#">
                      Instructor{" "}
                    </a>
                  </div>
                  <div
                    id="instructor-modal_mobile"
                    data-instructor="null"
                    data-instructor-initial="Instructor"
                    class="mobile-modal"
                  >
                    <div class="mobile-modal--header">
                      <div
                        id="instructor-close_mobile"
                        class="mobile-modal--close"
                      >
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 class="mobile-modal--title">Instructor</h2>
                      <div
                        class="smart-input-mobile"
                        id="instructor-mobile-input"
                      >
                        <input
                          placeholder="Search instructor"
                          type="text"
                          name="instructor"
                          class="custom-input"
                        />
                        <div class="smart-input--list">
                          <p class="smart-input--list-item">Mary Walker</p>
                          <p class="smart-input--list-item">Rajesh Moksha</p>
                        </div>
                      </div>
                    </div>
                    <div class="mobile-modal--body">
                      <div class="row m-0 align-items-center justify-content-between">
                        <div class="clear">Clear</div>
                        <div
                          id="instructor-search"
                          class="btn_box_primary select-btn"
                        >
                          Select
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="btn_box_primary btn-modal_dropdown full-btn mt-3 search">
                    <a class="btn" href="#">
                      Search{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="browse-category">
        <p class="title-slider">Browse by Category</p>
        <Swiper {...swiperOption}>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-1">
              <h5 class="card-title">Gratitude</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-2">
              <h5 class="card-title">Peace</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-3">
              <h5 class="card-title">Calm</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-4">
              <h5 class="card-title">Energy</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-3">
              <h5 class="card-title">Beginners</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div class="card image-card image-card-3">
              <h5 class="card-title">Gratitude</h5>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section class="browse-category most-popular">
        <p class="title-slider">
          Most Popular <span class="popular-all">All</span>
        </p>
        <Swiper {...swiperOption}>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-1" data-play-meditation>
              <div class="duration-wrapper">
                <span class="duration">26:00</span>
              </div>
              <h5 class="card-title">Blossom Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-2">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">06:00</span>{" "}
                <span class="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 class="card-title">Cool Down Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">18:00</span>{" "}
                <span class="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 class="card-title">Contentment Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-4">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">10:00</span>{" "}
                <span class="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 class="card-title">Ocean of Calmness</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
                <span class="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 class="card-title">You Are Peace</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
                <span class="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 class="card-title">Gratitude</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section class="browse-category most-popular d-none d-md-block">
        <p class="title-slider">Find a meditation</p>
        <div class="buttons-wrapper">
          <div tabindex="1" class="tooltip-button" id="topic-button">
            <div id="topic-type" class="clear-filter"></div>
            <a class="btn">Topic</a>
          </div>
          <ul id="topic-tooltip" class="tooltip-block" role="tooltip">
            <div class="tooltip-arrow" data-popper-arrow></div>
            <li>Gratitude</li>
            <li>Calm</li>
            <li>Beginners</li>
            <li>Peace</li>
            <li>Energy</li>
          </ul>

          <div tabindex="2" class="tooltip-button" id="duration-button">
            <div id="duration-type" class="clear-filter"></div>
            <a class="btn">Duration</a>
          </div>
          <ul id="duration-tooltip" class="tooltip-block" role="tooltip">
            <div class="tooltip-arrow" data-popper-arrow></div>
            <li>5 minutes</li>
            <li>10 minutes</li>
            <li>15 minutes</li>
          </ul>

          <div tabindex="3" class="tooltip-button" id="instructor-button">
            <div id="meetup-type" class="clear-filter"></div>
            <a class="btn">Instructor</a>
          </div>
          <ul id="instructor-tooltip" class="tooltip-block" role="tooltip">
            <div class="tooltip-arrow" data-popper-arrow></div>
            <div class="smart-input">
              <input
                placeholder="Search instructor"
                type="text"
                name="location"
                id="instructor-input"
                class="custom-input"
              />
              <div class="smart-input--list">
                <p class="smart-input--list-item">Mary Walker</p>
                <p class="smart-input--list-item">Rajesh Moksha</p>
              </div>
            </div>
          </ul>

          <button class="btn tooltip-button_search">Search</button>
        </div>
      </section>
      <section class="top-column what-meditation">
        <img
          src="/img/meditation-page-2@2x.png"
          alt=""
          class="background-image"
        />
        <div class="container">
          <p class="type-course">What is meditation?</p>
          <div class="card guide-meditation">
            <h5 class="card-title">
              Meditation is that which gives you deep rest.
            </h5>
            <p class="card-text">
              The delicate art of doing nothing and letting go of all the
              efforts to relax into your true nature which is love, joy and
              peace.
            </p>
            <p class="card-text">
              The rest in meditation is deeper than the deepest sleep that you
              can ever have. When the mind becomes free from agitation, is calm
              and serene and at peace, meditation happens. The benefits of
              meditation are manifold. It is an essential practice for mental
              hygiene.
            </p>
            <a href="#" class="learn-more-link">
              Learn More
            </a>
          </div>
        </div>
      </section>
      <section class="browse-category most-popular">
        <p class="title-slider">Peace</p>
        <Swiper {...swiperOption}>
          <SwiperSlide>
            <div class="card image-card image-card-1">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">Blossom Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-2">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">06:00</span>{" "}
              </div>
              <h5 class="card-title">Cool Down Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">18:00</span>{" "}
              </div>
              <h5 class="card-title">Contentment Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-4">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">10:00</span>{" "}
              </div>
              <h5 class="card-title">Ocean of Calmness</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">You Are Peace</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">Gratitude</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section class="browse-category most-popular">
        <p class="title-slider">Gratitude</p>
        <Swiper {...swiperOption}>
          <SwiperSlide>
            <div class="card image-card image-card-1">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">Blossom Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-2">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">06:00</span>{" "}
              </div>
              <h5 class="card-title">Cool Down Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">18:00</span>{" "}
              </div>
              <h5 class="card-title">Contentment Meditation</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-4">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">10:00</span>{" "}
              </div>
              <h5 class="card-title">Ocean of Calmness</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">You Are Peace</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div class="card image-card image-card-3">
              <div class="duration-wrapper">
                {" "}
                <span class="duration">26:00</span>{" "}
              </div>
              <h5 class="card-title">Gratitude</h5>
              <p class="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section class="top-column last-tips">
        <img
          src="/img/meditation-page-3@2x.png"
          alt=""
          class="background-image"
        />
        <div class="container">
          <div class="card blue">
            <h5 class="card-title">Join a Free Intro to Meditation</h5>
            <p class="card-text">
              Join an online, live session with a certified teacher to discover
              the secrets of meditation and your own breath.
            </p>
            <button class="btn">Register Today</button>
          </div>
          <div class="card yellow">
            <h5 class="card-title">Search Live Meditation Courses</h5>
            <p class="card-text">
              Learn to meditate live online with a certified{" "}
              <br class="mob-none" /> instructor
            </p>
            <button class="btn">Find a Course</button>
          </div>
        </div>
      </section>
    </main>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Meditation;
