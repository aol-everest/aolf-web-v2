import React, { useCallback, useRef } from 'react';
import { COURSE_MODES, COURSE_TYPES } from '@constants';
import { useQueryString } from '@hooks';
import { pushRouteWithUTMQuery } from '@service';
import { api, tConvert, findCourseTypeByKey } from '@utils';
import dayjs from 'dayjs';
import { sortBy, values } from 'lodash';
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

var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const timezones = [
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

const SchedulingRange = () => {
  const fp = useRef(null);
  const { track, page } = useAnalytics();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [courseTypeFilter] = useQueryString('courseType', {
    defaultValue: 'SKY_BREATH_MEDITATION',
  });
  const [mode, setMode] = useQueryString('mode', {
    defaultValue: COURSE_MODES.ONLINE.value,
  });
  const [timezoneFilter, setTimezoneFilter] = useQueryString('timezone', {
    defaultValue: 'EST',
  });
  const [locationFilter, setLocationFilter] = useQueryString('location', {
    parse: JSON.parse,
  });
  const [selectedWorkshopId, setSelectedWorkshopId] = useState();
  const [selectedDates, setSelectedDates] = useState([]);
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [currentMonthYear, setCurrentMonthYear] = useQueryString('ym', {
    defaultValue: `${moment().year()}-${moment().month() + 1}`,
  });
  const courseTypeValue =
    findCourseTypeByKey(courseTypeFilter)?.value ||
    COURSE_TYPES.SKY_BREATH_MEDITATION?.value;

  const ctypeId = courseTypeValue ? courseTypeValue.split(';')[0] : undefined;
  const { data: workshopMaster = {} } = useQuery(
    'workshopMaster',
    async () => {
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

  const {
    data: dateAvailable = [],
    isLoading,
    isError,
    error,
  } = useQuery(
    [
      'workshopMonthCalendar',
      currentMonthYear,
      courseTypeFilter,
      timezoneFilter,
      mode,
      locationFilter,
    ],
    async () => {
      let param = {
        ctype:
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
        month: currentMonthYear,
        timeZone: timezoneFilter,
      };
      if (mode) {
        param = { ...param, mode };
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
        path: 'workshopMonthCalendar',
        param,
      });
      const defaultDate =
        response.data.length > 0 ? response.data[0].allDates : [];
      if (fp?.current?.flatpickr && defaultDate.length > 0) {
        fp.current.flatpickr.jumpToDate(defaultDate[0]);
        setTimeout(() => {
          fp.current.flatpickr.setDate(defaultDate, true);
        }, 10);
      }
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffectOnce(() => {
    page({
      category: 'course_registration',
      name: 'course_search_scheduling',
      course_type: courseTypeFilter || COURSE_TYPES.SKY_BREATH_MEDITATION.code,
    });
  });

  function getGroupedUniqueEventIds(response) {
    const pairOfTimingAndEventId = response.data.reduce((acc, obj) => {
      let timings = obj.timings;
      timings = sortBy(timings, (obj) => new Date(obj.startDate));
      let timing_Str = timings.reduce((acc1, obj) => {
        acc1 += '' + obj.startDate + '' + obj.startTime;
        return acc1;
      }, '');
      timing_Str = obj.mode + '_' + timing_Str;
      acc = { ...acc, [timing_Str]: obj.id };
      return acc;
    }, {});
    return values(pairOfTimingAndEventId);
  }

  const enableDates = dateAvailable.map((da) => {
    return {
      from: da.firstDate,
      to: da.allDates[da.allDates.length - 1],
    };
  });

  const { data: workshops = [] } = useQuery(
    ['workshops', selectedDates, timezoneFilter, mode, locationFilter],
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
      if (mode) {
        param = { ...param, mode };
      }
      const response = await api.get({
        path: 'workshops',
        param,
      });
      if (response?.data && selectedDates?.length > 0) {
        const selectedSfids = getGroupedUniqueEventIds(response);
        const finalWorkshops = response?.data.filter((item) =>
          selectedSfids.includes(item.sfid),
        );

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
        return finalWorkshops;
      }
    },
  );

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
    if (mode !== COURSE_MODES.IN_PERSON.value) {
      handleLocationFilterChange({});
    }
    setMode(value);
    setActiveWorkshop(null);
    setSelectedWorkshopId(null);
  };

  const onMonthChangeAction = (e, d, instance) => {
    setCurrentMonthYear(`${instance.currentYear}-${instance.currentMonth + 1}`);
  };

  const getDates = (startDate, stopDate) => {
    const addDays = (date, days) => {
      date.setDate(date.getDate() + days);
      return date;
    };
    let dateArray = [];
    let currentDate = startDate;
    while (currentDate <= stopDate) {
      dateArray.push(new Date(currentDate));
      currentDate = addDays(new Date(currentDate), 1);
    }
    return dateArray;
  };

  const handleFlatpickrOnChange = (selectedDates, dateStr, instance) => {
    if (selectedDates.length > 0 && dateStr !== 'update') {
      const today = moment(selectedDates[selectedDates.length - 1]);
      let intervalSelected = [];
      for (const enableItem of instance.config._enable) {
        const fromMoment = moment(enableItem.from);
        const toMoment = moment(enableItem.to);
        const isWithinRange = today.isBetween(
          fromMoment,
          toMoment,
          'days',
          '[]',
        );

        if (isWithinRange) {
          intervalSelected = getDates(enableItem.from, enableItem.to);
          break; // Exit the loop when the condition is true
        }
      }

      instance.selectedDates = [...intervalSelected];
      selectedDates = [...intervalSelected];

      instance.setDate(intervalSelected);
      setSelectedDates(
        intervalSelected.map((d) => moment(d).format('YYYY-MM-DD')),
      );

      /* const lastItem =
        selectedDates?.length > 0
          ? selectedDates[selectedDates?.length - 1]
          : selectedDates[0];
      handleDateChange(lastItem); */
    }
  };

  const handleLocationFilterChange = (value) => {
    setLocationFilter(JSON.stringify(value));
  };

  return (
    <>
      <header className="checkout-header">
        <img className="checkout-header__logo" src="/img/ic-logo.svg" alt="" />
      </header>
      {(loading || isLoading) && <div className="cover-spin"></div>}
      <main className="main">
        <div className="scheduling-modal__step">
          <div id="modal-header" className="scheduling-modal__header">
            <svg
              fill="none"
              height="40"
              viewBox="0 0 40 40"
              width="40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.97338 37.5C6.97338 37.5 5.84838 37.125 5.09838 36.375C3.97338 35.5 3.34838 34.125 3.34838 32.75C3.34838 32.25 3.47338 31.75 3.59838 31.375C2.72338 31.125 2.09838 30.5 1.59838 29.625C0.848379 28.125 1.34838 26.375 2.72338 25.5C4.18413 24.6426 7.07961 22.925 8.29299 22.2048C8.6583 21.9879 8.9647 21.686 9.18735 21.3241L11.8484 17C13.0984 15 14.9734 13.625 17.2234 13.125C15.7234 12 14.7234 10.375 14.7234 8.375C14.7234 5.125 17.3484 2.5 20.5984 2.5C23.8484 2.5 26.4734 5.125 26.4734 8.375C26.4734 10.25 25.5984 12 24.0984 13C26.2234 13.5 28.0984 14.875 29.2234 16.75L32.0984 21.625C32.2234 21.75 32.2234 21.875 32.4734 22L38.2234 25.375C39.5984 26.125 40.2234 28 39.4734 29.5C39.0984 30.25 38.3484 30.875 37.5984 31.125C37.8484 31.625 37.8484 32.25 37.8484 32.75C37.8484 34.125 37.2234 35.375 36.2234 36.25C35.2234 37.125 33.8484 37.625 32.4734 37.375L20.4734 35.75L8.72338 37.375C8.47338 37.5 8.22338 37.5 7.97338 37.5ZM20.7234 30.5H7.97338C6.84838 30.5 5.84838 31.625 5.84838 32.75C5.84838 33.375 6.09838 34 6.59838 34.5C7.09838 34.875 7.72338 35 8.22338 35L20.4734 33.375C20.5984 33.375 20.7234 33.375 20.8484 33.375L32.9734 35C33.5984 35.125 34.2234 34.875 34.7234 34.5C35.2234 34.125 35.4734 33.5 35.4734 32.875C35.4734 31.75 34.4734 30.625 33.3484 30.625L20.7234 30.5ZM22.0984 15.25L19.0984 15.375C16.8484 15.375 15.0984 16.375 13.9734 18.125L11.0984 22.875C10.8484 23.375 10.3484 23.875 9.72338 24.25L4.09838 27.5C3.84838 27.625 3.59838 28 3.84838 28.375C3.97338 28.625 4.22338 28.875 4.47338 28.875H4.59838L4.84838 28.75L11.0984 26C12.0984 25.5 12.7234 24.375 13.3484 23C13.5984 22.5 13.8484 22 14.0984 21.5C14.3484 21 14.9734 20.75 15.4734 20.875C15.9734 21 16.4734 21.5 16.4734 22.125V27.875H20.7234H24.8484V22.125C24.8484 21.5 25.2234 21.125 25.7234 20.875C26.2234 20.75 26.8484 21 27.0984 21.5C27.3484 22 27.5984 22.5 27.9734 23.125C28.5984 24.375 29.0984 25.625 30.2234 26.125L36.4734 28.625C36.5984 28.625 36.5984 28.75 36.7234 28.75C36.7234 28.75 36.7234 28.75 36.8484 28.75C37.0984 28.75 37.3484 28.625 37.4734 28.25C37.5984 27.875 37.4734 27.5 37.2234 27.375L31.5984 24C30.9734 23.75 30.4734 23.25 30.2234 22.625L27.3484 17.875C26.0984 16.375 24.0984 15.25 22.0984 15.25ZM13.8484 27.125C13.5984 27.5 13.2234 27.75 12.8484 28H13.8484V27.125ZM27.3484 28H28.3484C27.9734 27.75 27.5984 27.375 27.3484 27V28ZM20.5984 5C18.7234 5 17.2234 6.5 17.2234 8.375C17.2234 10.25 18.7234 11.75 20.5984 11.75C22.4734 11.75 23.9734 10.25 23.9734 8.375C23.9734 6.5 22.4734 5 20.5984 5Z"
                fill="#FCA248"
              />
            </svg>
            <div className="scheduling-modal__header-text">
              <h3>
                {findCourseTypeByKey(courseTypeFilter)?.name ||
                  workshopMaster?.title ||
                  COURSE_TYPES.SKY_BREATH_MEDITATION?.name}
              </h3>
            </div>
          </div>

          <div id="first-step" className="scheduling-modal__template">
            <div className="scheduling-modal__content-wrapper">
              <h3>Choose Workshop Date & Time</h3>
              <div className="scheduling-modal__content-calendar">
                <label>
                  <Flatpickr
                    ref={fp}
                    data-enable-time
                    onChange={handleFlatpickrOnChange}
                    value={selectedDates}
                    options={{
                      allowInput: false,
                      inline: true,
                      mode: 'multiple',
                      enableTime: false,
                      monthSelectorType: 'static',
                      dateFormat: 'Y-m-d',
                      minDate: 'today',
                      enable: enableDates || [],
                    }}
                    onMonthChange={onMonthChangeAction}
                  />
                </label>
              </div>
              <div className="scheduling-modal__content-country-select">
                <label>
                  <Select2
                    name="timezone"
                    id="timezone"
                    className="timezone"
                    defaultValue={'EST'}
                    multiple={false}
                    data={timezones}
                    onChange={handleTimezoneChange}
                    value={timezoneFilter}
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="scheduling-modal__content-wrapper">
                <h3>Available Class Times</h3>
                <p>Based on the selected date range</p>

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
                      value={''}
                      checked={!mode}
                      onChange={() => handleSelectMode('')}
                    />
                    <span className="scheduling-types__background">Both</span>
                  </label>
                </div>
                {mode === COURSE_MODES.IN_PERSON.value && (
                  <div className="scheduling-types__location">
                    <ScheduleLocationFilter
                      handleLocationChange={handleLocationFilterChange}
                      value={locationFilter}
                      containerClass="location-container"
                    />
                  </div>
                )}

                <ul className="scheduling-modal__content-options">
                  {workshops?.map((workshop, index) => {
                    return (
                      <li
                        className="scheduling-modal__content-ranges"
                        key={workshop.id}
                        onClick={() => handleWorkshopSelect(workshop)}
                      >
                        <input
                          type="radio"
                          id={`time-range-${index + 1}`}
                          value={selectedWorkshopId}
                          name="scheduling-options"
                        />
                        <div className="scheduling-modal__content-option">
                          <label
                            className="scheduling-modal__content-ranges-title"
                            htmlFor={`time-range-${index + 1}`}
                          >
                            <span>
                              {workshop.mode}:{' '}
                              {dayjs
                                .utc(workshop.eventStartDate)
                                .format('MMM DD')}{' '}
                              -{' '}
                              {dayjs
                                .utc(workshop.eventEndDate)
                                .format('MMM DD')}
                            </span>
                          </label>
                          {workshop.mode !== COURSE_MODES.ONLINE.name && (
                            <p>
                              Location:{' '}
                              {`${workshop.locationStreet || ''} ${
                                workshop.locationCity || ''
                              },
                              ${workshop.locationProvince || ''} ${
                                workshop.locationPostalCode || ''
                              }`}
                            </p>
                          )}

                          <ul className="scheduling-modal__content-ranges-variants">
                            {workshop?.timings &&
                              workshop.timings.map((time, i) => {
                                return (
                                  <li
                                    className="scheduling-modal__content-ranges-row"
                                    key={i}
                                  >
                                    <div className="scheduling-modal__content-ranges-row-date">
                                      {dayjs
                                        .utc(time.startDate)
                                        .format('ddd, D')}
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
                  })}
                  {workshops.length === 0 && (
                    <li className="scheduling-modal__content-option scheduling-no-data">
                      No Workshop Found
                    </li>
                  )}
                </ul>
              </div>

              {activeWorkshop && activeWorkshop.id && (
                <StripeExpressCheckoutElement workshop={activeWorkshop} />
              )}

              <button
                className="scheduling-modal__continue"
                id="go-to-second-step"
                type="button"
                disabled={!selectedWorkshopId}
                onClick={goToPaymentModal}
              >
                continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

SchedulingRange.noHeader = true;
SchedulingRange.hideFooter = true;

export default SchedulingRange;
