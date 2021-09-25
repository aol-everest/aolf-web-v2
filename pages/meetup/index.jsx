import React, { useState, useEffect } from "react";
import { useInfiniteQuery, useQuery } from "react-query";
import { api } from "@utils";
import { NextSeo } from "next-seo";
import { useIntersectionObserver } from "@hooks";
import { useUIDSeed } from "react-uid";
import { MeetupTile } from "@components/meetup/meetupTile";
import { LinkedCalendar } from "@components/dateRangePicker";
import { MeetupType } from "@components/meetup/meetupType";
import { MeetupEnroll } from "@components/meetup/meetupEnroll";
import { AddressSearch } from "@components";
import { InfiniteScrollLoader } from "@components/loader";
import { useGeolocation } from "@hooks";
import "bootstrap-daterangepicker/daterangepicker.css";
import { withSSRContext } from "aws-amplify";
import { useRouter } from "next/router";
import {
  Popup,
  SmartInput,
  MobileFilterModal,
  SmartDropDown,
  DateRangeInput,
} from "@components";
import { useQueryString } from "@hooks";
import { TIME_ZONE, COURSE_MODES, ALERT_TYPES, MODAL_TYPES } from "@constants";
import { useGlobalAlertContext, useGlobalModalContext } from "@contexts";
import Style from "./Meetup.module.scss";

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
    meetupType,
    startEndDate,
    timeZone,
    instructor,
    timesOfDay,
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
    if (meetupType) {
      param = {
        ...param,
        filter: meetupType,
      };
    }
    if (timeZone && TIME_ZONE[timeZone]) {
      param = {
        ...param,
        timeZone: TIME_ZONE[timeZone].value,
      };
    }
    if (timesOfDay) {
      param = {
        ...param,
        timesOfDay: timesOfDay,
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
      path: "meetups",
      token,
      param,
    });

    const allMeetupMaster = await api.get({
      path: "getAllMeetupMaster",
      token,
    });

    props = {
      ...props,
      meetups: {
        pages: [{ data: res }],
        pageParams: [null],
      },
      allMeetupMaster,
    };
  } catch (err) {
    props = {
      ...props,
      meetups: {
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

const RetreatPrerequisiteWarning = ({ meetup }) => {
  return (
    <>
      <p class="course-join-card__text">
        Our records indicate that you have not yet taken the prerequisite for
        the {meetup.meetupTitle}, which is{" "}
        <strong>SKY Breath Meditation</strong>.
      </p>
      <p class="course-join-card__text">
        If our records are not accurate, please contact customer service at{" "}
        <a href="tel:8442735500">(844) 273-5500</a> or email us at{" "}
        <a href="mailto:app.support@us.artofliving.org">
          app.support@us.artofliving.org
        </a>
        . We will be happy to help you so you can sign up for the{" "}
        {meetup.meetupTitle}.
      </p>
    </>
  );
};

const Meetup = ({ meetups, allMeetupMaster, authenticated, query, token }) => {
  const seed = useUIDSeed();
  const router = useRouter();
  const { showModal } = useGlobalModalContext();
  const { showAlert, hideAlert } = useGlobalAlertContext();
  const { latitude, longitude, error: geoLocationError } = useGeolocation();

  const [activeFilterType, setActiveFilterType] = useQueryString("mode", {
    defaultValue: COURSE_MODES.ONLINE,
  });
  const [locationFilter, setLocationFilter] = useQueryString("location", {
    parse: JSON.parse,
  });
  const [meetupTypeFilter, setMeetupTypeFilter] = useQueryString("meetupType");
  const [filterStartEndDate, setFilterStartEndDate] =
    useQueryString("startEndDate");
  const [timeZoneFilter, setTimeZoneFilter] = useQueryString("timeZone");
  const [timesOfDayFilter, setTimesOfDayFilter] = useQueryString("timesOfDay");
  const [instructorFilter, setInstructorFilter] = useQueryString("instructor", {
    parse: JSON.parse,
  });

  const [showTimeZoneDropdown, setShowTimeZoneDropdown] = useState(false);

  const [searchKey, setSearchKey] = useState("");

  const meetupMasters = allMeetupMaster.reduce((acc, meetup) => {
    return { ...acc, [meetup.id]: meetup };
  }, {});

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

  const showTimeZoneDropdownAction = () => {
    setShowTimeZoneDropdown((showTimeZoneDropdown) => !showTimeZoneDropdown);
  };

  const onFilterChange = (field) => (value) => {
    switch (field) {
      case "meetupTypeFilter":
        setMeetupTypeFilter(value);
        break;
      case "locationFilter":
        if (value) {
          setLocationFilter(JSON.stringify(value));
        } else {
          setLocationFilter(null);
        }
        break;
      case "timesOfDayFilter":
        setTimesOfDayFilter(value);
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
      case "meetupTypeFilter":
        setMeetupTypeFilter(value);
        break;
      case "locationFilter":
        if (value) {
          setLocationFilter(JSON.stringify(value));
        } else {
          setLocationFilter(null);
        }
        break;
      case "timesOfDayFilter":
        setTimesOfDayFilter(value);
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
      case "meetupTypeFilter":
        setMeetupTypeFilter(null);
        break;
      case "locationFilter":
        setLocationFilter(null);
        break;
      case "timesOfDayFilter":
        setTimesOfDayFilter(null);
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

  const closeRetreatPrerequisiteWarning = (e) => {
    if (e) e.preventDefault();
    hideAlert();
    router.push({
      pathname: "/workshop",
      query: {
        courseType: "SKY_BREATH_MEDITATION",
      },
    });
  };

  const checkoutMeetup = async () => {};

  const openEnrollPage = (selectedMeetup) => async (e) => {
    if (e) e.preventDefault();
    if (!authenticated) {
      showModal(MODAL_TYPES.LOGIN_MODAL);
    } else {
      if (!selectedMeetup.isMandatoryWorkshopAttended) {
        showAlert(ALERT_TYPES.CUSTOM_ALERT, {
          className: "retreat-prerequisite-big meditation-digital-membership",
          title: "Retreat Prerequisite",
          footer: () => {
            return (
              <button
                className="btn-secondary v2"
                onClick={closeRetreatPrerequisiteWarning}
              >
                Discover SKY Breath Meditation
              </button>
            );
          },
          children: <RetreatPrerequisiteWarning meetup={selectedMeetup} />,
        });
        return;
      }

      try {
        const { data } = await api.get({
          path: "meetupDetail",
          param: {
            id: selectedMeetup.sfid,
          },
          token,
        });
        const currentMeetup = { ...selectedMeetup, ...data };
        showModal(MODAL_TYPES.EMPTY_MODAL, {
          children: (handleModalToggle) => {
            return (
              <MeetupEnroll
                selectedMeetup={currentMeetup}
                checkoutMeetup={checkoutMeetup}
                closeDetailAction={handleModalToggle}
              />
            );
          },
        });
      } catch (error) {
        showAlert(ALERT_TYPES.ERROR_ALERT, {
          children: error.message,
        });
      }
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
      "meetups",
      {
        meetupTypeFilter,
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
      if (meetupTypeFilter) {
        param = {
          ...param,
          filter: meetupTypeFilter,
        };
      }
      if (timeZoneFilter && TIME_ZONE[timeZoneFilter]) {
        param = {
          ...param,
          timeZone: TIME_ZONE[timeZoneFilter].value,
        };
      }
      if (timesOfDayFilter) {
        param = {
          ...param,
          timesOfDay: timesOfDayFilter,
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
        path: "meetups",
        param,
        token,
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
    { initialData: meetups },
  );

  const loadMoreRef = React.useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  return (
    <main className="meetsup-filter">
      <NextSeo title="Meetups" />
      <section className="courses">
        <div className="container search_course_form d-lg-block d-none mb-2">
          <div className="row">
            <div className="col">
              <p className="title mb-3">Find a meetup </p>
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
                <Popup
                  tabIndex="2"
                  value={meetupTypeFilter}
                  buttonText={
                    meetupTypeFilter
                      ? meetupMasters[meetupTypeFilter].name
                      : "Meetup Type"
                  }
                  closeEvent={onFilterChange("meetupTypeFilter")}
                >
                  {({ closeHandler }) => (
                    <MeetupType
                      closeHandler={closeHandler}
                      meetupMasters={allMeetupMaster}
                    />
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
                  showId
                  value={timeZoneFilter || timesOfDayFilter}
                  buttonText={`${
                    TIME_ZONE[timeZoneFilter]
                      ? TIME_ZONE[timeZoneFilter].name + ", "
                      : ""
                  }
                        ${timesOfDayFilter ? timesOfDayFilter : ""}${
                    timeZoneFilter || timesOfDayFilter ? "" : "Time"
                  }`}
                  closeEvent={onFilterChange("timeZoneFilter")}
                >
                  {({ closeHandler }) => (
                    <>
                      <h2>Time range</h2>
                      <div className="checkbox-list">
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === "Morning"
                                : false
                            }
                            name="morning"
                            id="morning"
                            onClick={() =>
                              onFilterChange("timesOfDayFilter")("Morning")
                            }
                          />
                          <label className="checkbox-text" for="morning">
                            Morning
                          </label>
                        </div>
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            name="afternoon"
                            id="afternoon"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === "Afternoon"
                                : false
                            }
                            onClick={() =>
                              onFilterChange("timesOfDayFilter")("Afternoon")
                            }
                          />
                          <label className="checkbox-text" for="afternoon">
                            Afternoon
                          </label>
                        </div>
                        <div className="checkbox-wrapper">
                          <input
                            className="custom-checkbox"
                            type="checkbox"
                            name="evening"
                            id="evening"
                            checked={
                              timesOfDayFilter
                                ? timesOfDayFilter === "Evening"
                                : false
                            }
                            onClick={() =>
                              onFilterChange("timesOfDayFilter")("Evening")
                            }
                          />
                          <label className="checkbox-text" for="evening">
                            Evening
                          </label>
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
                          onClick={showTimeZoneDropdownAction}
                        >
                          {TIME_ZONE[timeZoneFilter]
                            ? TIME_ZONE[timeZoneFilter].name
                            : "Select time zone"}
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownTimeButton"
                          style={
                            showTimeZoneDropdown ? { display: "block" } : {}
                          }
                        >
                          <li
                            className="dropdown-item text-left"
                            onClick={closeHandler(TIME_ZONE.EST.value)}
                          >
                            {TIME_ZONE.EST.name}
                          </li>
                          <li
                            className="dropdown-item text-left"
                            onClick={closeHandler(TIME_ZONE.CST.value)}
                          >
                            {TIME_ZONE.CST.name}
                          </li>
                          <li
                            className="dropdown-item text-left"
                            onClick={closeHandler(TIME_ZONE.MST.value)}
                          >
                            {TIME_ZONE.MST.value}
                          </li>
                          <li
                            className="dropdown-item text-left"
                            onClick={closeHandler(TIME_ZONE.PST.value)}
                          >
                            {TIME_ZONE.PST.value}
                          </li>
                          <li
                            className="dropdown-item text-left"
                            onClick={closeHandler(TIME_ZONE.HST.value)}
                          >
                            {TIME_ZONE.HST.value}
                          </li>
                        </ul>
                      </div>
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
              <p className="title mb-0">Find a meetup</p>
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
                modalTitle="Location"
                buttonText={
                  locationFilter ? `${locationFilter.loactionName}` : "Location"
                }
                clearEvent={onFilterClearEvent("locationFilter")}
              >
                <div className="dropdown">
                  <AddressSearch
                    filter={onFilterChange("locationFilter")}
                    placeholder="Search for Location"
                  />
                </div>
              </MobileFilterModal>

              <MobileFilterModal
                modalTitle="Course Type"
                buttonText={
                  meetupTypeFilter
                    ? meetupMasters[meetupTypeFilter].name
                    : "Course Type"
                }
                clearEvent={onFilterClearEvent("meetupTypeFilter")}
              >
                <div className="dropdown">
                  <SmartDropDown
                    value={meetupTypeFilter}
                    buttonText={
                      meetupTypeFilter ? meetupTypeFilter : "Select Course"
                    }
                    closeEvent={onFilterChange("meetupTypeFilter")}
                  >
                    {({ closeHandler }) => (
                      <MeetupType
                        closeHandler={closeHandler}
                        meetupMasters={allMeetupMaster}
                        applyClassName="dropdown-item"
                      />
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
                  <h2>Time range</h2>
                  <div className="checkbox-list">
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="morning"
                        id="morning"
                        checked={
                          timesOfDayFilter
                            ? timesOfDayFilter === "Morning"
                            : false
                        }
                        onClick={onFilterChangeEvent("timesOfDayFilter")(
                          "Morning",
                        )}
                      />
                      <label className="checkbox-text" for="morning">
                        Morning
                      </label>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="afternoon"
                        id="afternoon"
                        checked={
                          timesOfDayFilter
                            ? timesOfDayFilter === "Afternoon"
                            : false
                        }
                        onClick={onFilterChangeEvent("timesOfDayFilter")(
                          "Afternoon",
                        )}
                      />
                      <label className="checkbox-text" for="afternoon">
                        Afternoon
                      </label>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        className="custom-checkbox"
                        type="checkbox"
                        name="evening"
                        id="evening"
                        checked={
                          timesOfDayFilter
                            ? timesOfDayFilter === "Evening"
                            : false
                        }
                        onClick={onFilterChangeEvent("timesOfDayFilter")(
                          "Evening",
                        )}
                      />
                      <label className="checkbox-text" for="evening">
                        Evening
                      </label>
                    </div>
                  </div>
                  <h2>Time zone</h2>
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
                Upcoming {activeFilterType} meetups
              </p>
            </div>
          </div>
          <div className="row mb-4">
            {isSuccess &&
              data.pages.map((page) => (
                <React.Fragment key={seed(page)}>
                  {page.data.map((meetup) => (
                    <MeetupTile
                      key={meetup.sfid}
                      data={meetup}
                      openEnrollAction={openEnrollPage(meetup)}
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

export default Meetup;
