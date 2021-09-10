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
    <main className="background-image meditation">
      <section className="top-column meditation-page">
        <div className="container">
          <p className="type-course">Guided Meditations</p>
          <h1 className="course-name">Breath of Relaxation</h1>
          <p className="type-guide">Alan Watts</p>
          <button type="button" id="play" name="play" play="false">
            <div id="playIcon">
              <img className="ic-play-static" src="img/ic-play.svg" alt="" />
              <img
                className="ic-play-hover"
                src="img/ic-play-hover.svg"
                alt=""
              />
              <img className="ic-pause-static" src="img/ic-pause.svg" alt="" />
              <img
                className="ic-pause-hover"
                src="img/ic-pause_hover.svg"
                alt=""
              />
            </div>
          </button>
        </div>
      </section>
      <div id="player" className="visible">
        <audio preload="auto" controls id="audioHeader">
          <source src="/sound/demo.mp3" />
        </audio>
        <img src="/img/ic-close-24-r.svg" className="close-player" />
        <img
          src="/img/ic-expand.svg"
          className="expand-player"
          data-toggle="modal"
          data-target="#modal_player"
        />
      </div>
      <section className="courses courses-dop pb-4">
        <div className="search_course_form_mobile d-md-none d-block">
          <div className="">
            <div className="row m-0 justify-content-between align-items-center">
              <p className="title mb-0">Find a Meditation</p>
              <div className="filter">
                <div className="filter--button">
                  <img src="/img/ic-filter.svg" alt="filter" />
                  Filters
                  <span id="filter-count">0</span>
                </div>
              </div>
            </div>
            <div className="filter--box">
              <div className="browse-category mb-3">
                <div className="buttons-wrapper">
                  <div
                    className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    id="topic-button_mobile"
                  >
                    <a className="btn" href="#">
                      Topic
                    </a>
                  </div>
                  <div
                    id="topic-modal_mobile"
                    data-topic="null"
                    data-course-initial="Topic"
                    className="mobile-modal"
                  >
                    <div className="mobile-modal--header">
                      <div
                        id="topic-close_mobile"
                        className="mobile-modal--close"
                      >
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 className="mobile-modal--title">Topic</h2>
                      <div className="dropdown">
                        <button
                          className="custom-dropdown"
                          type="button"
                          id="dropdownTopicButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          Select topic
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownTopicButton"
                        >
                          <li className="dropdown-item">Gratitude</li>
                          <li className="dropdown-item">Calm</li>
                          <li className="dropdown-item">Beginners</li>
                          <li className="dropdown-item">Peace</li>
                          <li className="dropdown-item">Energy</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mobile-modal--body">
                      <div className="row m-0 align-items-center justify-content-between">
                        <div className="clear">Clear</div>
                        <div className="btn_box_primary select-btn">Select</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    id="duration-button_mobile"
                  >
                    <a className="btn" href="#">
                      Duration
                    </a>
                  </div>
                  <div
                    id="duration-modal_mobile"
                    data-duration="null"
                    data-course-initial="Duration"
                    className="mobile-modal"
                  >
                    <div className="mobile-modal--header">
                      <div
                        id="duration-close_mobile"
                        className="mobile-modal--close"
                      >
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 className="mobile-modal--title">Duration</h2>
                      <div className="dropdown">
                        <button
                          className="custom-dropdown"
                          type="button"
                          id="dropdownDurationButton"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          Select duration
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownTopicButton"
                        >
                          <li className="dropdown-item">5 minutes</li>
                          <li className="dropdown-item">10 minutes</li>
                          <li className="dropdown-item">15 minutes</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mobile-modal--body">
                      <div className="row m-0 align-items-center justify-content-between">
                        <div className="clear">Clear</div>
                        <div className="btn_box_primary select-btn">Select</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                    aria-describedby="tooltip"
                    id="instructor-button_mobile"
                  >
                    <a className="btn" href="#">
                      Instructor{" "}
                    </a>
                  </div>
                  <div
                    id="instructor-modal_mobile"
                    data-instructor="null"
                    data-instructor-initial="Instructor"
                    className="mobile-modal"
                  >
                    <div className="mobile-modal--header">
                      <div
                        id="instructor-close_mobile"
                        className="mobile-modal--close"
                      >
                        <img src="/img/ic-close.svg" alt="close" />
                      </div>
                      <h2 className="mobile-modal--title">Instructor</h2>
                      <div
                        className="smart-input-mobile"
                        id="instructor-mobile-input"
                      >
                        <input
                          placeholder="Search instructor"
                          type="text"
                          name="instructor"
                          className="custom-input"
                        />
                        <div className="smart-input--list">
                          <p className="smart-input--list-item">Mary Walker</p>
                          <p className="smart-input--list-item">
                            Rajesh Moksha
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mobile-modal--body">
                      <div className="row m-0 align-items-center justify-content-between">
                        <div className="clear">Clear</div>
                        <div
                          id="instructor-search"
                          className="btn_box_primary select-btn"
                        >
                          Select
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="btn_box_primary btn-modal_dropdown full-btn mt-3 search">
                    <a className="btn" href="#">
                      Search{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="browse-category">
        <p className="title-slider">Browse by Category</p>
        <Swiper {...swiperOption}>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-1">
              <h5 className="card-title">Gratitude</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-2">
              <h5 className="card-title">Peace</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-3">
              <h5 className="card-title">Calm</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-4">
              <h5 className="card-title">Energy</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-3">
              <h5 className="card-title">Beginners</h5>
            </div>
          </SwiperSlide>
          <SwiperSlide className="category-slide-item">
            <div className="card image-card image-card-3">
              <h5 className="card-title">Gratitude</h5>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section className="browse-category most-popular">
        <p className="title-slider">
          Most Popular <span className="popular-all">All</span>
        </p>
        <Swiper {...swiperOption}>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-1" data-play-meditation>
              <div className="duration-wrapper">
                <span className="duration">26:00</span>
              </div>
              <h5 className="card-title">Blossom Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-2">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">06:00</span>{" "}
                <span className="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 className="card-title">Cool Down Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">18:00</span>{" "}
                <span className="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 className="card-title">Contentment Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-4">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">10:00</span>{" "}
                <span className="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 className="card-title">Ocean of Calmness</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
                <span className="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 className="card-title">You Are Peace</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide className="popular-slide-item">
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
                <span className="lock">
                  <img src="img/ic-lock.png" />
                </span>
              </div>
              <h5 className="card-title">Gratitude</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section className="browse-category most-popular d-none d-md-block">
        <p className="title-slider">Find a meditation</p>
        <div className="buttons-wrapper">
          <div tabindex="1" className="tooltip-button" id="topic-button">
            <div id="topic-type" className="clear-filter"></div>
            <a className="btn">Topic</a>
          </div>
          <ul id="topic-tooltip" className="tooltip-block" role="tooltip">
            <div className="tooltip-arrow" data-popper-arrow></div>
            <li>Gratitude</li>
            <li>Calm</li>
            <li>Beginners</li>
            <li>Peace</li>
            <li>Energy</li>
          </ul>

          <div tabindex="2" className="tooltip-button" id="duration-button">
            <div id="duration-type" className="clear-filter"></div>
            <a className="btn">Duration</a>
          </div>
          <ul id="duration-tooltip" className="tooltip-block" role="tooltip">
            <div className="tooltip-arrow" data-popper-arrow></div>
            <li>5 minutes</li>
            <li>10 minutes</li>
            <li>15 minutes</li>
          </ul>

          <div tabindex="3" className="tooltip-button" id="instructor-button">
            <div id="meetup-type" className="clear-filter"></div>
            <a className="btn">Instructor</a>
          </div>
          <ul id="instructor-tooltip" className="tooltip-block" role="tooltip">
            <div className="tooltip-arrow" data-popper-arrow></div>
            <div className="smart-input">
              <input
                placeholder="Search instructor"
                type="text"
                name="location"
                id="instructor-input"
                className="custom-input"
              />
              <div className="smart-input--list">
                <p className="smart-input--list-item">Mary Walker</p>
                <p className="smart-input--list-item">Rajesh Moksha</p>
              </div>
            </div>
          </ul>

          <button className="btn tooltip-button_search">Search</button>
        </div>
      </section>
      <section className="top-column what-meditation">
        <img
          src="/img/meditation-page-2@2x.png"
          alt=""
          className="background-image"
        />
        <div className="container">
          <p className="type-course">What is meditation?</p>
          <div className="card guide-meditation">
            <h5 className="card-title">
              Meditation is that which gives you deep rest.
            </h5>
            <p className="card-text">
              The delicate art of doing nothing and letting go of all the
              efforts to relax into your true nature which is love, joy and
              peace.
            </p>
            <p className="card-text">
              The rest in meditation is deeper than the deepest sleep that you
              can ever have. When the mind becomes free from agitation, is calm
              and serene and at peace, meditation happens. The benefits of
              meditation are manifold. It is an essential practice for mental
              hygiene.
            </p>
            <a href="#" className="learn-more-link">
              Learn More
            </a>
          </div>
        </div>
      </section>
      <section className="browse-category most-popular">
        <p className="title-slider">Peace</p>
        <Swiper {...swiperOption}>
          <SwiperSlide>
            <div className="card image-card image-card-1">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">Blossom Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-2">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">06:00</span>{" "}
              </div>
              <h5 className="card-title">Cool Down Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">18:00</span>{" "}
              </div>
              <h5 className="card-title">Contentment Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-4">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">10:00</span>{" "}
              </div>
              <h5 className="card-title">Ocean of Calmness</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">You Are Peace</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">Gratitude</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section className="browse-category most-popular">
        <p className="title-slider">Gratitude</p>
        <Swiper {...swiperOption}>
          <SwiperSlide>
            <div className="card image-card image-card-1">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">Blossom Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-2">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">06:00</span>{" "}
              </div>
              <h5 className="card-title">Cool Down Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">18:00</span>{" "}
              </div>
              <h5 className="card-title">Contentment Meditation</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-4">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">10:00</span>{" "}
              </div>
              <h5 className="card-title">Ocean of Calmness</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">You Are Peace</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="card image-card image-card-3">
              <div className="duration-wrapper">
                {" "}
                <span className="duration">26:00</span>{" "}
              </div>
              <h5 className="card-title">Gratitude</h5>
              <p className="card-text">Deepika Desai</p>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>
      <section className="top-column last-tips">
        <img
          src="/img/meditation-page-3@2x.png"
          alt=""
          className="background-image"
        />
        <div className="container">
          <div className="card blue">
            <h5 className="card-title">Join a Free Intro to Meditation</h5>
            <p className="card-text">
              Join an online, live session with a certified teacher to discover
              the secrets of meditation and your own breath.
            </p>
            <button className="btn">Register Today</button>
          </div>
          <div className="card yellow">
            <h5 className="card-title">Search Live Meditation Courses</h5>
            <p className="card-text">
              Learn to meditate live online with a certified{" "}
              <br className="mob-none" /> instructor
            </p>
            <button className="btn">Find a Course</button>
          </div>
        </div>
      </section>
    </main>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default Meditation;
