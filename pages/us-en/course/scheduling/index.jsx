/* eslint-disable no-inline-styles/no-inline-styles */
import { ScheduleLocationFilterNew } from '@components/scheduleLocationFilter/ScheduleLocationFilterNew';
import { useQueryState, parseAsString, parseAsJson } from 'nuqs';
import moment from 'moment';
import { api, findCourseTypeByKey, findSlugByProductTypeId } from '@utils';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { sortBy } from 'lodash';
import Flatpickr from 'react-flatpickr';
import { COURSE_MODES, COURSE_TYPES } from '@constants';
import { useAnalytics } from 'use-analytics';
import { useEffectOnce } from 'react-use';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import 'flatpickr/dist/flatpickr.min.css';
import { replaceRouteWithUTMQuery } from '@service';
import { Loader } from '@components';
import WorkshopSelectModal from '@components/scheduleWorkshopModal/ScheduleWorkshopModal';
import { usePageTriggers } from '@hooks';
import { PopVariation2 } from '@components/inactivePopup';

const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const COURSE_MODES_BOTH = 'both';

function convertUndefinedToNull(obj) {
  // Check if the input is an object
  if (obj && typeof obj === 'object') {
    // Iterate over each key in the object
    for (const key in obj) {
      if (obj[key] === undefined) {
        // Convert undefined to null
        obj[key] = null;
      } else if (typeof obj[key] === 'object') {
        // Recursively call the function for nested objects
        convertUndefinedToNull(obj[key]);
      }
    }
  }
  return obj;
}

export async function getServerSideProps(context) {
  let initialLocation = {};
  const ip =
    context.req.headers['x-forwarded-for'] ||
    context.req.connection.remoteAddress;

  try {
    const res = await fetch(
      `${process.env.IP_INFO_API_URL}/${ip}?token=${process.env.IP_INFO_API_TOKEN}`,
    );
    const {
      postal = null,
      loc = null,
      city = null,
      region = null,
      country = null,
    } = convertUndefinedToNull(await res.json());

    const [lat = null, lng = null] = (loc || '').split(',');
    initialLocation = {
      lat,
      lng,
      postal,
      locationName: [city, region, country, postal].join(', '),
    };
  } catch (error) {
    console.error('Failed to fetch ZIP code by IP');
  }

  return {
    props: { initialLocation },
  };
}

