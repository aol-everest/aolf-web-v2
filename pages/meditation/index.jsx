import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { api } from "@utils";
import classNames from "classnames";
import { NextSeo } from "next-seo";
import { useIntersectionObserver } from "@hooks";
import { useUIDSeed } from "react-uid";
import { WorkshopTile } from "@components/workshop/workshopTile";
import { LinkedCalendar } from "@components/dateRangePicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import { withSSRContext } from "aws-amplify";
import {
  Popup,
  SmartInput,
  MobileFilterModal,
  SmartDropDown,
  DateRangeInput,
} from "@components";
import { useQueryString } from "@hooks";
import { COURSE_TYPES, TIME_ZONE, COURSE_MODES } from "@constants";
import { InfiniteScrollLoader } from "@components/loader";

export const getServerSideProps = async (context) => {
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext(context);
    const user = await Auth.currentAuthenticatedUser();
    token = user.signInUserSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
    };
  } catch (err) {
    props = {
      authenticated: false,
    };
  }
  const {
    page = 1,
    mode = COURSE_MODES.ONLINE,
    location,
    courseType,
    startEndDate,
    timeZone,
    instructor,
  } = context.query;
  // Fetch data from external API
  try {
    let param = {
      page,
      size: 8,
    };

    if (mode) {
      param = {
        ...param,
        mode,
      };
    }
    if (courseType && COURSE_TYPES[courseType]) {
      param = {
        ...param,
        ctype: COURSE_TYPES[courseType].value,
      };
    }
    if (timeZone && TIME_ZONE[timeZone]) {
      param = {
        ...param,
        timeZone: TIME_ZONE[timeZone].value,
      };
    }
    if (instructor && instructor.value) {
      param = {
        ...param,
        teacherId: instructor.value,
      };
    }
    if (startEndDate) {
      const [startDate, endDate] = startEndDate.split("|");
      param = {
        ...param,
        sdate: startDate,
        eDate: endDate,
      };
    }

    const res = await api.get({
      path: "meditations",
      token,
      param,
    });
    props = {
      ...props,
      workshops: {
        pages: [{ data: res }],
        pageParams: [null],
      },
    };
  } catch (err) {
    props = {
      ...props,
      workshops: {
        error: { message: err.message },
      },
    };
  }
  // Pass data to the page via props
  return { props };
};

async function queryInstructor({ queryKey: [_, term] }) {
  const response = await api.get({
    path: "cf/teachers",
    param: {
      query: term,
    },
  });
  return response;
}

