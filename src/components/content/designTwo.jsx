import React, { useState } from "react";
import classNames from "classnames";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Popup } from "@components";
import { DURATION } from "@constants";

const CATEGORY_IMAGES = [
  "/img/card-1a.png",
  "/img/card-2a.png",
  "/img/card-6.png",
  "/img/card-4a.png",
];

const timeConvert = (data) => {
  const minutes = data % 60;
  const hours = (data - minutes) / 60;

  return String(hours).padStart(2, 0) + ":" + String(minutes).padStart(2, 0);
};

export const DesignTwo = ({
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
  favouriteContents,
}) => {
  let favouriteContentOnly = [];
  const contentFolders = data.folder.map((folder) => {
    const content = folder.content.map((content) => {
      const isFavorite = favouriteContents.find(
        (el) => el.sfid === content.sfid,
      );
      if (isFavorite) {
        favouriteContentOnly = [
          ...favouriteContentOnly,
          {
            ...content,
            isFavorite: !!isFavorite,
          },
        ];
      }
      return {
        ...content,
        isFavorite: !!isFavorite,
      };
    });

    return {
      ...folder,
      content,
    };
  });
  let listingFolders = contentFolders.filter(
    (folder) => folder.isListingFolder,
  );
  const nonListingFolders = contentFolders.filter(
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
    <main className="background-image meditation insight-collection insight-collection3">
      <section className="top-column meditation-page browse-category insight-collection insight-collection3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-6 text-left">
              <h1 className="course-name">Insights</h1>
              <p className="course-description">
                Find inspiration for your life and practice
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="search_course_form_mobile d-lg-none d-block ">
        <div className="container">
          <div className="row m-0 justify-content-between align-items-center">
            <p className="title mb-0">Search</p>
            <div className="filter">
              <div className="filter--button d-flex">
                <img src="./img/ic-filter.svg" alt="filter" />
                Filter
                <span id="filter-count">0</span>
              </div>
            </div>
          </div>

          <div className="filter--box">
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
                <div id="duration-close_mobile" className="mobile-modal--close">
                  <img src="./img/ic-close.svg" alt="close" />
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
                  <img src="./img/ic-close.svg" alt="close" />
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
                    <p className="smart-input--list-item">Rajesh Moksha</p>
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

            <div
              tabIndex="3"
              className="btn_outline_box btn-modal_dropdown full-btn mt-3"
              id="topic-search_mobile"
              aria-describedby="topic-search_mobile"
            >
              <input
                type="text"
                name="location"
                id="topic-input"
                className="btn"
              />
              <div className="placeholder btn">Search Topic</div>
            </div>
            <div
              id="topic-search_mobile"
              data-instructor="null"
              data-instructor-initial="Instructor"
              className="mobile-modal"
            >
              <div className="mobile-modal--header">
                <div
                  id="instructor-close_mobile"
                  className="mobile-modal--close"
                >
                  <img src="./img/ic-close.svg" alt="close" />
                </div>
                <h2 className="mobile-modal--title">Topics</h2>
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
          </div>
        </div>
      </div>

      <section className="browse-category most-popular d-none d-lg-block">
        <p className="title-slider">Search</p>
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
      <section className="browse-category most-popular">
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

      <section className="top-column what-meditation">
        <img
          src="/img/meditation-page-2@2x.png"
          alt=""
          className="background-image"
        />
        <div className="container">
          <p className="type-course">Discover SKY Journey</p>
          <div className="card guide-meditation">
            <h5 className="card-title">A renewal in mind, body, and spirit</h5>
            <p className="card-text">
              SKY Journey helps guide you through the process of how to create a
              habit that sticks. Not just any habit - a life-transforming habit
              of meditation. Combining guided daily SKY Breath Meditation with
              insights from a variety of our best teachers, the journey coaches
              you through your first 5 weeks of practice (and beyond!). Download
              the Art of Living Journey App to get started on your SKY Journey
              today!
            </p>
          </div>
        </div>
      </section>
      {authenticated && (
        <>
          {favouriteContentOnly && favouriteContentOnly.length > 0 && (
            <section className="browse-category most-popular">
              <p className="title-slider">My Favorites</p>
              <Swiper className="swiper-container" {...swiperOption}>
                {favouriteContentOnly.map((meditate) => (
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
          )}
        </>
      )}

      <section className="browse-category most-popular">
        <p className="title-slider">Browse by Expedition</p>
        <div className="swiper-container">
          <div className="swiper-wrapper">
            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-1">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">
                  How to Control Your Thoughts During Meditation
                </h5>
                <p className="card-text">Article</p>
              </div>
            </div>

            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-2">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">Cool Down Meditation</h5>
                <p className="card-text">Deepika Desai</p>
              </div>
            </div>

            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-3">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">Contentment Meditation</h5>
                <p className="card-text">Deepika Desai</p>
              </div>
            </div>

            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-4">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">Ocean of Calmness</h5>
                <p className="card-text">Deepika Desai</p>
              </div>
            </div>

            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-3">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">You Are Peace</h5>
                <p className="card-text">Deepika Desai</p>
              </div>
            </div>

            <div
              className="swiper-slide popular-slide-item"
              data-toggle="modal"
              data-target="#modal_locked"
            >
              <div className="card image-card image-card-3">
                <div className="duration-wrapper"></div>
                <h5 className="card-title">Gratitude</h5>
                <p className="card-text">Deepika Desai</p>
              </div>
            </div>
          </div>
          <div className="swiper-button-next popular__button-next comments__button-next"></div>
          <div className="swiper-button-prev popular__button-prev comments__button-prev"></div>
        </div>
      </section>
    </main>
  );
};
