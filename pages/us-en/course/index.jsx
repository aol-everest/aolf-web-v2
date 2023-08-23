import {
  DateRangeInput,
  MobileFilterModal,
  Popup,
  SmartDropDown,
  SmartInput,
} from "@components";
import { COURSE_MODES, COURSE_TYPES, TIME_ZONE } from "@constants";
import { useAuth } from "@contexts";
import { useIntersectionObserver, useQueryString } from "@hooks";
import { orgConfig } from "@org";
import { api, stringToBoolean } from "@utils";
import classNames from "classnames";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useInfiniteQuery, useQuery } from "react-query";
import { useUIDSeed } from "react-uid";
import { useAnalytics } from "use-analytics";

import "bootstrap-daterangepicker/daterangepicker.css";
import Style from "./Course.module.scss";

const WorkshopTile = dynamic(() =>
  import("@components/course/workshopTile").then((mod) => mod.WorkshopTile),
);
const LinkedCalendar = dynamic(() =>
  import("@components/dateRangePicker").then((mod) => mod.LinkedCalendar),
);
const AddressSearch = dynamic(() =>
  import("@components").then((mod) => mod.AddressSearch),
);

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

/* export const getServerSideProps = async (context) => {
  const { req } = context;
  let props = {};
  let token = "";
  try {
    const { Auth } = await withSSRContext({ req });
    const user = await Auth.currentAuthenticatedUser();
    const currentSession = await Auth.currentSession();
    token = currentSession.idToken.jwtToken;
    props = {
      authenticated: true,
      username: user.username,
      token,
    };
  } catch (err) {
    console.log(err);
    props = {
      authenticated: false,
    };
  }
  // const {
  //   page = 1,
  //   mode = COURSE_MODES.ONLINE,
  //   location,
  //   courseType,
  //   startEndDate,
  //   timeZone,
  //   instructor,
  // } = context.query;
  // Fetch data from external API
  // try {
  //   let param = {
  //     page,
  //     size: 8,
  //   };

  //   if (mode) {
  //     param = {
  //       ...param,
  //       mode,
  //     };
  //   }
  //   if (courseType && COURSE_TYPES[courseType]) {
  //     param = {
  //       ...param,
  //       ctype: COURSE_TYPES[courseType].value,
  //     };
  //   }
  //   if (timeZone && TIME_ZONE[timeZone]) {
  //     param = {
  //       ...param,
  //       timeZone: TIME_ZONE[timeZone].value,
  //     };
  //   }
  //   if (instructor && instructor.value) {
  //     param = {
  //       ...param,
  //       teacherId: instructor.value,
  //     };
  //   }
  //   if (startEndDate) {
  //     const [startDate, endDate] = startEndDate.split("|");
  //     param = {
  //       ...param,
  //       sdate: startDate,
  //       edate: endDate,
  //     };
  //   }

  //   const res = await api.get({
  //     path: "workshops",
  //     token,
  //     param,
  //   });
  //   props = {
  //     ...props,
  //     workshops: {
  //       pages: [{ data: res }],
  //       pageParams: [null],
  //     },
  //   };
  // } catch (err) {
  //   props = {
  //     ...props,
  //     workshops: {
  //       error: { message: err.message },
  //     },
  //   };
  // }
  // Pass data to the page via props
  return { props };
}; */

async function queryInstructor({ queryKey: [_, term] }) {
  const response = await api.get({
    path: "cf/teachers",
    param: {
      query: term,
    },
  });
  return response;
}

