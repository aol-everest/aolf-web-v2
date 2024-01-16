import React, { useEffect, useRef } from 'react';
import { COURSE_MODES, COURSE_TYPES, TIME_ZONE } from '@constants';
import { useQueryState, parseAsString } from 'nuqs';
import { pushRouteWithUTMQuery } from '@service';
import {
  api,
  tConvert,
  findCourseTypeByKey,
  getZipCodeByLatLang,
  getUserTimeZoneAbbreviation,
} from '@utils';
import dayjs from 'dayjs';
import { sortBy, values, omit } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import Select2 from 'react-select2-wrapper';
import { useQuery } from 'react-query';
import { StripeExpressCheckoutElement } from '@components/checkout/StripeExpressCheckoutElement';
import 'flatpickr/dist/flatpickr.min.css';
import { ScheduleLocationFilter } from '@components/scheduleLocationFilter/ScheduleLocationFilter';
import { useEffectOnce } from 'react-use';
import { useAnalytics } from 'use-analytics';
import classNames from 'classnames';
import Modal from 'react-bootstrap/Modal';
import { orgConfig } from '@org';

var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const COURSE_MODES_BOTH = 'both';

const TIMEZONES = [
  {
    timezone: 'US/Eastern',
    text: 'Eastern Time - US & Canada',
    id: 'EST',
  },
  {
    timezone: 'US/Central',
    text: 'Central Time - US & Canada',
    id: 'CST',
  },
  {
    timezone: 'US/Mountain',
    text: 'Mountain Time - US & Canada',
    id: 'MST',
  },
  {
    timezone: 'America/Los_Angeles',
    text: 'Pacific Time - US & Canada',
    id: 'PST',
  },
];

function formatDateWithMonth(dateString) {
  return moment(dateString).format('MMM D');
}

function formatDateOnly(dateString) {
  return moment(dateString).format('D');
}

/**
 * Formats an array of dates into a human-readable string.
 * @param {string[]} dates - The array of date strings to format.
 * @returns {string} - The formatted date string.
 */
function formatDates(dates) {
  const dateCount = dates.length;

  if (dateCount === 0) {
    return '';
  } else if (dateCount === 1) {
    return formatDateWithMonth(dates[0]);
  } else {
    const [firstDate, ...rest] = dates;
    const lastDate = moment(dates[dateCount - 1]);
    const numDays = dateCount;
    const formattedDates = [
      formatDateWithMonth(firstDate),
      ...rest.map((date) => formatDateOnly(date)),
    ];

    // Check if the dates span across multiple months
    if (!moment(firstDate).isSame(lastDate, 'month')) {
      const lastDateFormatted = formatDateWithMonth(dates[dateCount - 1]);
      return `${formattedDates
        .slice(0, -1)
        .join(', ')} & ${lastDateFormatted} (${numDays} days)`;
    } else {
      return `${formattedDates
        .slice(0, -1)
        .join(', ')} & ${formattedDates.slice(-1)} (${numDays} days)`;
    }
  }
}