const MeditationFind = ({ meditations, authenticated, query }) => {
  const seed = useUIDSeed();

  const [category, setCategory] = useQueryString("category");
  const [duration, setDuration] = useQueryString("duration");
  const [teacher, setTeacher] = useQueryString("teacher");

  const [searchKey, setSearchKey] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case "category":
        setCategory(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "teacher":
        setTeacher(value);
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    switch (field) {
      case "category":
        setCategory(value);
        break;
      case "duration":
        setDuration(value);
        break;
      case "teacher":
        setTeacher(value);
        break;
    }
  };

  const onFilterClearEvent = (field) => async () => {
    switch (field) {
      case "category":
        setCategory(null);
        break;
      case "duration":
        setDuration(null);
        break;
      case "teacher":
        setTeacher(null);
        break;
    }
  };

  const {
    status,
    isSuccess,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    [
      "meditations",
      {
        courseTypeFilter,
        filterStartEndDate,
        timeZoneFilter,
        instructorFilter,
        activeFilterType,
      },
    ],
    async ({ pageParam = 1 }) => {
      let param = {
        page: pageParam,
        size: 8,
      };

      if (category) {
        param = {
          ...param,
          category,
        };
      }
      if (duration) {
        param = {
          ...param,
          duration,
        };
      }
      if (teacher) {
        param = {
          ...param,
          teacher,
        };
      }

      const res = await api.get({
        path: "meditations",
        param,
      });
      return res;
    },
    {
      getNextPageParam: (page) => {
        return page.currectPage === page.lastPage
          ? undefined
          : page.currectPage + 1;
      },
    },
    { initialData: meditations },
  );

  const loadMoreRef = React.useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  return (
    <main className="meetsup-filter">
      <NextSeo title="Meditations" />
      <section className="courses">
        <div className="container search_course_form d-lg-block d-none mb-2">
          <div className="row">
            <div className="col">
              <p className="title mb-3">Find a meditation </p>
            </div>
          </div>
          <div className="row">
            <div className="search-form col-12 d-flex align-items-center">
              <div id="switch-filter" className="btn_outline_box ml-0">
                <a
                  className="btn"
                  href="#"
                  data-swicth-active={activeFilterType === COURSE_MODES.ONLINE}
                  onClick={toggleActiveFilter(COURSE_MODES.ONLINE)}
                >
                  Online
                </a>
                <a
                  className="btn"
                  href="#"
                  data-swicth-active={
                    activeFilterType === COURSE_MODES.IN_PERSON
                  }
                  onClick={toggleActiveFilter(COURSE_MODES.IN_PERSON)}
                >
                  In Person
                </a>
              </div>
              <div className="switch-flter-container">
                <Popup
                  tabIndex="1"
                  value={category}
                  buttonText={
                    category && !isEmpty(topic) ? topic.name : "Topic"
                  }
                  closeEvent={this.onFilterChange("topic")}
                >
                  {({ closeHandler }) => (
                    <>
                      {meditationCategory &&
                        meditationCategory.map((category) => (
                          <li
                            onClick={closeHandler({
                              name: category.key,
                            })}
                          >
                            {category.key}
                          </li>
                        ))}
                    </>
                  )}
                </Popup>
                <Popup
                  tabIndex="2"
                  value={category}
                  buttonText={
                    courseTypeFilter && COURSE_TYPES[courseTypeFilter]
                      ? COURSE_TYPES[courseTypeFilter].name
                      : "Course Type"
                  }
                  closeEvent={onFilterChange("courseTypeFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      <li onClick={closeHandler("SKY_BREATH_MEDITATION")}>
                        {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                      </li>
                      <li onClick={closeHandler("SILENT_RETREAT")}>
                        {COURSE_TYPES.SILENT_RETREAT.name}
                      </li>
                      <li onClick={closeHandler("SAHAJ_SAMADHI_MEDITATION")}>
                        {COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.name}
                      </li>
                    </>
                  )}
                </Popup>

                <Popup
                  tabIndex="5"
                  value={instructorFilter ? instructorFilter.label : null}
                  buttonText={
                    instructorFilter ? instructorFilter.label : "Instructor"
                  }
                  closeEvent={onFilterChange("instructorFilter")}
                >
                  {({ closeHandler }) => (
                    <SmartInput
                      inputclassName={Style.instructor_input}
                      onSearchKeyChange={(value) => setSearchKey(value)}
                      dataList={instructorList}
                      closeHandler={closeHandler}
                      value={searchKey}
                    ></SmartInput>
                  )}
                </Popup>
              </div>
            </div>
          </div>
        </div>
        <div className="search_course_form_mobile d-lg-none d-block">
          <div className="container">
            <div className="row m-0 justify-content-between align-items-center">
              <p className="title mb-0">Find a meditation</p>
              <div className="filter">
                <div className="filter--button d-flex" onClick={toggleFilter}>
                  <img src="./img/ic-filter.svg" alt="filter" />
                  Filter
                  <span id="filter-count">0</span>
                </div>
              </div>
            </div>
            <div
              className={classNames("filter--box", {
                "d-none": !showFilterModal,
              })}
            >
              <div
                id="switch-mobile-filter"
                className="btn_outline_box full-btn mt-3"
              >
                <a
                  className="btn"
                  href="#"
                  data-swicth-active={activeFilterType === COURSE_MODES.ONLINE}
                  onClick={toggleActiveFilter(COURSE_MODES.ONLINE)}
                >
                  Online
                </a>
                <a
                  className="btn"
                  href="#"
                  data-swicth-active={
                    activeFilterType === COURSE_MODES.IN_PERSON
                  }
                  onClick={toggleActiveFilter(COURSE_MODES.IN_PERSON)}
                >
                  In Person
                </a>
              </div>

              <MobileFilterModal
                modalTitle="Course Type"
                buttonText={
                  courseTypeFilter && COURSE_TYPES[courseTypeFilter]
                    ? COURSE_TYPES[courseTypeFilter].name
                    : "Course Type"
                }
                clearEvent={onFilterClearEvent("courseTypeFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={courseTypeFilter}
                    buttonText={
                      courseTypeFilter ? courseTypeFilter : "Select Course"
                    }
                    closeEvent={onFilterChange("courseTypeFilter")}
                  >
                    {({ closeHandler }) => (
                      <>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler("SKY_BREATH_MEDITATION")}
                        >
                          {COURSE_TYPES.SKY_BREATH_MEDITATION.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler("SILENT_RETREAT")}
                        >
                          {COURSE_TYPES.SILENT_RETREAT.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler("SAHAJ_SAMADHI_MEDITATION")}
                        >
                          {COURSE_TYPES.SAHAJ_SAMADHI_MEDITATION.name}
                        </li>
                      </>
                    )}
                  </SmartDropDown>
                </div>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Dates"
                buttonText={
                  filterStartEndDate
                    ? filterStartEndDate.split("|").join(" - ")
                    : "Dates"
                }
                clearEvent={onDatesChange}
              >
                <DateRangeInput
                  value={filterStartEndDate}
                  buttonText={
                    filterStartEndDate
                      ? filterStartEndDate.split("|").join(" - ")
                      : "Select Dates"
                  }
                  closeEvent={onDatesChange}
                >
                  {({ closeHandler }) => (
                    <LinkedCalendar
                      {...DATE_PICKER_CONFIG}
                      onDatesChange={closeHandler}
                    />
                  )}
                </DateRangeInput>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Time"
                buttonText={
                  timeZoneFilter && TIME_ZONE[timeZoneFilter]
                    ? TIME_ZONE[timeZoneFilter].name
                    : "Timezone"
                }
                clearEvent={onFilterClearEvent("timeZoneFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={timeZoneFilter}
                    buttonText={
                      timeZoneFilter && TIME_ZONE[timeZoneFilter]
                        ? TIME_ZONE[timeZoneFilter].name
                        : "Select Timezone"
                    }
                    closeEvent={onFilterChange("timeZoneFilter")}
                  >
                    {({ closeHandler }) => (
                      <>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler(TIME_ZONE.EST.value)}
                        >
                          {TIME_ZONE.EST.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler(TIME_ZONE.CST.value)}
                        >
                          {TIME_ZONE.CST.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler(TIME_ZONE.MST.value)}
                        >
                          {TIME_ZONE.MST.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler(TIME_ZONE.PST.value)}
                        >
                          {TIME_ZONE.PST.name}
                        </li>
                        <li
                          className="dropdown-item"
                          onClick={closeHandler(TIME_ZONE.HST.value)}
                        >
                          {TIME_ZONE.HST.name}
                        </li>
                      </>
                    )}
                  </SmartDropDown>
                </div>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Instructor"
                buttonText={
                  instructorFilter ? instructorFilter.label : "Instructor"
                }
                clearEvent={onFilterClearEvent("instructorFilter")}
              >
                <SmartInput
                  containerclassName="smart-input-mobile"
                  placeholder="Search Instructor"
                  value={searchKey}
                  onSearchKeyChange={(value) => setSearchKey(value)}
                  dataList={instructorList}
                  closeHandler={onFilterChangeEvent("instructorFilter")}
                ></SmartInput>
              </MobileFilterModal>

              <div
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                id="course-button_mobile"
              >
                <a className="btn" href="#">
                  Meetup Type{" "}
                </a>
              </div>
              <div
                id="course-modal_mobile"
                data-course="null"
                data-course-initial="Meetup Type"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="course-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Meetup Type</h2>
                  <div className="dropdown">
                    <button
                      className="custom-dropdown"
                      type="button"
                      id="dropdownCourseButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select course
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownCourseButton"
                    >
                      <li className="dropdown-item">SKY Breath Meditation</li>
                      <li className="dropdown-item">Silent Retreat</li>
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
                className="btn_outline_box full-btn mt-3"
                id="date-button_mobile"
              >
                <a className="btn" href="#">
                  Dates{" "}
                </a>
              </div>
              <div
                id="date-modal_mobile"
                data-date="null"
                data-date-initial="Dates"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="date-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Dates</h2>
                  <div className="datepicker-block">
                    <input
                      className="custom-input"
                      type="text"
                      id="datepicker-input"
                    />
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
                id="time-button_mobile"
              >
                <a className="btn" href="#">
                  Time{" "}
                </a>
              </div>
              <div
                id="time-modal_mobile"
                data-time="null"
                data-time-initial="Time"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div id="time-close_mobile" className="mobile-modal--close">
                    <img src="./img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Time</h2>
                  <h2>Time range</h2>
                  <div className="checkbox-list">
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="morning"
                      />
                      <label htmlFor="morning"></label>
                      <p className="checkbox-text">Morning</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="afternoon"
                      />
                      <label htmlFor="afternoon"></label>
                      <p className="checkbox-text">Afternoon</p>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="evening"
                      />
                      <label htmlFor="evening"></label>
                      <p className="checkbox-text">Evening</p>
                    </div>
                  </div>

                  <h2>Time zone</h2>
                  <div className="dropdown">
                    <button
                      className="custom-dropdown"
                      type="button"
                      id="dropdownTimeButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Select time zone
                    </button>
                    <ul
                      className="dropdown-menu"
                      aria-labelledby="dropdownTimeButton"
                    >
                      <li className="dropdown-item">Eastern</li>
                      <li className="dropdown-item">Central</li>
                      <li className="dropdown-item">Pacific</li>
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
                className="btn_outline_box btn-modal_dropdown full-btn mt-3"
                id="location-button_mobile"
                data-swicth-active="false"
              >
                <a className="btn" href="#">
                  Location
                </a>
              </div>
              <div
                id="location-modal_mobile"
                data-location="null"
                data-location-initial="Location"
                className="mobile-modal"
              >
                <div className="mobile-modal--header">
                  <div
                    id="location-close_mobile"
                    className="mobile-modal--close"
                  >
                    <img src="/img/ic-close.svg" alt="close" />
                  </div>
                  <h2 className="mobile-modal--title">Location</h2>
                  <div
                    className="smart-input-mobile"
                    id="location-mobile-input"
                  >
                    <input
                      placeholder="Search location"
                      type="text"
                      name="location"
                      className="custom-input"
                    />
                    <div className="smart-input--list">
                      <p className="smart-input--list-item">Los Altos</p>
                      <p className="smart-input--list-item">Los Angeles</p>
                      <p className="smart-input--list-item">Los Gatos</p>
                      <p className="smart-input--list-item">Los Mochis</p>
                      <p className="smart-input--list-item">Los Banos</p>
                    </div>
                  </div>
                </div>
                <div className="mobile-modal--body">
                  <div className="row m-0 align-items-center justify-content-between">
                    <div className="clear">Clear</div>
                    <div
                      id="location-search"
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
        <div className="container upcoming_course">
          <div className="row">
            <div className="col-12">
              <p className="title mb-1 mt-lg-5 mt-3">
                Upcoming {activeFilterType} courses
              </p>
            </div>
          </div>
          <div className="row mb-4">
            {isSuccess &&
              data.pages.map((page) => (
                <React.Fragment key={seed(page)}>
                  {page.data.map((workshop) => (
                    <WorkshopTile
                      key={workshop.sfid}
                      data={workshop}
                      authenticated={authenticated}
                    />
                  ))}
                </React.Fragment>
              ))}
          </div>
          <div className="row">
            <div className="pt-3 col-12 text-center">
              <div ref={loadMoreRef}>
                {isFetchingNextPage && <InfiniteScrollLoader />}
              </div>
            </div>
          </div>
        </div>
      </section>
      {activeFilterType === COURSE_MODES.ONLINE &&
        isSuccess &&
        data.pages[0].totalCount === 0 &&
        !isFetchingNextPage && (
          <section className="about">
            <div className="container happines_box">
              <div className="row">
                <div className="col-lg-8 col-md-10 col-12 m-auto text-center">
                  <h1 className="happines_title">
                    Sorry, no courses match your chosen filters.
                  </h1>
                  <p className="happines_subtitle">
                    Please broaden your options and try again.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      {activeFilterType === COURSE_MODES.IN_PERSON &&
        isSuccess &&
        data.pages[0].totalCount === 0 &&
        !isFetchingNextPage && (
          <section className="about">
            <div className="container happines_box">
              <div className="row">
                <div className="col-lg-8 col-md-10 col-12 m-auto text-center">
                  <h1 className="happines_title">
                    Currently there are no {activeFilterType} courses available.
                  </h1>
                  <p className="happines_subtitle">
                    Please check out our{" "}
                    <a
                      href="#"
                      className="link v2"
                      onClick={toggleActiveFilter(COURSE_MODES.ONLINE)}
                    >
                      online offerings
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
    </main>
  );
};

// Workshop.requiresAuth = true;
// Workshop.redirectUnauthenticated = "/login";

export default MeditationFind;
