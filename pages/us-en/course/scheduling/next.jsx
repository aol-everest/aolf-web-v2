import React, { useEffect, useRef } from "react";
import { COURSE_MODES, COURSE_TYPES } from "@constants";
import { useQueryString } from "@hooks";
import { pushRouteWithUTMQuery } from "@service";
import { api, tConvert, findCourseTypeByKey } from "@utils";
import dayjs from "dayjs";
import { sortBy, values } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useState } from "react";
import Flatpickr from "react-flatpickr";
import Select2 from "react-select2-wrapper";
import { useQuery } from "react-query";
import { StripeExpressCheckoutElement } from "@components/checkout/StripeExpressCheckoutElement";
import "flatpickr/dist/flatpickr.min.css";
import { ScheduleLocationFilter } from "@components/scheduleLocationFilter/ScheduleLocationFilter";
import { useEffectOnce } from "react-use";
import { useAnalytics } from "use-analytics";
import classNames from "classnames";
import Modal from "react-bootstrap/Modal";

var advancedFormat = require("dayjs/plugin/advancedFormat");
dayjs.extend(advancedFormat);

const COURSE_MODES_BOTH = "both";

const TIMEZONES = [
  {
    timezone: "US/Eastern",
    text: "Eastern Time - US & Canada",
    id: "EST",
  },
  {
    timezone: "US/Central",
    text: "Central Time - US & Canada",
    id: "CST",
  },
  {
    timezone: "US/Mountain",
    text: "Mountain Time - US & Canada",
    id: "MST",
  },
  {
    timezone: "America/Los_Angeles",
    text: "Pacific Time - US & Canada",
    id: "PST",
  },
];

const MILES = [
  {
    text: "25 miles (40km)",
    id: "25",
  },
  {
    text: "35 miles (50km)",
    id: "35",
  },
  {
    text: "45 miles (60km)",
    id: "45",
  },
  {
    text: "55 miles (70km)",
    id: "55",
  },
];