const SchedulingRange = () => {
  const fp = useRef(null);
  const { track, page } = useAnalytics();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [courseTypeFilter] = useQueryState(
    'courseType',
    parseAsString.withDefault('SKY_BREATH_MEDITATION'),
  );
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault(COURSE_MODES.ONLINE.value),
  );
  const [timezoneFilter, setTimezoneFilter] = useQueryState(
    'timezone',
    parseAsString.withDefault('EST'),
  );
  const [milesFilter] = useQueryState('miles', parseAsString.withDefault('50'));
  const [locationFilter, setLocationFilter] = useState({});
  const [selectedWorkshopId, setSelectedWorkshopId] = useState();
  const [selectedDates, setSelectedDates] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [dateAvailable, setDateAvailable] = useState([]);
  const [isWorkshopMonthLoading, setIsWorkshopMonthLoading] = useState(true);
  const [isWorkshopsLoading, setIsWorkshopsLoading] = useState(false);
  const [workshops, setWorkshops] = useState([]);
  const [currentMonthYear, setCurrentMonthYear] = useQueryState(
    'ym',
    parseAsString.withDefault(`${moment().year()}-${moment().month() + 1}`),
  );

  const [teacherFilter] = useQueryState('teacher');
  const [cityFilter] = useQueryState('city');

  const isMounted = useRef(false);

  useEffect(() => {
    const getUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const [zipCode] = await Promise.all([
              getZipCodeByLatLang(latitude, longitude),
            ]);
            setZipCode(zipCode);
            setLocationFilter({ lat: latitude, lng: longitude, zipCode });
          },
          (error) => {
            getWorkshopMonthCalendar();
            getWorkshops();
            console.error('Error getting location:', error.message);
          },
        );
      } else {
        console.error('Geolocation is not supported by your browser.');
      }
    };
    getUserLocation();
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      console.log('selectedDates', selectedDates);
      getWorkshopMonthCalendar();
      if (selectedDates?.length > 0) {
        getWorkshops();
      }
    } else {
      isMounted.current = true;
    }
  }, [
    currentMonthYear,
    timezoneFilter,
    locationFilter,
    milesFilter,
    mode,
    courseTypeFilter,
    selectedDates,
  ]);

  useEffectOnce(() => {
    page({
      category: 'course_registration',
      name: 'course_search_scheduling',
      course_type: courseTypeFilter || COURSE_TYPES.SKY_BREATH_MEDITATION.code,
    });
    if (orgConfig.name === 'AOL') {
      setTimezoneFilter(fillDefaultTimeZone());
    }
  });

  const fillDefaultTimeZone = () => {
    const userTimeZoneAbbreviation = getUserTimeZoneAbbreviation() || '';
    if (TIME_ZONE[userTimeZoneAbbreviation.toUpperCase()]) {
      return userTimeZoneAbbreviation.toUpperCase();
    }
    return null;
  };

  const getWorkshopMonthCalendar = async () => {
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
    if (teacherFilter) {
      param = { ...param, teacherId: teacherFilter };
    }
    if (cityFilter) {
      param = { ...param, city: cityFilter };
    }
    if (locationFilter && !cityFilter) {
      const { lat, lng } = locationFilter || {};
      if (lat || lng) {
        param = {
          ...param,
          lat: parseInt(lat)?.toFixed(4),
          lng: parseInt(lng)?.toFixed(4),
        };
      }
    }
    const response = await api.get({
      path: 'workshopMonthCalendar',
      param,
    });
    if (isInitialLoad) {
      const defaultDate =
        response.data.length > 0 ? response.data[0].allDates : [];
      if (fp?.current?.flatpickr && defaultDate.length > 0) {
        setTimeout(() => {
          fp.current.flatpickr.setDate(defaultDate, true);
        }, 100);
      }
      setIsInitialLoad(false);
    }
    setIsWorkshopMonthLoading(false);
    setDateAvailable(response?.data);
  };

  const getWorkshops = async () => {
    setIsWorkshopsLoading(true);
    let param = {
      timeZone: timezoneFilter,
      sdate: mode !== COURSE_MODES.IN_PERSON.value ? selectedDates?.[0] : null,
      timingsRequired: true,
      skipFullCourses: true,
      ctype:
        findCourseTypeByKey(courseTypeFilter)?.value ||
        COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
      random: true,
    };

    if (milesFilter) {
      param = { ...param, radius: milesFilter };
    }
    if (mode && mode !== COURSE_MODES_BOTH) {
      param = { ...param, mode };
    }
    if (teacherFilter) {
      param = { ...param, teacherId: teacherFilter };
    }
    if (cityFilter) {
      param = { ...param, city: cityFilter };
    }

    if (locationFilter && !cityFilter) {
      const { lat, lng } = locationFilter || {};
      if (lat || lng) {
        param = {
          ...param,
          lat: parseInt(lat)?.toFixed(4),
          lng: parseInt(lng)?.toFixed(4),
        };
      }
    }

    const response = await api.get({
      path: 'workshops',
      param,
    });
    if (response?.data && selectedDates?.length > 0) {
      const selectedSfids = getGroupedUniqueEventIds(response);
      const finalWorkshops =
        mode === COURSE_MODES.IN_PERSON.value
          ? response?.data
          : response?.data.filter((item) => selectedSfids.includes(item.sfid));

      setTimeout(() => {
        const timeContainer = document.querySelector(
          '.scheduling-modal__content-option',
        );
        if (timeContainer) {
          timeContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
      track('click_calendar', {
        screen_name: 'course_search_scheduling',
        course_type:
          courseTypeFilter || COURSE_MODES.SKY_BREATH_MEDITATION.code,
        location_type: mode,
        num_results: response?.data.length,
      });
      setWorkshops(finalWorkshops);
    }
    setIsWorkshopsLoading(false);
  };

  const { data: workshopMaster = {} } = useQuery(
    ['workshopMaster', mode],
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

        ctypeId = courseTypeValue ? courseTypeValue.split(';')[0] : undefined;
      }

      let param = {
        ctypeId,
      };
      const response = await api.get({
        path: 'workshopMaster',
        param,
      });
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleModalToggle = () => {
    setShowLocationModal(!showLocationModal);
  };

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  function getGroupedUniqueEventIds(response) {
    const groupedEvents = response.data.reduce((acc, obj) => {
      let timings = obj.timings;
      timings = sortBy(timings, (obj) => new Date(obj.startDate));

      const timingKey = timings.reduce((acc1, obj) => {
        acc1 += '' + obj.startDate + '' + obj.startTime;
        return acc1;
      }, '');

      const existingEvent = acc[timingKey];

      if (
        !existingEvent ||
        calculateTotalDistance(obj) < calculateTotalDistance(existingEvent)
      ) {
        acc[timingKey] = obj;
      }

      return acc;
    }, {});

    const closestEventIds = Object.values(groupedEvents).map(
      (event) => event.id,
    );

    return closestEventIds;
  }

  function calculateTotalDistance(event) {
    const timings = sortBy(event.timings, (obj) => new Date(obj.startDate));
    const earthRadius = 6371; // Earth radius in kilometers

    const totalDistance = timings.reduce((acc, timing) => {
      const eventLat = event.eventGeoLat;
      const eventLon = event.eventGeoLon;
      const targetLat = locationFilter?.lat;
      const targetLon = locationFilter?.lng;

      // Haversine formula for distance calculation
      const dLat = toRadians(eventLat - targetLat);
      const dLon = toRadians(eventLon - targetLon);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(targetLat)) *
          Math.cos(toRadians(eventLat)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadius * c;

      return acc + distance;
    }, 0);

    return totalDistance;
  }

  let enableDates = dateAvailable.map((da) => {
    return da.firstDate;
  });

  enableDates = [...enableDates, ...selectedDates];

  const upcomingByZipCode = [];
  const otherCourses = [];
  workshops.forEach((item) => {
    if (item.locationPostalCode == zipCode) {
      upcomingByZipCode.push(item);
    } else {
      otherCourses.push(item);
    }
  });

  const getWorkshopDetails = async (workshopId) => {
    setLoading(true);
    const response = await await api.get({
      path: 'workshopDetail',
      param: {
        id: workshopId,
        rp: 'checkout',
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
    resetCalender();
    setIsInitialLoad(true);
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
    resetCalender();
    if (
      value === COURSE_MODES.ONLINE.value ||
      (value !== COURSE_MODES.ONLINE.value && locationFilter)
    ) {
      setIsInitialLoad(true);
    }
  };

  const resetCalender = () => {
    setActiveWorkshop(null);
    setSelectedWorkshopId(null);
    setSelectedDates([]);
    fp.current.flatpickr.clear();
    fp.current.flatpickr.changeMonth(0);
    setCurrentMonthYear(
      `${fp.current.flatpickr.currentYear}-${
        fp.current.flatpickr.currentMonth + 1
      }`,
    );
  };

  const onMonthChangeAction = (e, d, instance) => {
    setCurrentMonthYear(`${instance.currentYear}-${instance.currentMonth + 1}`);
  };

  const getDates = (startDate, stopDate) => {
    let dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
      dateArray.push(currentDate.toDate());
      currentDate = currentDate.add(1, 'days');
    }
    return dateArray;
  };

  const handleFlatpickrOnChange = (selectedDates, dateStr, instance) => {
    let isEventAvailable = false;

    if (selectedDates.length > 0 && dateStr !== 'update') {
      const today = moment(selectedDates[0]);
      let intervalSelected = [];
      for (const enableItem of dateAvailable) {
        const fromMoment = moment(enableItem.firstDate);
        const toMoment = moment(
          enableItem.allDates[enableItem.allDates.length - 1],
        );
        const isWithinRange = today.isSame(fromMoment, 'date');
        if (isWithinRange) {
          intervalSelected = getDates(fromMoment, toMoment);
          isEventAvailable = true;
          break; // Exit the loop when the condition is true
        }
      }
      if (!isEventAvailable) {
        for (const enableItem of dateAvailable) {
          const fromMoment = moment(enableItem.firstDate);
          const toMoment = moment(
            enableItem.allDates[enableItem.allDates.length - 1],
          );
          const isWithinRange = today.isBetween(
            fromMoment,
            toMoment,
            'days',
            '[]',
          );
          if (isWithinRange) {
            intervalSelected = getDates(fromMoment, toMoment);
            isEventAvailable = true;
            break; // Exit the loop when the condition is true
          }
        }
      }
      if (isEventAvailable) {
        instance.selectedDates = [...intervalSelected];

        selectedDates = [...intervalSelected];

        instance.setDate(intervalSelected);
        setSelectedDates(
          intervalSelected.map((d) => moment(d).format('YYYY-MM-DD')),
        );
      }
    }
  };

  const handleLocationFilterChange = (value) => {
    resetCalender();
    setIsInitialLoad(true);
    if (value) {
      const zipCode = value.zipCode;
      setZipCode(zipCode);
      const updatedValue = omit(value, 'zipCode');
      if (updatedValue && Object.keys(updatedValue).length > 0) {
        setLocationFilter(updatedValue);
      }
      setLocationFilter(value);
    } else {
      setLocationFilter(null);
    }
  };

  return (
    <>
      <header className="checkout-header">
        <img className="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>
      {(loading || isWorkshopsLoading || isWorkshopMonthLoading) && (
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
                  <div className="calendar_img">
                    <img src="/img/calendar.svg" />
                  </div>
                  Choose your Course Type
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

                  {/* <label
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
                  </label> */}
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
                      mode: 'single',
                      enableTime: false,
                      monthSelectorType: 'static',
                      dateFormat: 'Y-m-d',
                      minDate: 'today',
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
                      <img src="/img/calendar-time.svg" />
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
                        defaultValue={'EST'}
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

                  {mode === COURSE_MODES.IN_PERSON.value && (
                    <div className="date_selection">
                      <h2 className="scheduling-modal__content-ranges-title">
                        Upcoming courses in your zip code
                      </h2>

                      <ul className="scheduling-modal__content-options">
                        {upcomingByZipCode?.map((workshop, index) => {
                          return (
                            <WorkshopListItem
                              key={workshop.id}
                              workshop={workshop}
                              index={index}
                              selectedWorkshopId={selectedWorkshopId}
                              handleWorkshopSelect={handleWorkshopSelect}
                              mode={mode}
                            />
                          );
                        })}
                        {upcomingByZipCode.length === 0 && (
                          <li className="scheduling-modal__content-option scheduling-no-data">
                            Workshop not found for you zip code
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="date_selection">
                    {mode !== COURSE_MODES.ONLINE.value ? (
                      <h2 className="scheduling-modal__content-ranges-title">
                        Other nearby courses
                      </h2>
                    ) : (
                      <h2 className="scheduling-modal__content-ranges-title">
                        {selectedDates &&
                          selectedDates.length > 0 &&
                          formatDates(selectedDates)}
                      </h2>
                    )}

                    <ul className="scheduling-modal__content-options">
                      {otherCourses?.map((workshop, index) => {
                        return (
                          <WorkshopListItem
                            key={workshop.id}
                            workshop={workshop}
                            index={index}
                            selectedWorkshopId={selectedWorkshopId}
                            handleWorkshopSelect={handleWorkshopSelect}
                            mode={mode}
                          />
                        );
                      })}
                      {otherCourses.length === 0 && (
                        <li className="scheduling-modal__content-option scheduling-no-data">
                          Workshop not found. Please choose the next available
                          date.
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
  mode,
}) => {
  return (
    <li
      className={classNames('scheduling-modal__content-ranges', {
        highlight: selectedWorkshopId === workshop.id,
      })}
      onClick={() => handleWorkshopSelect(workshop)}
    >
      <input
        type="radio"
        id={`time-range-${index + 1}`}
        value={workshop.id}
        name="scheduling-options"
        defaultChecked={selectedWorkshopId === workshop.id}
        checked={selectedWorkshopId === workshop.id}
      />
      <div className="scheduling-modal__content-option">
        {mode === COURSE_MODES.IN_PERSON.value && (
          <span className="location">
            {!workshop.isLocationEmpty && (
              <>
                Location: {workshop?.locationCity}, {workshop?.locationProvince}
              </>
            )}
            {workshop.isLocationEmpty && (
              <>
                Location: {workshop?.city}, {workshop?.state}
              </>
            )}
          </span>
        )}
        <ul className="scheduling-modal__content-ranges-variants">
          {workshop?.timings &&
            workshop.timings.map((time, i) => {
              return (
                <li className="scheduling-modal__content-ranges-row" key={i}>
                  <div className="scheduling-modal__content-ranges-row-date">
                    {dayjs.utc(time.startDate).format('ddd, MMM D')}
                  </div>
                  <div className="scheduling-modal__content-ranges-row-time">
                    {tConvert(time.startTime, true)} -{' '}
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
SchedulingRange.hideFooter = true;

export default SchedulingRange;
