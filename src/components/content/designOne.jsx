import React from "react";
import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Popup } from "@components";
import { DURATION } from "@constants";
import { NextSeo } from "next-seo";

const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ":" + String(minutes).padStart(2, 0);
};

export const DesignOne = ({
  data,
  token,
  authenticated,
  swiperOption,
  pickCategoryImage,
  backgroundIterator,
  markFavorite,
  meditateClickHandle,
  showFilterModal,
  toggleFilter,
  onFilterChange,
  topic,
  meditationCategory,
  instructorList,
  instructor,
  findMeditation,
  duration,
}) => {
  let listingFolders = data.folder.filter((folder) => folder.isListingFolder);
  const nonListingFolders = data.folder.filter(
    (folder) => !folder.isListingFolder,
  );

  const popularFolder = listingFolders.find(
    (folder) =>
      folder.title && folder.title.toLowerCase().indexOf("popular") > -1,
  );

  if (popularFolder) {
    listingFolders = listingFolders.filter(
      (folder) => folder.id !== popularFolder.id,
    );
  }
  return (
    <main className="background-image meditation">
      <NextSeo title="Meditations" />
      <section className="top-column meditation-page">
        <div className="container">
          <p className="type-course">Guided Meditations</p>
          {/* <h1 className="course-name">{randomMeditate.title}</h1>
          <p className="type-guide">{randomMeditate.primaryTeacherName}</p>
          <button
            type="button"
            id="play"
            name="play"
            play="false"
            onClick={meditateClickHandle(randomMeditate)}
          >
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
          </button> */}
        </div>
      </section>
      <section className="courses courses-dop pb-4">
        <div className="search_course_form_mobile d-md-none d-block">
          <div className="">
            <div className="row m-0 justify-content-between align-items-center">
              <p className="title mb-0">Find a Meditation</p>
              <div className="filter">
                <div className="filter--button" onClick={toggleFilter}>
                  <img src="/img/ic-filter.svg" alt="filter" />
                  Filters
                  <span id="filter-count">0</span>
                </div>
              </div>
            </div>
            <div
              className={classNames("filter--box", {
                "d-none": !showFilterModal,
              })}
            >
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
          {nonListingFolders &&
            nonListingFolders.map((folder, i) => (
              <SwiperSlide key={i} className="category-slide-item">
                <Link href={`/library/collection/${folder.id}`}>
                  <div
                    className="card image-card image-card-1 contentCard"
                    style={{
                      background: `url(${
                        folder.coverImage
                          ? folder.coverImage.url
                          : pickCategoryImage(backgroundIterator)
                      }) no-repeat center/cover`,
                    }}
                  >
                    <h5 className="card-title">{folder.title}</h5>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
        </Swiper>
      </section>
      {popularFolder &&
        popularFolder.content &&
        popularFolder.content.length > 0 && (
          <section className="browse-category most-popular">
            <p className="title-slider">
              Most Popular{" "}
              <Link href={`/meditation`}>
                <span className="popular-all">All</span>
              </Link>
            </p>
            <Swiper {...swiperOption}>
              {popularFolder.content.map((meditate) => (
                <SwiperSlide
                  className="swiper-slide popular-slide-item"
                  key={meditate.sfid}
                >
                  <div
                    className={classNames(
                      "card image-card image-card-1 contentCard",
                    )}
                    data-play-meditation
                    style={{
                      background: `url(${
                        meditate.coverImage
                          ? meditate.coverImage.url
                          : "/img/card-1a.png"
                      }) no-repeat center/cover`,
                    }}
                  >
                    <div className="duration-wrapper">
                      <span className="duration">
                        {timeConvert(meditate.duration)}
                      </span>
                      {!meditate.accessible && (
                        <span className="lock">
                          <img src="/img/ic-lock.png" />
                        </span>
                      )}
                    </div>
                    {meditate.accessible && (
                      <div
                        onClick={markFavorite(meditate)}
                        className={
                          meditate.isFavorite
                            ? "course-like liked"
                            : "course-like"
                        }
                      ></div>
                    )}
                    <div
                      className="forClick"
                      onClick={meditateClickHandle(meditate)}
                    ></div>
                    <h5 className="card-title">{meditate.title}</h5>
                    <p className="card-text">{meditate.primaryTeacherName}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      <section className="browse-category most-popular d-none d-md-block">
        <p className="title-slider">Find a meditation</p>
        <div className="buttons-wrapper">
          <Popup
            tabIndex="1"
            value={topic}
            buttonText={topic ? topic : "Topic"}
            closeEvent={onFilterChange("topicFilter")}
          >
            {({ closeHandler }) => (
              <>
                {meditationCategory &&
                  meditationCategory.map((category) => (
                    <li onClick={closeHandler(category)} key={category}>
                      {category}
                    </li>
                  ))}
              </>
            )}
          </Popup>

          <Popup
            tabIndex="2"
            value={duration}
            buttonText={duration ? DURATION[duration].name : "Duration"}
            closeEvent={onFilterChange("durationFilter")}
          >
            {({ closeHandler }) => (
              <>
                <li onClick={closeHandler("MINUTES_5")}>
                  {DURATION.MINUTES_5.name}
                </li>
                <li onClick={closeHandler("MINUTES_10")}>
                  {DURATION.MINUTES_10.name}
                </li>
                <li onClick={closeHandler("MINUTES_20")}>
                  {DURATION.MINUTES_20.name}
                </li>
              </>
            )}
          </Popup>
          <Popup
            tabIndex="3"
            value={instructor}
            buttonText={instructor ? instructor : "Instructor"}
            closeEvent={onFilterChange("instructorFilter")}
          >
            {({ closeHandler }) => (
              <>
                {instructorList &&
                  instructorList.map((instructor) => (
                    <li
                      key={instructor.primaryTeacherName}
                      className="topic-dropdown"
                      onClick={closeHandler(instructor.primaryTeacherName)}
                    >
                      {instructor.primaryTeacherName}
                    </li>
                  ))}
              </>
            )}
          </Popup>

          <button
            onClick={findMeditation}
            className="btn tooltip-button_search"
          >
            Search
          </button>
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
            <a href="https://aolf.me/sky" className="learn-more-link">
              Learn More
            </a>
          </div>
        </div>
      </section>
      {listingFolders &&
        listingFolders.map((folder) => {
          return (
            <section className="browse-category most-popular" key={folder.id}>
              <p className="title-slider">{folder.title}</p>
              <Swiper {...swiperOption}>
                {folder.content.map((meditate) => (
                  <SwiperSlide
                    className="swiper-slide popular-slide-item"
                    key={meditate.sfid}
                  >
                    <div
                      className={classNames(
                        "card image-card image-card-1 contentCard",
                      )}
                      data-play-meditation
                      style={{
                        background: `url(${
                          meditate.coverImage
                            ? meditate.coverImage.url
                            : "/img/card-1a.png"
                        }) no-repeat center/cover`,
                      }}
                    >
                      <div className="duration-wrapper">
                        <span className="duration">
                          {timeConvert(meditate.duration)}
                        </span>
                        {!meditate.accessible && (
                          <span className="lock">
                            {" "}
                            <img src="/img/ic-lock.png" />{" "}
                          </span>
                        )}
                      </div>
                      {meditate.accessible && (
                        <div
                          onClick={markFavorite(meditate)}
                          className={
                            meditate.isFavorite
                              ? "course-like liked"
                              : "course-like"
                          }
                        ></div>
                      )}
                      <div
                        className="forClick"
                        onClick={meditateClickHandle(meditate)}
                      ></div>
                      <h5 className="card-title">{meditate.title}</h5>
                      <p className="card-text">{meditate.primaryTeacherName}</p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          );
        })}
      {/* <section className="browse-category most-popular">
        <p className="title-slider">{firstCategory}</p>
        <Swiper {...swiperOption}>
          {firstCategoryMeditations.map((meditate) => (
            <SwiperSlide
              className="swiper-slide popular-slide-item"
              key={meditate.sfid}
            >
              <div
                className={classNames(
                  "card image-card image-card-1 courseCard",
                )}
                data-play-meditation
                style={{
                  background: `url(${
                    meditate.coverImage
                      ? meditate.coverImage.url
                      : "/img/card-1a.png"
                  }) no-repeat center/cover`,
                }}
              >
                <div className="duration-wrapper">
                  <span className="duration">
                    {timeConvert(meditate.duration)}
                  </span>
                  {!meditate.accessible && (
                    <span className="lock">
                      {" "}
                      <img src="/img/ic-lock.png" />{" "}
                    </span>
                  )}
                </div>
                {meditate.accessible && (
                  <div
                    onClick={markFavorite(meditate)}
                    className={
                      meditate.isFavorite ? "course-like liked" : "course-like"
                    }
                  ></div>
                )}
                <div
                  className="forClick"
                  onClick={meditateClickHandle(meditate)}
                ></div>
                <h5 className="card-title">{meditate.title}</h5>
                <p className="card-text">{meditate.primaryTeacherName}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <section className="browse-category most-popular">
        <p className="title-slider">{secoundCategory}</p>
        <Swiper {...swiperOption}>
          {secoundCategoryMeditations.map((meditate) => (
            <SwiperSlide
              className="swiper-slide popular-slide-item"
              key={meditate.sfid}
            >
              <div
                className={classNames(
                  "card image-card image-card-1 courseCard",
                )}
                data-play-meditation
                style={{
                  background: `url(${
                    meditate.coverImage
                      ? meditate.coverImage.url
                      : "/img/card-1a.png"
                  }) no-repeat center/cover`,
                }}
              >
                <div className="duration-wrapper">
                  <span className="duration">
                    {timeConvert(meditate.duration)}
                  </span>
                  {!meditate.accessible && (
                    <span className="lock">
                      {" "}
                      <img src="/img/ic-lock.png" />{" "}
                    </span>
                  )}
                </div>
                {meditate.accessible && (
                  <div
                    onClick={markFavorite(meditate)}
                    className={
                      meditate.isFavorite ? "course-like liked" : "course-like"
                    }
                  ></div>
                )}
                <div
                  className="forClick"
                  onClick={meditateClickHandle(meditate)}
                ></div>
                <h5 className="card-title">{meditate.title}</h5>
                <p className="card-text">{meditate.primaryTeacherName}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section> */}
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
            <button
              onClick={() => window.open("https://aolf.me/intro", "_self")}
              className="btn"
            >
              Register Today
            </button>
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
