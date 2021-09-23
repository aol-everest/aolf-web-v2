import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { api } from "@utils";
import { NextSeo } from "next-seo";
import { useIntersectionObserver } from "@hooks";
import classNames from "classnames";
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
import Style from "./Workshop.module.scss";

const DATE_PICKER_CONFIG = {
  opens: "center",
  drops: "down",
  showDropdowns: false,
  showISOWeekNumbers: false,
  showWeekNumbers: false,
  locale: {
    cancelLabel: "Clear",
    daysOfWeek: ["S", "M", "T", "W", "T", "F", "S"],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  autoApply: true,
};

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
      path: "workshops",
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

const Workshop = ({ workshops, authenticated, query }) => {
  const seed = useUIDSeed();

  const [activeFilterType, setActiveFilterType] = useQueryString("mode", {
    defaultValue: COURSE_MODES.ONLINE,
  });
  const [locationFilter, setLocationFilter] = useQueryString("location");
  const [courseTypeFilter, setCourseTypeFilter] = useQueryString("courseType");
  const [filterStartEndDate, setFilterStartEndDate] =
    useQueryString("startEndDate");
  const [timeZoneFilter, setTimeZoneFilter] = useQueryString("timeZone");
  const [instructorFilter, setInstructorFilter] = useQueryString("instructor", {
    parse: JSON.parse,
  });

  const [searchKey, setSearchKey] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleFilter = () => {
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const toggleActiveFilter = (newType) => () => {
    setActiveFilterType(newType);
  };

  let instructorResult = useQuery(["instructor", searchKey], queryInstructor, {
    // only fetch search terms longer than 2 characters
    enabled: searchKey.length > 0,
    // refresh cache after 10 seconds (watch the network tab!)
    staleTime: 10 * 1000,
  });

  let instructorList = instructorResult?.data?.map(({ id, name }) => ({
    value: id,
    label: name,
  }));
  instructorList = (instructorList || []).slice(0, 5);

  const onFilterChange = (field) => async (value) => {
    switch (field) {
      case "courseTypeFilter":
        setCourseTypeFilter(value);
        break;
      case "locationFilter":
        setLocationFilter(JSON.stringify(value));
        break;
      case "timeZoneFilter":
        setTimeZoneFilter(value);
        break;
      case "instructorFilter":
        if (value) {
          setInstructorFilter(JSON.stringify(value));
        } else {
          setInstructorFilter(null);
        }
        break;
    }
  };

  const onFilterChangeEvent = (field) => (value) => async (e) => {
    switch (field) {
      case "courseTypeFilter":
        setCourseTypeFilter(value);
        break;
      case "locationFilter":
        setLocationFilter(JSON.stringify(value));
        break;
      case "timeZoneFilter":
        setTimeZoneFilter(value);
        break;
      case "instructorFilter":
        if (value) {
          setInstructorFilter(JSON.stringify(value));
        } else {
          setInstructorFilter(null);
        }
        break;
    }
  };

  const onFilterClearEvent = (field) => async () => {
    switch (field) {
      case "courseTypeFilter":
        setCourseTypeFilter(null);
        break;
      case "locationFilter":
        setLocationFilter(null);
        break;
      case "timeZoneFilter":
        setTimeZoneFilter(null);
        break;
      case "instructorFilter":
        setInstructorFilter(null);
        break;
    }
  };

  const onDatesChange = async (date) => {
    const { startDate, endDate } = date || {};
    setFilterStartEndDate(
      startDate
        ? startDate.format("YYYY-MM-DD") + "|" + endDate.format("YYYY-MM-DD")
        : null,
    );
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
      "workshops",
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

      if (activeFilterType) {
        param = {
          ...param,
          mode: activeFilterType,
        };
      }
      if (courseTypeFilter && COURSE_TYPES[courseTypeFilter]) {
        param = {
          ...param,
          ctype: COURSE_TYPES[courseTypeFilter].value,
        };
      }
      if (timeZoneFilter && TIME_ZONE[timeZoneFilter]) {
        param = {
          ...param,
          timeZone: TIME_ZONE[timeZoneFilter].value,
        };
      }
      if (instructorFilter && instructorFilter.value) {
        param = {
          ...param,
          teacherId: instructorFilter.value,
        };
      }
      if (filterStartEndDate) {
        const [startDate, endDate] = filterStartEndDate.split("|");
        param = {
          ...param,
          sdate: startDate,
          eDate: endDate,
        };
      }

      const res = await api.get({
        path: "workshops",
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
    { initialData: workshops },
  );

  const loadMoreRef = React.useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  return (
    <main className="meetsup-filter">
      <NextSeo title="Workshops" />
      <section className="courses">
        <div className="container search_course_form d-lg-block d-none mb-2">
          <div className="row">
            <div className="col">
              <p className="title mb-3">Find a course </p>
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
                {false && activeFilterType === COURSE_MODES.IN_PERSON && (
                  <Popup
                    tabIndex="1"
                    value={locationFilter}
                    buttonText={locationFilter ? locationFilter : "Location"}
                    closeEvent={onFilterChange("locationFilter")}
                  >
                    {({ closeHandler }) => (
                      <SmartInput
                        closeHandler={closeHandler}
                        inputclassName="location-input"
                      ></SmartInput>
                    )}
                  </Popup>
                )}

                <Popup
                  tabIndex="2"
                  value={courseTypeFilter}
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
                  containerclassName={Style.daterangepickerPopup}
                  tabIndex="3"
                  value={filterStartEndDate}
                  buttonText={
                    filterStartEndDate
                      ? filterStartEndDate.split("|").join(" - ")
                      : "Dates"
                  }
                  closeEvent={onDatesChange}
                >
                  {({ closeHandler }) => (
                    <LinkedCalendar
                      {...DATE_PICKER_CONFIG}
                      noFooter
                      noInfo
                      noCancel
                      onDatesChange={closeHandler}
                      className={Style.daterangepicker}
                    />
                  )}
                </Popup>
                <Popup
                  tabIndex="4"
                  value={timeZoneFilter}
                  buttonText={
                    timeZoneFilter && TIME_ZONE[timeZoneFilter]
                      ? TIME_ZONE[timeZoneFilter].name
                      : "Time Zone"
                  }
                  closeEvent={onFilterChange("timeZoneFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      <li onClick={closeHandler(TIME_ZONE.EST.value)}>
                        {TIME_ZONE.EST.name}
                      </li>
                      <li onClick={closeHandler(TIME_ZONE.CST.value)}>
                        {TIME_ZONE.CST.name}
                      </li>
                      <li onClick={closeHandler(TIME_ZONE.MST.value)}>
                        {TIME_ZONE.MST.name}
                      </li>
                      <li onClick={closeHandler(TIME_ZONE.PST.value)}>
                        {TIME_ZONE.PST.name}
                      </li>
                      <li onClick={closeHandler(TIME_ZONE.HST.value)}>
                        {TIME_ZONE.HST.name}
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
              <p className="title mb-0">Find a course</p>
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

export default Workshop;