const Scheduling = ({ initialLocation }) => {
  const fp = useRef(null);
  const { track, page } = useAnalytics();
  const router = useRouter();
  const [milesFilter] = useQueryState('miles', parseAsString.withDefault('50'));
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showWorkshopSelectModal, setShowWorkshopSelectModal] = useState(false);
  const [attendeeId] = useQueryState('aid');
  const [locationFilter, setLocationFilter] = useQueryState(
    'location',
    parseAsJson(),
  );
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useQueryState(
    'selectedDate',
    parseAsJson(),
  );
  const [workshops, setWorkshops] = useState([]);
  const [timezoneFilter, setTimezoneFilter] = useState('');
  const [currentMonthYear, setCurrentMonthYear] = useQueryState(
    'ym',
    parseAsString.withDefault(`${moment().year()}-${moment().month() + 1}`),
  );
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [activeWorkshop, setActiveWorkshop] = useState({});
  const [courseTypeFilter] = useQueryState(
    'courseType',
    parseAsString.withDefault('SKY_BREATH_MEDITATION'),
  );
  const [mode, setMode] = useQueryState(
    'mode',
    parseAsString.withDefault('both'),
  );

  const [teacherFilter] = useQueryState('teacher');
  const [cityFilter, setCityFilter] = useQueryState('city');
  const [utmMedium, setUtmMedium] = useQueryState('utm_medium');
  const [isPopupVariationVisible, setPopupVariationVisible] = useState(false);
  const [isPopupVariationExecuted, setPopupVariationExecuted] = useState(false);

  const showPopupVariation = () => {
    if (!isPopupVariationExecuted && selectedDates?.length > 0) {
      setPopupVariationVisible(true);
      setPopupVariationExecuted(true);
    }
  };

  const closePopupVariation = (state) => (e) => {
    if (e) e.preventDefault();
    state(false);
  };

  const acceptPopupVariationOffer = (e) => {
    setUtmMedium('sys');
    setPopupVariationVisible(false);
  };

  const handleTimeTrigger = () => {
    showPopupVariation();
  };

  const handleInactivityTrigger = () => {
    showPopupVariation();
  };

  const handleVisibilityChange = (isVisible) => {
    if (!isVisible) {
      showPopupVariation();
    }
  };

  const { ref } = usePageTriggers({
    onTimeTrigger: handleTimeTrigger,
    onInactivityTrigger: handleInactivityTrigger,
    onVisibilityChange: handleVisibilityChange,
  });

  useEffectOnce(() => {
    page({
      category: 'course_registration',
      name: 'course_search_scheduling',
      course_type: courseTypeFilter || COURSE_TYPES.SKY_BREATH_MEDITATION.code,
    });
    if (initialLocation && initialLocation.lat && !locationFilter) {
      setLocationFilter(initialLocation);
    }
  });

  useEffect(() => {
    if (selectedDates?.length) {
      if (workshops?.length > 0) {
        setWorkshops([]);
      }
      if (!showWorkshopSelectModal) {
        setShowWorkshopSelectModal(true);
      }
      getWorkshops();
    }
  }, [selectedDates]);

  useEffect(() => {
    if (router?.query?.timezone) {
      setTimezoneFilter(router.query.timezone);
    }
  }, [router.query]);

  const { data: attendeeRecord } = useQuery({
    queryKey: 'attendeeRecord',
    queryFn: async () => {
      const response = await api.get({
        path: 'getWorkshopByAttendee',
        param: {
          aid: attendeeId,
          skipcheck: '1',
        },
      });
      return response.data;
    },

    enabled: !!attendeeId,
  });

  useEffect(() => {
    if (attendeeRecord) {
      setMode(attendeeRecord.mode);
    }
  }, [attendeeRecord]);

  const { data: dateAvailable = [], isLoading } = useQuery({
    queryKey: [
      'workshopMonthCalendar',
      currentMonthYear,
      courseTypeFilter,
      timezoneFilter,
      mode,
      locationFilter || {},
    ],
    queryFn: async () => {
      let param = {
        ctype:
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
        month: currentMonthYear,
      };
      if (mode !== COURSE_MODES.IN_PERSON.value) {
        param = { ...param, timeZone: timezoneFilter };
      }
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
            lat: parseFloat(lat)?.toFixed(4),
            lng: parseFloat(lng)?.toFixed(4),
          };
        }
      }
      if (locationFilter?.lat || cityFilter) {
        const response = await api.get({
          path: 'workshopMonthCalendar',
          param,
        });
        const defaultDate =
          response.data.length > 0 ? response.data[0].allDates : [];
        if (fp?.current?.flatpickr && defaultDate.length > 0) {
          fp.current.flatpickr.jumpToDate(defaultDate[0], true);
        }
        return response.data;
      }
      return [];
    },
  });

  const { data: workshopMaster = {} } = useQuery({
    queryKey: ['workshopMaster', mode],
    queryFn: async () => {
      let ctypeId = null;
      if (mode === 'both' && findCourseTypeByKey(courseTypeFilter)?.subTypes) {
        ctypeId = findCourseTypeByKey(courseTypeFilter)?.subTypes['Online'];
      } else if (
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
  });

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
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

  function getGroupedUniqueEventIds(response) {
    const groupedEvents = response.data.reduce((acc, obj) => {
      let timings = obj.timings;
      timings = sortBy(timings, (obj) => new Date(obj.startDate));

      const modeKey = obj.mode || '';

      const timingKey = timings.reduce((acc1, obj) => {
        acc1 += '' + obj.startDate + '' + obj.startTime;
        return acc1;
      }, '');

      const groupKey = `${timingKey}-${modeKey}`;
      const existingEvent = acc[groupKey];

      if (
        !existingEvent ||
        (calculateTotalDistance(obj) < calculateTotalDistance(existingEvent) &&
          obj.mode === existingEvent.mode)
      ) {
        acc[groupKey] = obj;
      }

      return acc;
    }, {});

    const closestEventIds = Object.values(groupedEvents).map(
      (event) => event.id,
    );

    return closestEventIds;
  }

  const getWorkshops = async () => {
    setLoading(true);
    let param = {
      sdate: mode !== COURSE_MODES.IN_PERSON.value ? selectedDates?.[0] : null,
      timingsRequired: true,
      skipFullCourses: true,
      ctype:
        findCourseTypeByKey(courseTypeFilter)?.value ||
        COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
      random: true,
    };
    if (mode !== COURSE_MODES.IN_PERSON.value) {
      param = { ...param, timeZone: timezoneFilter };
    }
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
          lat: parseFloat(lat)?.toFixed(4),
          lng: parseFloat(lng)?.toFixed(4),
        };
      }
    }

    if (selectedDates?.length === 0) {
      setLoading(false);
      return [];
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
      setLoading(false);
      setWorkshops(finalWorkshops);
    }
  };

  const handleLocationFilterChange = (value) => {
    resetCalender();
    setCityFilter(null);
    if (value) {
      setLocationFilter(value);
    } else {
      handleModalToggle();
      setLocationFilter(null);
    }
  };

  const handleModalToggle = () => {
    setShowLocationModal(!showLocationModal);
  };

  const handleFlatpickrOnChange = (selectedDates, dateStr, instance) => {
    setActiveWorkshop({});
    setSelectedWorkshopId(null);
    let isEventAvailable = false;
    if (dateStr && dateStr !== '') {
      track('cmodal_date_pick');
    }

    if (selectedDates?.length > 0 && dateStr !== 'update') {
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

  const resetCalender = () => {
    setActiveWorkshop({});
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

  const handleSelectMode = (value) => {
    track('course_type_change');
    setMode(value);
    resetCalender();
  };

  let enableDates = dateAvailable.map((da) => {
    return da.firstDate;
  });

  enableDates = [...enableDates, ...(selectedDates || [])];

  const handelDayCreate = (dObj, dStr, fp, dayElem) => {
    const day = dayElem.innerHTML?.toString()?.padStart(2, '0');
    const parsedDate = `${moment(currentMonthYear, 'YYYY-MM')?.format('YYYY-MM')}-${day}`;

    dateAvailable.map((da) => {
      if (da?.firstDate === parsedDate) {
        if (da?.mode?.includes('Online') && da?.mode?.includes('In Person')) {
          dayElem?.classList?.add('online', 'in-person');
        } else if (da?.mode.includes('Online')) {
          dayElem.classList.add('online');
        } else if (da?.mode.includes('In Person')) {
          dayElem.classList.add('in-person');
        }
      }
    });
  };

  const handleWorkshopModalCalendarMonthChange = (backPressed = false) => {
    const parsedDate = moment(currentMonthYear, 'YYYY-M');
    const newMonthDate = backPressed
      ? parsedDate.subtract(1, 'month')
      : parsedDate.add(1, 'month');
    const formattedDate = newMonthDate.format('YYYY-M');
    setCurrentMonthYear(formattedDate);
    fp.current.flatpickr.changeMonth(backPressed ? -1 : 1);
  };

  const handleAutoScrollForMobile = () => {
    setTimeout(() => {
      const timeContainer = document.querySelector('.second-col');
      if (timeContainer) {
        timeContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
  };

  const handleNavigateToDetailsPage = (isOnlineCourse, workshopId) => {
    if (!isOnlineCourse) {
      replaceRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling/inPerson/${workshopId}`,
        query: {
          ...router.query,
          productTypeId: workshopMaster?.productTypeId,
          courseType: courseTypeFilter,
          ctype: workshopMaster?.productTypeId,
        },
      });
    } else {
      replaceRouteWithUTMQuery(router, {
        pathname: `/us-en/course/scheduling/online/${workshopId}`,
        query: {
          ...router.query,
          productTypeId: workshopMaster?.productTypeId,
          courseType: courseTypeFilter,
          ctype: workshopMaster?.productTypeId,
        },
      });
    }
  };

  const productTypeId = workshopMaster?.productTypeId;
  const slug = findSlugByProductTypeId(productTypeId);

  return (
    <>
      {(loading || isLoading) && <Loader />}
      <main ref={ref} className="scheduling-page calendar-online">
        <section className="scheduling-top">
          {(!attendeeId || activeWorkshop?.id) && (
            <div className="container">
              <h1 className="page-title">{workshopMaster?.title}</h1>
              <div
                className="page-description"
                dangerouslySetInnerHTML={{
                  __html: workshopMaster?.calenderViewDescription,
                }}
              ></div>
            </div>
          )}
          {attendeeId && !activeWorkshop?.id && (
            <div className="container">
              <h1 className="page-title">Thank you for your payment</h1>
              <div className="page-description">
                <b>Select a date</b> to register for the {workshopMaster?.title}{' '}
                course.
              </div>
            </div>
          )}
        </section>
        <section className="scheduling-stepper">
          <div className="container">
            <div className="step-wrapper">
              <div className="step active">
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Select the date</div>
              </div>
              <div className={selectedWorkshopId ? 'step active' : 'step'}>
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Select the course time</div>
              </div>
              <div className="step">
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Checkout</div>
              </div>
            </div>
          </div>
        </section>
        <section className="calendar-section">
          <div className="container">
            <div className="calendar-area-wrap">
              <div className="first-col">
                <div className="cal-filters">
                  {!attendeeId && (
                    <div className="form-item">
                      <label>Course type</label>
                      <select
                        className="input-select"
                        id="courseType"
                        name="courseType"
                        value={mode}
                        onChange={(ev) => handleSelectMode(ev.target.value)}
                      >
                        <option value="both">All courses</option>
                        <option value={COURSE_MODES.ONLINE.value}>
                          Online
                        </option>
                        <option value={COURSE_MODES.IN_PERSON.value}>
                          In-person
                        </option>
                      </select>
                    </div>
                  )}
                  <div className="form-item">
                    <ScheduleLocationFilterNew
                      handleLocationChange={handleLocationFilterChange}
                      value={locationFilter}
                      containerClass="location-container"
                      listClassName="result-list"
                    />
                  </div>
                </div>

                <div className="scheduling-modal__content-calendar">
                  <Flatpickr
                    ref={fp}
                    data-enable-time
                    onChange={handleFlatpickrOnChange}
                    value={selectedDates}
                    options={{
                      allowInput: false,
                      altInput: false,
                      inline: true,
                      mode: 'single',
                      enableTime: false,
                      monthSelectorType: 'static',
                      dateFormat: 'Y-m-d',
                      minDate: 'today',
                      enable: enableDates || [],
                    }}
                    onDayCreate={handelDayCreate}
                    onMonthChange={onMonthChangeAction}
                  />
                  <div className="event-type-pills">
                    <div className="online">
                      <span className="icon-aol iconaol-monitor-mobile"></span>
                      Online
                      <span className="icon-aol iconaol-info-circle"></span>
                      <div className="tooltip">
                        <h4>
                          <span className="icon-aol iconaol-monitor-mobile"></span>
                          Online
                        </h4>
                        <p>
                          Enjoy your experience from the comfort of your own
                          home (or anywhere quiet you choose). A more flexible
                          choice for busy folks!
                        </p>
                      </div>
                    </div>
                    <div className="inPerson">
                      <span className="icon-aol iconaol-profile-users"></span>
                      In-Person
                      <span className="icon-aol iconaol-info-circle"></span>
                      <div className="tooltip">
                        <h4>
                          <span className="icon-aol iconaol-profile-users"></span>
                          In-Person{' '}
                        </h4>
                        <p>
                          Within a relaxing venue, you’ll leave everyday
                          distractions and stresses behind, enabling an
                          immersive journey and connection to a like-minded
                          community in real life.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {!activeWorkshop?.id && (
                  <div className="specific-teacher-text">
                    Are you looking for a course with a specific teacher?{' '}
                    <a href={`/us-en/courses/${slug}`}>Click here</a>
                  </div>
                )}
                {!selectedWorkshopId && (
                  <div className="payment-box center-one">
                    <div className="payment-total-box">
                      <label>Total:</label>
                      <div className="amount">
                        $
                        {`${
                          activeWorkshop.unitPrice
                            ? activeWorkshop.unitPrice.toFixed(2) ||
                              '0'.toFixed(2)
                            : workshopMaster.unitPrice
                        }`}
                      </div>
                    </div>
                    <div className="payment-details">
                      <div className="payby">
                        Pay As Low As{' '}
                        <img src="/img/logo-affirm.webp" height="22" />
                      </div>
                      <div className="price-breakup">
                        <div className="price-per-month">
                          ${workshopMaster?.instalmentAmount}/<span>month</span>
                        </div>
                        <div className="payment-tenure">for 12 months</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="question-call">
                  <a href="tel:(855)2024400" className="call-cta">
                    Still have questions?{' '}
                    <strong>Call us at (855) 202-4400</strong>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="testimonials">
          <div className="container">
            <div className="top-text">TESTIMONIALS</div>
            <h2 className="section-title">What people are sharing</h2>
            <div className="testimonials-listing">
              <div className="testimonial-item">
                <div className="author-picutre">
                  <img
                    src="/img/testimony-adinah.webp"
                    alt="Adinah"
                    height="70"
                    width="70"
                  />
                </div>
                <div className="testimony-text">
                  “Wow. It made a significant impression on me, was very very
                  enjoyable, at times profound, and I plan to keep practicing.”
                </div>
                <div className="author-name">Adinah</div>
              </div>
              <div className="testimonial-item">
                <div className="author-picutre">
                  <img
                    src="/img/testimony-joanna.webp"
                    alt="Joanna"
                    height="70"
                    width="70"
                  />
                </div>
                <div className="testimony-text">
                  “It was awesome! I regained my mental health. And I also feel
                  so much lighter and happier. I got out of my funk that was
                  getting me unmotivated.”
                </div>
                <div className="author-name">Joanna</div>
              </div>
              <div className="testimonial-item">
                <div className="author-picutre">
                  <img
                    src="/img/testimony-vijitha.webp"
                    alt="Vijitha"
                    height="70"
                    width="70"
                  />
                </div>
                <div className="testimony-text">
                  “It was liberating. Any time my mind is wiggling between the
                  past and the future, I notice it and have found a hack to
                  bring myself back to the present.”
                </div>
                <div className="author-name">Vijitha</div>
              </div>
            </div>
          </div>
        </section>

        <WorkshopSelectModal
          setShowWorkshopSelectModal={setShowWorkshopSelectModal}
          setSelectedWorkshopId={setSelectedWorkshopId}
          setSelectedDates={setSelectedDates}
          setShowLocationModal={setShowLocationModal}
          dateAvailable={dateAvailable}
          selectedDates={selectedDates}
          showWorkshopSelectModal={showWorkshopSelectModal}
          workshops={workshops}
          handleWorkshopModalCalendarMonthChange={
            handleWorkshopModalCalendarMonthChange
          }
          setWorkshops={setWorkshops}
          currentMonthYear={currentMonthYear}
          loading={loading || isLoading}
          setActiveWorkshop={setActiveWorkshop}
          handleAutoScrollForMobile={handleAutoScrollForMobile}
          slug={slug}
          workshopMaster={workshopMaster}
          handleNavigateToDetailsPage={handleNavigateToDetailsPage}
        />

        <PopVariation2
          show={isPopupVariationVisible}
          closeAction={closePopupVariation(setPopupVariationVisible)}
          acceptAction={acceptPopupVariationOffer}
        ></PopVariation2>
      </main>
    </>
  );
};
Scheduling.hideFooter = true;
export default Scheduling;