const Course = () => {
  const seed = useUIDSeed();
  const { authenticated } = useAuth();
  const [activeFilterType, setActiveFilterType] = useQueryString("mode", {
    defaultValue: "ONLINE",
  });
  const [onlyWeekend, setOnlyWeekend] = useQueryString("onlyWeekend", {
    defaultValue: false,
  });
  const [otherCType] = useQueryString("other-ctype", {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [institutionalCourses] = useQueryString("ic-type", {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [privateEvent] = useQueryString("private-event", {
    defaultValue: false,
    parse: stringToBoolean,
  });
  const [locationFilter, setLocationFilter] = useQueryString("location", {
    parse: JSON.parse,
  });
  const [courseTypeFilter, setCourseTypeFilter] = useQueryString("courseType");
  const [ctypesFilter, setCtypesFilter] = useQueryString("ctypes");
  const [filterStartEndDate, setFilterStartEndDate] =
    useQueryString("startEndDate");
  const [timeZoneFilter, setTimeZoneFilter] = useQueryString("timeZone");
  const [instructorFilter, setInstructorFilter] = useQueryString("instructor", {
    parse: JSON.parse,
  });

  const [searchKey, setSearchKey] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleFilter = (e) => {
    if (e) e.preventDefault();
    setShowFilterModal((showFilterModal) => !showFilterModal);
  };

  const toggleActiveFilter = (newType) => (e) => {
    if (e) e.preventDefault();
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
        setCtypesFilter(null);
        setCourseTypeFilter(value);
        break;
      case "activeFilterType":
        setActiveFilterType(value);
        break;
      case "onlyWeekend":
        setOnlyWeekend(value);
        break;
      case "locationFilter":
        if (value) {
          setLocationFilter(JSON.stringify(value));
        } else {
          setLocationFilter(null);
        }
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
    if (e) e.preventDefault();
    switch (field) {
      case "courseTypeFilter":
        setCtypesFilter(null);
        setCourseTypeFilter(value);
        break;
      case "activeFilterType":
        setActiveFilterType(value);
        break;
      case "onlyWeekend":
        setOnlyWeekend(value);
        break;
      case "locationFilter":
        if (value) {
          setLocationFilter(JSON.stringify(value));
        } else {
          setLocationFilter(null);
        }
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

  const onFilterClearEvent = (field) => async (e) => {
    if (e) e.preventDefault();
    switch (field) {
      case "courseTypeFilter":
        setCourseTypeFilter(null);
        break;
      case "activeFilterType":
        setActiveFilterType(null);
        break;
      case "onlyWeekend":
        setOnlyWeekend(null);
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

  const { isSuccess, data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      [
        "workshops",
        {
          privateEvent,
          otherCType,
          locationFilter,
          ctypesFilter,
          courseTypeFilter,
          filterStartEndDate,
          timeZoneFilter,
          instructorFilter,
          activeFilterType,
          onlyWeekend,
        },
      ],
      async ({ pageParam = 1 }) => {
        let param = {
          page: pageParam,
          size: 12,
          timingsRequired: true,
        };

        if (activeFilterType && COURSE_MODES[activeFilterType]) {
          param = {
            ...param,
            mode: COURSE_MODES[activeFilterType].value,
          };
        }
        if (institutionalCourses) {
          param = {
            ...param,
            ctype: COURSE_TYPES.INSTITUTIONAL_COURSE.value,
          };
        } else if (ctypesFilter) {
          param = {
            ...param,
            ctype: ctypesFilter,
          };
        } else if (courseTypeFilter && COURSE_TYPES[courseTypeFilter]) {
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
            edate: endDate,
          };
        }
        if (locationFilter) {
          const { lat, lng } = locationFilter;
          param = {
            ...param,
            lat,
            lng,
          };
        }
        if (otherCType) {
          param = {
            ...param,
            other: 1,
          };
        }
        if (privateEvent) {
          param = {
            ...param,
            isPrivateEvent: 1,
          };
        }
        if (onlyWeekend) {
          param = {
            ...param,
            onlyWeekend: onlyWeekend,
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
      // { initialData: workshops },
    );

  const loadMoreRef = React.useRef();
  const { track } = useAnalytics();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  useEffect(() => {
    track("Product List Viewed", {
      category: "Course",
    });
  }, []);

  let filterCount = 0;
  if (locationFilter) {
    filterCount++;
  }
  if (courseTypeFilter) {
    filterCount++;
  }
  if (filterStartEndDate) {
    filterCount++;
  }
  if (timeZoneFilter) {
    filterCount++;
  }
  if (instructorFilter) {
    filterCount++;
  }

  return (
    <main className="course-filter">
      <NextSeo title="Workshops" />
      <section className="courses">
        {orgConfig.name !== "HB" && (
          <>
            <div className="container search_course_form d-lg-block d-none mb-2">
              <div className="row">
                <div className="col">
                  <p className="title mb-3">Find a course </p>
                </div>
              </div>
              <div className="row">
                <div
                  id="courses-filters"
                  className="search-form col-12 d-flex align-items-center"
                >
                  <Popup
                    tabIndex="1"
                    value={COURSE_MODES[activeFilterType] && activeFilterType}
                    buttonText={
                      activeFilterType && COURSE_MODES[activeFilterType]
                        ? COURSE_MODES[activeFilterType].name
                        : "Course Format"
                    }
                    closeEvent={onFilterChange("activeFilterType")}
                  >
                    {({ closeHandler }) => (
                      <>
                        {orgConfig.courseModes.map((courseMode, index) => {
                          return (
                            <li
                              key={index}
                              className="courses-filter__list-item"
                              onClick={closeHandler(courseMode)}
                            >
                              {COURSE_MODES[courseMode].name}
                            </li>
                          );
                        })}
                      </>
                    )}
                  </Popup>

                  {activeFilterType === "IN_PERSON" && (
                    <Popup
                      tabIndex="2"
                      value={locationFilter}
                      buttonText={
                        locationFilter
                          ? `${locationFilter.loactionName}`
                          : "Location"
                      }
                      closeEvent={onFilterChange("locationFilter")}
                    >
                      {({ closeHandler }) => (
                        <AddressSearch
                          closeHandler={closeHandler}
                          placeholder="Search for Location"
                        />
                      )}
                    </Popup>
                  )}

                  <Popup
                    tabIndex="3"
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
                        {otherCType && (
                          <>
                            {orgConfig.otherCourseTypes.map(
                              (courseType, index) => {
                                return (
                                  <li
                                    className="courses-filter__list-item"
                                    key={index}
                                    onClick={closeHandler(courseType)}
                                  >
                                    {COURSE_TYPES[courseType].name}
                                  </li>
                                );
                              },
                            )}
                          </>
                        )}
                        {!otherCType && (
                          <>
                            {orgConfig.courseTypes.map((courseType, index) => {
                              return (
                                <li
                                  className="courses-filter__list-item"
                                  key={index}
                                  onClick={closeHandler(courseType)}
                                >
                                  {COURSE_TYPES[courseType].name}
                                </li>
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  </Popup>
                  <Popup
                    containerClassName={Style.daterangepickerPopup}
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
                    tabIndex="2"
                    value={onlyWeekend}
                    buttonText="Weekend courses"
                    closeEvent={onFilterChange("onlyWeekend")}
                    showList={false}
                  ></Popup>

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
                        <li
                          className="courses-filter__list-item"
                          onClick={closeHandler(TIME_ZONE.EST.value)}
                        >
                          {TIME_ZONE.EST.name}
                        </li>
                        <li
                          className="courses-filter__list-item"
                          onClick={closeHandler(TIME_ZONE.CST.value)}
                        >
                          {TIME_ZONE.CST.name}
                        </li>
                        <li
                          className="courses-filter__list-item"
                          onClick={closeHandler(TIME_ZONE.MST.value)}
                        >
                          {TIME_ZONE.MST.name}
                        </li>
                        <li
                          className="courses-filter__list-item"
                          onClick={closeHandler(TIME_ZONE.PST.value)}
                        >
                          {TIME_ZONE.PST.name}
                        </li>
                        <li
                          className="courses-filter__list-item"
                          onClick={closeHandler(TIME_ZONE.HST.value)}
                        >
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
            <div className="search_course_form_mobile d-lg-none d-block">
              <div className="container">
                <div className="row m-0 justify-content-between align-items-center">
                  <p className="title mb-0">Find a course</p>
                  <div className="filter">
                    <div
                      className="filter--button d-flex"
                      onClick={toggleFilter}
                    >
                      <img src="/img/ic-filter.svg" alt="filter" />
                      Filter
                      <span
                        id="filter-count"
                        className={classNames({
                          "filter-count--show": filterCount > 0,
                        })}
                      >
                        {filterCount}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={classNames("filter--box", {
                    "d-none": !showFilterModal,
                  })}
                >
                  {/* <div
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
                  onClick={toggleActiveFilter("IN_PERSON")}
                >
                  In Person
                </a>
              </div> */}

                  <MobileFilterModal
                    modalTitle="Course Type"
                    buttonText={
                      activeFilterType && COURSE_MODES[activeFilterType]
                        ? COURSE_MODES[activeFilterType].name
                        : "Course Format"
                    }
                    clearEvent={onFilterClearEvent("activeFilterType")}
                  >
                    <div className="dropdown">
                      <SmartDropDown
                        value={activeFilterType}
                        buttonText={
                          activeFilterType && COURSE_MODES[activeFilterType]
                            ? COURSE_MODES[activeFilterType].name
                            : "Select Course Format"
                        }
                        closeEvent={onFilterChange("activeFilterType")}
                      >
                        {({ closeHandler }) => (
                          <>
                            {orgConfig.courseModes.map((courseMode, index) => {
                              return (
                                <li
                                  key={index}
                                  className="dropdown-item"
                                  onClick={closeHandler(courseMode)}
                                >
                                  {COURSE_MODES[courseMode].name}
                                </li>
                              );
                            })}
                          </>
                        )}
                      </SmartDropDown>
                    </div>
                  </MobileFilterModal>

                  {activeFilterType === "IN_PERSON" && (
                    <MobileFilterModal
                      modalTitle="Location"
                      buttonText={
                        locationFilter
                          ? `${locationFilter.loactionName}`
                          : "Location"
                      }
                      clearEvent={onFilterClearEvent("locationFilter")}
                    >
                      <AddressSearch
                        closeHandler={onFilterChange("locationFilter")}
                        placeholder="Search for Location"
                      />
                    </MobileFilterModal>
                  )}

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
                          courseTypeFilter && COURSE_TYPES[courseTypeFilter]
                            ? COURSE_TYPES[courseTypeFilter].name
                            : "Select Course"
                        }
                        closeEvent={onFilterChange("courseTypeFilter")}
                      >
                        {({ closeHandler }) => (
                          <>
                            {otherCType && (
                              <>
                                {orgConfig.otherCourseTypes.map(
                                  (courseType, index) => {
                                    return (
                                      <li
                                        key={index}
                                        className="dropdown-item"
                                        onClick={closeHandler(courseType)}
                                      >
                                        {COURSE_TYPES[courseType].name}
                                      </li>
                                    );
                                  },
                                )}
                              </>
                            )}
                            {!otherCType && (
                              <>
                                {orgConfig.courseTypes.map(
                                  (courseType, index) => {
                                    return (
                                      <li
                                        key={index}
                                        className="dropdown-item"
                                        onClick={closeHandler(courseType)}
                                      >
                                        {COURSE_TYPES[courseType].name}
                                      </li>
                                    );
                                  },
                                )}
                              </>
                            )}
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
                      containerClassName="smart-input-mobile"
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
          </>
        )}
        <div className="container upcoming_course">
          <div className="row">
            <div className="col-12">
              {!institutionalCourses && (
                <p className="title mb-1 mt-lg-5 mt-3">
                  {COURSE_MODES[activeFilterType]
                    ? `Upcoming ${COURSE_MODES[activeFilterType].name} courses`
                    : `Upcoming courses`}
                </p>
              )}
              {institutionalCourses && (
                <p className="title mb-1 mt-lg-5 mt-3">
                  Upcoming {COURSE_TYPES.INSTITUTIONAL_COURSE.name} courses
                </p>
              )}
            </div>
          </div>
          <div class="upcoming_list">
            {!isSuccess && (
              <>
                <div className="course-card">
                  <ContentLoader viewBox="0 0 80 120">
                    {/* Only SVG shapes */}
                    <rect x="0" y="0" rx="5" ry="5" width="80" height="110" />
                  </ContentLoader>
                </div>

                <div className="course-card">
                  <ContentLoader viewBox="0 0 80 120">
                    {/* Only SVG shapes */}
                    <rect x="0" y="0" rx="5" ry="5" width="80" height="110" />
                  </ContentLoader>
                </div>

                <div className="course-card">
                  <ContentLoader viewBox="0 0 80 120">
                    {/* Only SVG shapes */}
                    <rect x="0" y="0" rx="5" ry="5" width="80" height="110" />
                  </ContentLoader>
                </div>

                <div className="course-card">
                  <ContentLoader viewBox="0 0 80 120">
                    {/* Only SVG shapes */}
                    <rect x="0" y="0" rx="5" ry="5" width="80" height="110" />
                  </ContentLoader>
                </div>
              </>
            )}

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

            <div ref={loadMoreRef} className="col-12">
              {isFetchingNextPage && (
                <div className="row">
                  <div className="col-6 col-lg-3 col-md-4">
                    <div className="upcoming_course_card meetup_course_card">
                      <ContentLoader viewBox="0 0 80 120">
                        {/* Only SVG shapes */}
                        <rect
                          x="0"
                          y="0"
                          rx="5"
                          ry="5"
                          width="80"
                          height="110"
                        />
                      </ContentLoader>
                    </div>
                  </div>
                  <div className="col-6 col-lg-3 col-md-4">
                    <div className="upcoming_course_card meetup_course_card">
                      <ContentLoader viewBox="0 0 80 120">
                        {/* Only SVG shapes */}
                        <rect
                          x="0"
                          y="0"
                          rx="5"
                          ry="5"
                          width="80"
                          height="110"
                        />
                      </ContentLoader>
                    </div>
                  </div>
                  <div className="col-6 col-lg-3 col-md-4">
                    <div className="upcoming_course_card meetup_course_card">
                      <ContentLoader viewBox="0 0 80 120">
                        {/* Only SVG shapes */}
                        <rect
                          x="0"
                          y="0"
                          rx="5"
                          ry="5"
                          width="80"
                          height="110"
                        />
                      </ContentLoader>
                    </div>
                  </div>
                  <div className="col-6 col-lg-3 col-md-4">
                    <div className="upcoming_course_card meetup_course_card">
                      <ContentLoader viewBox="0 0 80 120">
                        {/* Only SVG shapes */}
                        <rect
                          x="0"
                          y="0"
                          rx="5"
                          ry="5"
                          width="80"
                          height="110"
                        />
                      </ContentLoader>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isSuccess && !hasNextPage && data.pages[0].data.length > 0 && (
            <div className="row">
              <div className="col-lg-8 col-md-10 col-12 m-auto text-center">
                <p className="happines_subtitle tw-p-6 tw-text-lg">
                  No more data available to read.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      {activeFilterType === "ONLINE" &&
        isSuccess &&
        data.pages[0].data.length === 0 &&
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
      {activeFilterType === "IN_PERSON" &&
        isSuccess &&
        data.pages[0].data.length === 0 &&
        !isFetchingNextPage && (
          <section className="about">
            <div className="container happines_box">
              <div className="row">
                <div className="col-lg-8 col-md-10 col-12 m-auto text-center">
                  <h1 className="happines_title">
                    Currently there are no {COURSE_MODES[activeFilterType].name}{" "}
                    courses available.
                  </h1>
                  <p className="happines_subtitle">
                    Please check out our{" "}
                    <a
                      href="#"
                      className="link v2"
                      onClick={toggleActiveFilter("ONLINE")}
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

// Course.requiresAuth = true;
// Course.redirectUnauthenticated = "/login";

export default Course;