function formatDateWithMonth(dateString) {
  const options = { month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function formatDateOnly(dateString) {
  const options = { day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function formatDates(dates) {
  const numDates = dates.length;

  if (numDates === 0) {
    return "";
  } else if (numDates === 1) {
    return formatDateWithMonth(dates[0]);
  } else {
    const [firstDate, ...rest] = dates;
    const lastDate = new Date(dates[numDates - 1]);
    const numDays = numDates;
    const formattedDates = [
      formatDateWithMonth(firstDate),
      ...rest.map((date) => formatDateOnly(date)),
    ];

    // Check if the dates span across multiple months
    if (new Date(firstDate).getMonth() !== lastDate.getMonth()) {
      const lastDateFormatted = formatDateWithMonth(dates[numDates - 1]);
      return `${formattedDates
        .slice(0, -1)
        .join(", ")} & ${lastDateFormatted} (${numDays} days)`;
    } else {
      return `${formattedDates
        .slice(0, -1)
        .join(", ")} & ${formattedDates.slice(-1)} (${numDays} days)`;
    }
  }
}

const SchedulingRange = () => {
  const fp = useRef(null);
  const { track, page } = useAnalytics();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isInitalLoad, setIsInitalLoad] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [courseTypeFilter] = useQueryString("courseType", {
    defaultValue: "SKY_BREATH_MEDITATION",
  });
  const [mode, setMode] = useQueryString("mode", {
    defaultValue: COURSE_MODES.ONLINE.value,
  });
  const [timezoneFilter, setTimezoneFilter] = useQueryString("timezone", {
    defaultValue: "EST",
  });
  const [milesFilter] = useQueryString("miles", {
    defaultValue: "50",
  });
  const [locationFilter, setLocationFilter] = useQueryString("location", {
    parse: JSON.parse,
  });
  const [selectedWorkshopId, setSelectedWorkshopId] = useState();
  const [selectedDates, setSelectedDates] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentMonthYear, setCurrentMonthYear] = useQueryString("ym", {
    defaultValue: `${moment().year()}-${moment().month() + 1}`,
  });
  // const courseTypeValue =
  //   findCourseTypeByKey(courseTypeFilter)?.value ||
  //   COURSE_TYPES.SKY_BREATH_MEDITATION?.value;

  const { data: workshopMaster = {} } = useQuery(
    ["workshopMaster", mode],
    async () => {
      let ctypeId = null;
      if (
        findCourseTypeByKey(courseTypeFilter)?.subTypes &&
        findCourseTypeByKey(courseTypeFilter)?.subTypes[mode]
      ) {
        ctypeId = findCourseTypeByKey(courseTypeFilter)?.subTypes[mode];
      } else {
        const courseTypeValue =
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value;

        ctypeId = courseTypeValue ? courseTypeValue.split(";")[0] : undefined;
      }

      let param = {
        ctypeId,
      };
      const response = await api.get({
        path: "workshopMaster",
        param,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: dateAvailable = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    [
      "workshopMonthCalendar",
      currentMonthYear,
      courseTypeFilter,
      timezoneFilter,
      mode,
      locationFilter,
      milesFilter,
    ],
    async () => {
      let param = {
        ctype:
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
        month: currentMonthYear,
        timeZone: timezoneFilter,
      };
      if (mode && mode !== COURSE_MODES_BOTH) {
        param = { ...param, mode };
      }
      if (milesFilter) {
        param = { ...param, radius: milesFilter };
      }
      if (locationFilter) {
        const { lat, lng } = locationFilter || {};
        if (lat || lng) {
          param = {
            ...param,
            lat,
            lng,
          };
        }
      }
      const response = await api.get({
        path: "workshopMonthCalendar",
        param,
      });
      if (isInitalLoad) {
        const defaultDate =
          response.data.length > 0 ? response.data[0].allDates : [];
        if (fp?.current?.flatpickr && defaultDate.length > 0) {
          fp.current.flatpickr.jumpToDate(defaultDate[0], true);
          setTimeout(() => {
            fp.current.flatpickr.setDate(defaultDate, true);
          }, 10);
        }
        setIsInitalLoad(false);
      }
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffectOnce(() => {
    page({
      category: "course_registration",
      name: "course_search_scheduling",
      course_type: courseTypeFilter || COURSE_TYPES.SKY_BREATH_MEDITATION.code,
    });
  });

  // useEffect(() => {
  //   fp.current.flatpickr.changeMonth(
  //     parseInt(currentMonthYear.split("-")[1] - 1),
  //     false,
  //   );
  //   setTimeout(() => {
  //     fp.current.flatpickr.changeYear(
  //       parseInt(currentMonthYear.split("-")[0]),
  //       false,
  //     );
  //   }, 10);
  // }, []);

  const handleModalToggle = () => {
    setShowLocationModal(!showLocationModal);
  };

  function getGroupedUniqueEventIds(response) {
    const pairOfTimingAndEventId = response.data.reduce((acc, obj) => {
      let timings = obj.timings;
      timings = sortBy(timings, (obj) => new Date(obj.startDate));
      let timing_Str = timings.reduce((acc1, obj) => {
        acc1 += "" + obj.startDate + "" + obj.startTime;
        return acc1;
      }, "");
      timing_Str = obj.mode + "_" + timing_Str;
      acc = { ...acc, [timing_Str]: obj.id };
      return acc;
    }, {});
    return values(pairOfTimingAndEventId);
  }

  let enableDates = dateAvailable.map((da) => {
    return da.firstDate;
    // return {
    //   from: da.firstDate,
    //   to: da.allDates[da.allDates.length - 1],
    // };
  });

  enableDates = [...enableDates, ...selectedDates];

  const { data: workshops = [], isLoading: isLoadingWorkshops } = useQuery(
    [
      "workshops",
      selectedDates,
      timezoneFilter,
      mode,
      locationFilter,
      milesFilter,
    ],
    async () => {
      let param = {
        timeZone: timezoneFilter,
        sdate: selectedDates?.[0],
        timingsRequired: true,
        skipFullCourses: true,
        ctype:
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
      };
      if (locationFilter) {
        const { lat, lng } = locationFilter || {};
        if (lat || lng) {
          param = {
            ...param,
            lat,
            lng,
          };
        }
      }
      if (milesFilter) {
        param = { ...param, radius: milesFilter };
      }
      if (mode && mode !== COURSE_MODES_BOTH) {
        param = { ...param, mode };
      }
      const response = await api.get({
        path: "workshops",
        param,
      });
      if (response?.data && selectedDates?.length > 0) {
        const selectedSfids = getGroupedUniqueEventIds(response);
        const finalWorkshops = response?.data.filter((item) =>
          selectedSfids.includes(item.sfid),
        );

        setTimeout(() => {
          const timeContainer = document.querySelector(
            ".scheduling-modal__content-option",
          );
          if (timeContainer) {
            timeContainer.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
        track("click_calendar", {
          screen_name: "course_search_scheduling",
          course_type:
            courseTypeFilter || COURSE_MODES.SKY_BREATH_MEDITATION.code,
          location_type: mode,
          num_results: response?.data.length,
        });
        return finalWorkshops;
      }
    },
  );

  const getWorkshopDetails = async (workshopId) => {
    setLoading(true);
    const response = await await api.get({
      path: "workshopDetail",
      param: {
        id: workshopId,
        rp: "checkout",
      },
      isUnauthorized: true,
    });
    if (response?.data) {
      setActiveWorkshop(response?.data);
    }
    setLoading(false);
  };

  const handleWorkshopSelect = (workshop) => {
    setSelectedWorkshopId(workshop?.id);
    getWorkshopDetails(workshop?.id);
  };
  const handleTimezoneChange = (ev) => {
    ev.preventDefault();
    setTimezoneFilter(ev?.target?.value);
    setActiveWorkshop(null);
    setSelectedWorkshopId(null);
  };

  const goToPaymentModal = () => {
    pushRouteWithUTMQuery(router, {
      pathname: `/us-en/course/scheduling/checkout/${selectedWorkshopId}`,
      query: {
        courseType: courseTypeFilter,
        ctype: activeWorkshop?.productTypeId,
        mode,
      },
    });
  };

  const handleSelectMode = (value) => {
    if (value !== COURSE_MODES.ONLINE.value && !locationFilter) {
      setShowLocationModal(true);
    }
    setMode(value);
    setActiveWorkshop(null);
    setSelectedWorkshopId(null);
    setSelectedDates([]);
  };

  const onMonthChangeAction = (e, d, instance) => {
    setCurrentMonthYear(`${instance.currentYear}-${instance.currentMonth + 1}`);
  };

  const getDates = (startDate, stopDate) => {
    let dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
      dateArray.push(currentDate.toDate());
      currentDate = currentDate.add(1, "days");
    }
    return dateArray;
  };

  const handleFlatpickrOnChange = (selectedDates, dateStr, instance) => {
    let isEventAvailable = false;

    if (selectedDates.length > 0 && dateStr !== "update") {
      const today = moment(selectedDates[0]);
      let intervalSelected = [];
      for (const enableItem of dateAvailable) {
        const fromMoment = moment(enableItem.firstDate);
        const toMoment = moment(
          enableItem.allDates[enableItem.allDates.length - 1],
        );
        const isWithinRange = today.isBetween(
          fromMoment,
          toMoment,
          "days",
          "[]",
        );
        if (isWithinRange) {
          intervalSelected = getDates(fromMoment, toMoment);
          isEventAvailable = true;
          break; // Exit the loop when the condition is true
        }
      }
      if (isEventAvailable) {
        instance.selectedDates = [...intervalSelected];

        selectedDates = [...intervalSelected];

        instance.setDate(intervalSelected);
        setSelectedDates(
          intervalSelected.map((d) => moment(d).format("YYYY-MM-DD")),
        );
      }
    }
  };

  const handleLocationFilterChange = (value) => {
    if (value && Object.keys(value).length > 0) {
      setLocationFilter(JSON.stringify(value));
    } else {
      setLocationFilter(null);
    }
  };

  return (
    <>
      <header className="checkout-header">
        <img className="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>
      {(loading || isLoading || isLoadingWorkshops) && (
        <div className="cover-spin"></div>
      )}
      <main className="course-filter calendar-online">
        <section className="calendar-top-section">
          <div className="container calendar-benefits-section">
            <h2 className="section-title">
              <strong>
                {findCourseTypeByKey(courseTypeFilter)?.name ||
                  workshopMaster?.title ||
                  COURSE_TYPES.SKY_BREATH_MEDITATION?.name}
              </strong>
            </h2>
            <div
              className="section-description"
              dangerouslySetInnerHTML={{
                __html: workshopMaster.calenderViewDescription,
              }}
            ></div>
          </div>
          <div className="container calendar-course-type">
            <div className="calendar-benefits-wrapper row">
              <div className="col-12 col-lg-6 paddingRight">
                <h2 className="section-title">
                  <img src="/img/calendar.svg" /> Choose your Course Type
                </h2>
                <div className="scheduling-types__container">
                  <label
                    className="scheduling-types__label"
                    htmlFor="online-type-course"
                  >
                    <input
                      type="radio"
                      className="scheduling-types__input"
                      id="online-type-course"
                      name="type-course"
                      value={COURSE_MODES.ONLINE.value}
                      checked={mode === COURSE_MODES.ONLINE.value}
                      onChange={() =>
                        handleSelectMode(COURSE_MODES.ONLINE.value)
                      }
                    />
                    <span className="scheduling-types__background">Online</span>
                  </label>

                  <label
                    className="scheduling-types__label"
                    htmlFor="person-type-course"
                  >
                    <input
                      type="radio"
                      className="scheduling-types__input"
                      id="person-type-course"
                      name="type-course"
                      value={COURSE_MODES.IN_PERSON.value}
                      checked={mode === COURSE_MODES.IN_PERSON.value}
                      onChange={() =>
                        handleSelectMode(COURSE_MODES.IN_PERSON.value)
                      }
                    />
                    <span className="scheduling-types__background">
                      In-person
                    </span>
                  </label>

                  <label
                    className="scheduling-types__label"
                    htmlFor="both-type-course"
                  >
                    <input
                      type="radio"
                      className="scheduling-types__input"
                      id="both-type-course"
                      name="type-course"
                      value={COURSE_MODES_BOTH}
                      checked={mode === COURSE_MODES_BOTH}
                      onChange={() => handleSelectMode(COURSE_MODES_BOTH)}
                    />
                    <span className="scheduling-types__background">Both</span>
                  </label>
                </div>
                <div className="course_price">
                  {mode === COURSE_MODES.IN_PERSON.value && (
                    <h5>In-Person course price: ${workshopMaster.unitPrice}</h5>
                  )}
                  {mode === COURSE_MODES.ONLINE.value && (
                    <h5>Online course price: ${workshopMaster.unitPrice}</h5>
                  )}
                  {mode === COURSE_MODES_BOTH && (
                    <h5>Course price: ${workshopMaster.unitPrice}</h5>
                  )}
                  <p>Select the start date for this 3-day course</p>
                </div>
                <div className="scheduling-modal__content-calendar">
                  <Flatpickr
                    ref={fp}
                    data-enable-time
                    onChange={handleFlatpickrOnChange}
                    value={selectedDates}
                    options={{
                      allowInput: false,
                      inline: true,
                      mode: "single",
                      enableTime: false,
                      monthSelectorType: "static",
                      dateFormat: "Y-m-d",
                      minDate: "today",
                      enable: enableDates || [],
                    }}
                    onMonthChange={onMonthChangeAction}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-6 borderLeft">
                <div className="available-course-time">
                  <div className="available-course-heading">
                    <div className="clock_img">
                      <img src="/img/calendar.svg" />
                    </div>
                    <div className="available-course-title">
                      <h2 className="section-title"> Available Course Times</h2>
                      <p>Based on the selected date range</p>
                    </div>
                  </div>
                  <div
                    className="scheduling-modal__content-country-select"
                    data-select2-id="timezone"
                  >
                    <label data-select2-id="timezone">
                      <Select2
                        name="timezone"
                        id="timezone"
                        className="timezone select2-hidden-accessible"
                        defaultValue={"EST"}
                        multiple={false}
                        data={TIMEZONES}
                        onChange={handleTimezoneChange}
                        value={timezoneFilter}
                        options={{ minimumResultsForSearch: -1 }}
                      />
                    </label>
                  </div>
                  {mode !== COURSE_MODES.ONLINE.value && (
                    <div className="scheduling-types__location ">
                      <ScheduleLocationFilter
                        handleLocationChange={handleLocationFilterChange}
                        value={locationFilter}
                        containerClass="location-container"
                        listClassName="result-list"
                      />
                    </div>
                  )}

                  <div className="date_selection">
                    <h2 className="scheduling-modal__content-ranges-title">
                      {selectedDates &&
                        selectedDates.length > 0 &&
                        formatDates(selectedDates)}
                    </h2>

                    <ul className="scheduling-modal__content-options">
                      {workshops?.map((workshop, index) => {
                        return (
                          <WorkshopListItem
                            key={workshop.id}
                            workshop={workshop}
                            index={index}
                            selectedWorkshopId={selectedWorkshopId}
                            handleWorkshopSelect={handleWorkshopSelect}
                          />
                        );
                      })}
                      {workshops.length === 0 && (
                        <li className="scheduling-modal__content-option scheduling-no-data">
                          No Workshop Found
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="agreement_selection">
                    {activeWorkshop && activeWorkshop.id && (
                      <StripeExpressCheckoutElement
                        workshop={activeWorkshop}
                        goToPaymentModal={goToPaymentModal}
                        selectedWorkshopId={selectedWorkshopId}
                      />
                    )}

                    {!activeWorkshop && (
                      <button
                        type="button"
                        className="btn btn-continue tw-mt-5"
                        disabled={!selectedWorkshopId}
                        onClick={goToPaymentModal}
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <LocationSearchModal
          handleModalToggle={handleModalToggle}
          showLocationModal={showLocationModal}
          milesFilter={milesFilter}
          locationFilter={locationFilter}
          handleLocationFilterChange={handleLocationFilterChange}
        />
      </main>
    </>
  );
};

const WorkshopListItem = ({
  workshop,
  index,
  selectedWorkshopId,
  handleWorkshopSelect,
}) => {
  return (
    <li
      className={classNames("scheduling-modal__content-ranges", {
        highlight: selectedWorkshopId === workshop.id,
      })}
      onClick={() => handleWorkshopSelect(workshop)}
    >
      <input
        type="radio"
        id={`time-range-${index + 1}`}
        value={selectedWorkshopId}
        name="scheduling-options"
      />
      <div className="scheduling-modal__content-option">
        <ul className="scheduling-modal__content-ranges-variants">
          {workshop?.timings &&
            workshop.timings.map((time, i) => {
              return (
                <li className="scheduling-modal__content-ranges-row" key={i}>
                  <div className="scheduling-modal__content-ranges-row-date">
                    {dayjs.utc(time.startDate).format("ddd, D")}
                  </div>
                  <div className="scheduling-modal__content-ranges-row-time">
                    {tConvert(time.startTime, true)} -{" "}
                    {tConvert(time.endTime, true)}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </li>
  );
};

const LocationSearchModal = ({
  handleModalToggle,
  showLocationModal,
  milesFilter,
  locationFilter,
  handleLocationFilterChange,
}) => {
  return (
    <Modal
      show={showLocationModal}
      onHide={handleModalToggle}
      backdrop="static"
      className="location-search bd-example-modal-lg"
      dialogClassName="modal-dialog modal-dialog-centered modal-lg"
    >
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
        <p>On which location would you prefer to schedule your courses?</p>
        <br />
        <div className="location-search-field">
          <ScheduleLocationFilter
            handleLocationChange={handleLocationFilterChange}
            value={locationFilter}
            containerClass="location-input"
            listClassName="result-list"
          />
        </div>
        <button
          type="button"
          data-dismiss="modal"
          className="btn btn-primary find-courses"
          onClick={handleModalToggle}
        >
          Find Courses
        </button>
      </Modal.Body>
    </Modal>
  );
};

SchedulingRange.noHeader = true;

export default SchedulingRange;
