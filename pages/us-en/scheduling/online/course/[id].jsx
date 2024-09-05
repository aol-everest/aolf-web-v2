/* eslint-disable no-inline-styles/no-inline-styles */
import { useQueryState, parseAsString, parseAsJson } from 'nuqs';
import moment from 'moment';
import {
  api,
  findCourseTypeByKey,
  findSlugByProductTypeId,
  formatDateRange,
  tConvert,
} from '@utils';
import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import { ABBRS, COURSE_MODES, COURSE_TYPES, ALERT_TYPES } from '@constants';
import { useAnalytics } from 'use-analytics';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import 'flatpickr/dist/flatpickr.min.css';
import { replaceRouteWithUTMQuery } from '@service';
import { useGlobalAlertContext } from '@contexts';
import ErrorPage from 'next/error';
import { PageLoading } from '@components';
import Modal from 'react-bootstrap/Modal';
import { isEqual } from 'lodash';

const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

// eslint-disable-next-line react/display-name
const WorkshopSelectModal = React.memo(
  ({
    setShowWorkshopSelectModal,
    getWorkshopDetails,
    setSelectedWorkshopId,
    setSelectedDates,
    dateAvailable,
    selectedDates,
    showWorkshopSelectModal,
    workshops,
    handleWorkshopModalCalendarMonthChange,
    currentMonthYear,
    setWorkshops,
    loading,
    setActiveWorkshop,
    handleAutoScrollForMobile,
    slug,
  }) => {
    const { track } = useAnalytics();
    const [localSelectedWorkshop, setLocalSelectedWorkshop] = useState(null);
    const [backPressed, setBackPressed] = useState(false);

    useEffect(() => {
      if (workshops?.length === 1) {
        handleWorkshopSelect(workshops[0]);
      }
    }, [workshops]);

    const handleWorkshopSelect = async (workshop) => {
      setLocalSelectedWorkshop(workshop);
      track('cmodal_course_select');
    };

    const handleWorkshopSelectForCheckout = async () => {
      track('cmodal_course_continue');
      setShowWorkshopSelectModal((prevValue) => !prevValue);
      const workshopDetail = await getWorkshopDetails(
        localSelectedWorkshop?.id,
      );
      setSelectedWorkshopId(workshopDetail?.id);
      track('program_date_button', {
        program_id: localSelectedWorkshop?.id,
        program_name: workshopDetail?.title,
        program_date: workshopDetail?.eventStartDate,
        program_time: workshopDetail?.eventStartTime,
        category: 'All',
      });
      handleAutoScrollForMobile();
    };

    const handleModalToggle = () => {
      setSelectedDates([]);
      setActiveWorkshop({});
      setSelectedWorkshopId(null);
      setLocalSelectedWorkshop(null);
      setShowWorkshopSelectModal(false);
    };

    const getSelectedAvailabelDate = () => {
      const index = dateAvailable.findIndex((obj) => {
        return obj.allDates.every((date) => selectedDates?.includes(date));
      });
      return index;
    };

    const dateIndex = getSelectedAvailabelDate();
    const currentUserMonth = moment(new Date())?.format('M');
    const currentSelectedMonth = moment(currentMonthYear, 'YYYY-M')?.format(
      'M',
    );

    const handelGoBack = () => {
      const parsedDate = moment(
        dateAvailable[dateIndex - 1]?.firstDate,
        'YYYY-M',
      )?.format('YYYY-M');
      if (dateAvailable[dateIndex - 1]?.allDates) {
        setSelectedDates(dateAvailable[dateIndex - 1]?.allDates);
      } else {
        setSelectedDates([]);
        setLocalSelectedWorkshop(null);
        setWorkshops([]);
      }
      if (parsedDate !== currentMonthYear) {
        setBackPressed(true);
        handleWorkshopModalCalendarMonthChange(true);
      }
    };

    const handelGoForward = () => {
      if (dateAvailable[dateIndex + 1]) {
        const parsedDate = moment(
          dateAvailable[dateIndex + 1]?.firstDate,
          'YYYY-M',
        )?.format('YYYY-M');
        setSelectedDates(dateAvailable[dateIndex + 1]?.allDates);
        if (parsedDate !== currentMonthYear) {
          handleWorkshopModalCalendarMonthChange();
        }
      }
    };

    useEffect(() => {
      if (dateAvailable.length > 0 && showWorkshopSelectModal && backPressed) {
        // This logic is when we come back to previous month,
        //rather than showing the first workshop of the month
        // we are showing the workshop which is last in the month.
        let maxDateObject = null;
        let maxDate = null;
        const newMonthDate = moment(currentMonthYear, 'YYYY-M').format(
          'YYYY-MM',
        );
        dateAvailable.forEach((item) => {
          if (item.firstDate.startsWith(newMonthDate)) {
            const lastDate = item.allDates[item.allDates.length - 1];
            // Update the maxDateObject if the item's last date is greater than the current maxDate
            if (!maxDate || lastDate > maxDate) {
              maxDate = lastDate;
              maxDateObject = item;
            }
          }
        });
        setSelectedDates(maxDateObject?.allDates || []);
        setBackPressed(false);
      }
    }, [dateAvailable]);

    return (
      <Modal
        show={showWorkshopSelectModal}
        onHide={handleModalToggle}
        backdrop="static"
        className="available-time modal fade bd-example-modal-lg"
        dialogClassName="modal-dialog modal-dialog-centered modal-lg"
      >
        <Modal.Header closeButton>Available Times</Modal.Header>
        <Modal.Body>
          <div className="time-slot-changer">
            <button
              className="prev-slot"
              disabled={currentUserMonth === currentSelectedMonth}
              onClick={handelGoBack}
            >
              <img src="/img/chevron-left.svg" />
            </button>
            <div className="slot-info">
              {selectedDates?.length > 0 && formatDateRange(selectedDates)}
            </div>
            <button
              className="next-slot"
              disabled={!dateAvailable[dateIndex + 1]}
              onClick={handelGoForward}
            >
              <img src="/img/chevron-right.svg" />
            </button>
          </div>
          <div className="slot-listing">
            {workshops.length > 0
              ? workshops.map((workshop) => {
                  return (
                    <div
                      className="slot-item"
                      onClick={() => handleWorkshopSelect(workshop)}
                      key={workshop?.sfid}
                    >
                      <div className="slot-type">
                        <div className="slot-info">
                          {workshop?.mode === COURSE_MODES.ONLINE.value ? (
                            workshop.mode
                          ) : workshop.isLocationEmpty ? (
                            <>
                              {workshop?.city}, {workshop?.state}
                            </>
                          ) : (
                            `${
                              workshop.locationStreet
                                ? workshop.locationStreet + ','
                                : ''
                            } ${
                              workshop.locationCity
                                ? workshop.locationCity + ','
                                : ''
                            }
                              ${
                                workshop.locationProvince
                                  ? workshop.locationProvince + ','
                                  : ''
                              } ${workshop.locationCountry || ''}`
                          )}
                        </div>
                        <div className="slot-select form-item">
                          <input
                            type="radio"
                            value={localSelectedWorkshop?.id}
                            defaultChecked={
                              localSelectedWorkshop?.id === workshop.id
                            }
                            checked={localSelectedWorkshop?.id === workshop.id}
                          />
                        </div>
                      </div>
                      {workshop.timings.map((timing, index) => {
                        return (
                          <div className="slot-timing" key={index}>
                            <div className="slot-date">
                              <svg
                                className="detailsIcon icon-calendar"
                                viewBox="0 0 34 32"
                              >
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M10.889 2.667v4"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M21.555 2.667v4"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M4.889 12.12h22.667"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="10"
                                  strokeWidth="2.4"
                                  d="M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667h-10.667c-4.667 0-6.667-2.667-6.667-6.667v-11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M21.148 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M21.148 22.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M16.216 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M16.216 22.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M11.281 18.267h0.012"
                                ></path>
                                <path
                                  fill="none"
                                  stroke="#3d8be8"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  strokeMiterlimit="4"
                                  strokeWidth="3.2"
                                  d="M11.281 22.267h0.012"
                                ></path>
                              </svg>
                              {dayjs.utc(timing.startDate).format('M/DD, ddd')}
                            </div>

                            <div className="slot-time">
                              {tConvert(timing.startTime)}-
                              {tConvert(timing.endTime)}{' '}
                              {ABBRS[timing.timeZone]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              : !loading && (
                  <div className="specific-teacher-text">
                    No Workshops available
                  </div>
                )}
          </div>

          <div className="slot-action">
            <button
              type="button"
              disabled={!localSelectedWorkshop}
              className="btn btn-primary find-courses submit-btn"
              onClick={handleWorkshopSelectForCheckout}
            >
              Continue
            </button>
          </div>
        </Modal.Body>
      </Modal>
    );
  },
);

const Scheduling = () => {
  const fp = useRef(null);
  const { track, page } = useAnalytics();
  const { showAlert } = useGlobalAlertContext();
  const router = useRouter();
  const [showWorkshopSelectModal, setShowWorkshopSelectModal] = useState(false);
  const { id: attendeeId } = router.query;
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useQueryState(
    'selectedDate',
    parseAsJson([]),
  );
  const [workshops, setWorkshops] = useState([]);
  const [timezoneFilter, setTimezoneFilter] = useQueryState('timezone');
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
  const [enableDates, setEnableDates] = useState([]);

  const {
    phone1,
    eventEndDate,
    eventStartDate,
    primaryTeacherName,
    coTeacher1Name,
    coTeacher2Name,
    phone2,
    timings = [],
    email: contactEmail,
    isLocationEmpty,
    city,
    state,
    locationStreet,
    locationCity,
    locationProvince,
    locationPostalCode,
    locationCountry,
    streetAddress1,
    streetAddress2,
    zip,
    country,
    contactName,
  } = activeWorkshop;

  const getWorkshops = async () => {
    setLoading(true);
    let param = {
      sdate: selectedDates?.[0],
      timingsRequired: true,
      skipFullCourses: true,
      ctype:
        findCourseTypeByKey(courseTypeFilter)?.value ||
        COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
      random: true,
      mode: 'Online',
      timeZone: timezoneFilter,
    };

    if (selectedDates?.length === 0) {
      setLoading(false);
      return [];
    }
    const response = await api.get({
      path: 'workshops',
      param,
    });
    if (response?.data && selectedDates?.length > 0) {
      // const selectedSfids = getGroupedUniqueEventIds(response);
      const finalWorkshops = response?.data;

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
          courseTypeFilter || COURSE_TYPES.SKY_BREATH_MEDITATION.code,
        location_type: 'Online',
        num_results: response?.data.length,
      });
      setLoading(false);
      setWorkshops(finalWorkshops);
    }
  };

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

  const {
    data: attendeeRecord,
    isLoading: initLoading,
    isError,
    error,
  } = useQuery({
    queryKey: 'attendeeRecord',
    queryFn: async () => {
      const response = await api.get({
        path: 'getWorkshopByAttendee',
        param: {
          aid: attendeeId,
          skipcheck: '1',
        },
      });
      return response;
    },

    enabled: !!attendeeId,
  });
  const { data: dateAvailable = [], isLoading } = useQuery({
    queryKey: [
      'workshopMonthCalendar',
      currentMonthYear,
      courseTypeFilter,
      timezoneFilter,
    ],
    queryFn: async () => {
      let param = {
        ctype:
          findCourseTypeByKey(courseTypeFilter)?.value ||
          COURSE_TYPES.SKY_BREATH_MEDITATION?.value,
        month: currentMonthYear,
        mode: 'Online',
        timeZone: timezoneFilter,
      };

      const response = await api.get({
        path: 'workshopMonthCalendar',
        param,
      });

      return response.data;
    },
  });

  useEffect(() => {
    let _enableDates = dateAvailable.map((da) => {
      return da.firstDate;
    });
    _enableDates = [..._enableDates, ...(selectedDates || [])];
    if (!isEqual(_enableDates, enableDates)) {
      setTimeout(() => {
        const defaultDate =
          dateAvailable.length > 0 ? dateAvailable[0].allDates : [];
        if (fp?.current?.flatpickr && defaultDate.length > 0) {
          fp.current.flatpickr.jumpToDate(defaultDate[0], true);
        }
      }, 200);

      setEnableDates(_enableDates);
    }
  }, [dateAvailable, selectedDates]);

  if (isError) return <ErrorPage statusCode={500} title={error.message} />;
  if (initLoading || !attendeeId) return <PageLoading />;

  const { mode, productTypeId, title } = attendeeRecord.data;

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
    return response?.data;
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

  const handleTransferWorkshopRequest = async () => {
    //token.saveCardForFuture = true;
    if (loading) {
      return null;
    }
    setLoading(true);
    try {
      const {
        status,
        data,
        error: errorMessage,
        isError,
      } = await api.post({
        path: 'transferWorkshopAttendee',
        body: { attendeeRecordId: attendeeId, productSfId: activeWorkshop?.id },
      });
      if (status === 400 || isError) {
        throw new Error(errorMessage);
      }
      setLoading(false);
      replaceRouteWithUTMQuery(router, {
        pathname: `/us-en/course/thankyou/${attendeeId}`,
        query: {
          ctype: activeWorkshop.productTypeId,
          page: 'ty',
          referral: 'course_scheduling_checkout',
        },
      });
    } catch (ex) {
      console.error(ex);
      const data = ex.response?.data;
      const { message, statusCode } = data || {};
      setLoading(false);
      showAlert(ALERT_TYPES.ERROR_ALERT, {
        children: message ? `Error: ${message} (${statusCode})` : ex.message,
      });
    }
  };

  const slug = findSlugByProductTypeId(productTypeId);

  return (
    <>
      {(loading || isLoading) && <div className="cover-spin"></div>}
      <main className="scheduling-page calendar-online">
        <section className="scheduling-top">
          <div className="container">
            <h1 className="page-title">Thank you for your payment</h1>
            <div className="page-description">
              <b>Select a date</b> to register for the {title} course.
            </div>
          </div>
        </section>
        <section className="scheduling-stepper">
          <div className="container">
            <div className="step-wrapper">
              <div className="step active">
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Complete Your Purchase</div>
              </div>
              <div className="step active">
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Select Course Date & Time</div>
              </div>
              <div className="step">
                <div className="step-icon">
                  <span></span>
                </div>
                <div className="step-text">Start Your Course</div>
              </div>
            </div>
          </div>
        </section>
        <section className="calendar-section">
          <div className="container">
            <div className="calendar-area-wrap">
              <div className="first-col">
                <div className="cal-filters"></div>

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
                      enable: enableDates,
                    }}
                    onMonthChange={onMonthChangeAction}
                  />
                </div>
                <div className="other-calendar-info">
                  <span className="icon-aol iconaol-clock-bold"></span>Flexible
                  Rescheduling for All Courses
                </div>
                <div className="question-call">
                  <a href="tel:(855)2024400" className="call-cta">
                    Still have questions?{' '}
                    <strong>Call us at (855) 202-4400</strong>
                  </a>
                </div>
              </div>
              <div className={activeWorkshop?.id ? 'second-col' : 'hide-col'}>
                <div className="payment-box">
                  {!attendeeId && (
                    <>
                      <div className="payment-total-box">
                        <label>Total:</label>
                        <div className="amount">
                          $
                          {`${
                            activeWorkshop.unitPrice
                              ? activeWorkshop.unitPrice.toFixed(2) ||
                                '0'.toFixed(2)
                              : 0
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
                            ${activeWorkshop?.instalmentAmount}/
                            <span>month</span>
                          </div>
                          <div className="payment-tenure">for 12 months</div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="checkout-details !tw-border-0">
                    <div className="section__body">
                      <svg
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          width: 0,
                          height: 0,
                          overflow: 'hidden',
                        }}
                      >
                        <defs>
                          <symbol id="icon-calendar" viewBox="0 0 34 32">
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit={10}
                              strokeWidth={2.4}
                              d="M10.889 2.667v4M21.555 2.667v4M4.889 12.12h22.667M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667H10.888c-4.667 0-6.667-2.667-6.667-6.667V11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                            />
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth={3.2}
                              d="M21.148 18.267h.012M21.148 22.267h.012M16.216 18.267h.012M16.216 22.267h.012M11.281 18.267h.012M11.281 22.267h.012"
                            />
                          </symbol>
                          <symbol id="icon-call" viewBox="0 0 34 32">
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeMiterlimit={10}
                              strokeWidth={2.4}
                              d="M29.516 24.44c0 .48-.107.973-.333 1.453s-.52.933-.907 1.36c-.653.72-1.373 1.24-2.187 1.573-.8.333-1.667.507-2.6.507-1.36 0-2.813-.32-4.347-.973s-3.067-1.533-4.587-2.64a38.332 38.332 0 01-4.373-3.733 37.98 37.98 0 01-3.72-4.36c-1.093-1.52-1.973-3.04-2.613-4.547-.64-1.52-.96-2.973-.96-4.36 0-.907.16-1.773.48-2.573.32-.813.827-1.56 1.533-2.227.853-.84 1.787-1.253 2.773-1.253.373 0 .747.08 1.08.24.347.16.653.4.893.747l3.093 4.36c.24.333.413.64.533.933.12.28.187.56.187.813 0 .32-.093.64-.28.947a4.52 4.52 0 01-.747.947l-1.013 1.053a.712.712 0 00-.213.533c0 .107.013.2.04.307.04.107.08.187.107.267.24.44.653 1.013 1.24 1.707.6.693 1.24 1.4 1.933 2.107.72.707 1.413 1.36 2.12 1.96.693.587 1.267.987 1.72 1.227.067.027.147.067.24.107a.92.92 0 00.333.053c.227 0 .4-.08.547-.227l1.013-1c.333-.333.653-.587.96-.747.307-.187.613-.28.947-.28.253 0 .52.053.813.173s.6.293.933.52l4.413 3.133c.347.24.587.52.733.853.133.333.213.667.213 1.04z"
                            />
                          </symbol>
                          <symbol id="icon-clock" viewBox="0 0 34 32">
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth={2.4}
                              d="M29.556 16c0 7.36-5.973 13.333-13.333 13.333S2.89 23.36 2.89 16 8.863 2.667 16.223 2.667 29.556 8.64 29.556 16z"
                            />
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth={2.4}
                              d="M21.168 20.24l-4.133-2.467c-.72-.427-1.307-1.453-1.307-2.293v-5.467"
                            />
                          </symbol>
                          <symbol id="icon-location" viewBox="0 0 34 32">
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeWidth={2.4}
                              d="M16.223 17.907a4.16 4.16 0 10-.001-8.321 4.16 4.16 0 00.001 8.321z"
                            />
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeWidth={2.4}
                              d="M5.049 11.32C7.676-.227 24.782-.213 27.396 11.333c1.533 6.773-2.68 12.507-6.373 16.053a6.924 6.924 0 01-9.613 0c-3.68-3.547-7.893-9.293-6.36-16.067z"
                            />
                          </symbol>
                          <symbol id="icon-profile" viewBox="0 0 34 32">
                            <path
                              fill="none"
                              stroke="var(--color1, #9598a6)"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth={2.4}
                              d="M16.435 14.493a2.486 2.486 0 00-.44 0 5.894 5.894 0 01-5.693-5.907c0-3.267 2.64-5.92 5.92-5.92a5.923 5.923 0 015.92 5.92c-.013 3.2-2.533 5.8-5.707 5.907zM9.768 19.413c-3.227 2.16-3.227 5.68 0 7.827 3.667 2.453 9.68 2.453 13.347 0 3.227-2.16 3.227-5.68 0-7.827-3.653-2.44-9.667-2.44-13.347 0z"
                            />
                          </symbol>
                        </defs>
                      </svg>
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M29.556 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333c0-7.36 5.973-13.333 13.333-13.333s13.333 5.973 13.333 13.333z"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M21.168 20.24l-4.133-2.467c-0.72-0.427-1.307-1.453-1.307-2.293v-5.467"
                            ></path>
                          </svg>{' '}
                          Date:
                        </div>
                        <div className="value col-7">
                          {dayjs
                            .utc(eventStartDate)
                            .isSame(dayjs.utc(eventEndDate), 'month') &&
                            `${dayjs
                              .utc(eventStartDate)
                              .format('MMMM DD')}-${dayjs
                              .utc(eventEndDate)
                              .format('DD, YYYY')}`}

                          {!dayjs
                            .utc(eventStartDate)
                            .isSame(dayjs.utc(eventEndDate), 'month') &&
                            `${dayjs
                              .utc(eventStartDate)
                              .format('MMM DD')}-${dayjs
                              .utc(eventEndDate)
                              .format('MMM DD, YYYY')}`}
                        </div>
                      </div>
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="2.4"
                              d="M10.889 2.667v4"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="2.4"
                              d="M21.555 2.667v4"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="2.4"
                              d="M4.889 12.12h22.667"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="10"
                              strokeWidth="2.4"
                              d="M28.222 11.333v11.333c0 4-2 6.667-6.667 6.667h-10.667c-4.667 0-6.667-2.667-6.667-6.667v-11.333c0-4 2-6.667 6.667-6.667h10.667c4.667 0 6.667 2.667 6.667 6.667z"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M21.148 18.267h0.012"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M21.148 22.267h0.012"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M16.216 18.267h0.012"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M16.216 22.267h0.012"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M11.281 18.267h0.012"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="3.2"
                              d="M11.281 22.267h0.012"
                            ></path>
                          </svg>{' '}
                          Timing:
                        </div>
                        <div className="value col-7">
                          {timings &&
                            timings.map((time) => {
                              return (
                                <div key={time.startDate}>
                                  {dayjs.utc(time.startDate).format('dd')}:{' '}
                                  {tConvert(time.startTime)}-
                                  {tConvert(time.endTime)}{' '}
                                  {ABBRS[time.timeZone]}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M16.435 14.493c-0.133-0.013-0.293-0.013-0.44 0-3.173-0.107-5.693-2.707-5.693-5.907 0-3.267 2.64-5.92 5.92-5.92 3.267 0 5.92 2.653 5.92 5.92-0.013 3.2-2.533 5.8-5.707 5.907z"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M9.768 19.413c-3.227 2.16-3.227 5.68 0 7.827 3.667 2.453 9.68 2.453 13.347 0 3.227-2.16 3.227-5.68 0-7.827-3.653-2.44-9.667-2.44-13.347 0z"
                            ></path>
                          </svg>{' '}
                          Instructor(s):
                        </div>
                        <div className="value col-7">
                          {primaryTeacherName && primaryTeacherName}
                          <br />
                          {coTeacher1Name && coTeacher1Name}
                          <br />
                          {coTeacher2Name && coTeacher2Name}
                        </div>
                      </div>
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="miter"
                              strokeLinecap="butt"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M16.223 17.907c2.297 0 4.16-1.863 4.16-4.16s-1.863-4.16-4.16-4.16c-2.298 0-4.16 1.863-4.16 4.16s1.863 4.16 4.16 4.16z"
                            ></path>
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="miter"
                              strokeLinecap="butt"
                              strokeMiterlimit="4"
                              strokeWidth="2.4"
                              d="M5.049 11.32c2.627-11.547 19.733-11.533 22.347 0.013 1.533 6.773-2.68 12.507-6.373 16.053-2.68 2.587-6.92 2.587-9.613 0-3.68-3.547-7.893-9.293-6.36-16.067z"
                            ></path>
                          </svg>{' '}
                          Location:
                        </div>
                        <div className="value col-7">
                          {activeWorkshop?.mode === COURSE_MODES.ONLINE.value
                            ? activeWorkshop?.mode
                            : activeWorkshop && (
                                <>
                                  {!isLocationEmpty && (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${
                                        locationStreet || ''
                                      }, ${locationCity} ${locationProvince} ${locationPostalCode} ${locationCountry}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {locationStreet && locationStreet}
                                      {locationCity || ''}
                                      {', '}
                                      {locationProvince || ''}{' '}
                                      {locationPostalCode || ''}
                                    </a>
                                  )}
                                  {isLocationEmpty && (
                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${
                                        streetAddress1 || ''
                                      },${
                                        streetAddress2 || ''
                                      } ${city} ${state} ${zip} ${country}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {streetAddress1 && streetAddress1}
                                      {streetAddress2 && streetAddress2}
                                      {city || ''}
                                      {', '}
                                      {state || ''} {zip || ''}
                                    </a>
                                  )}
                                </>
                              )}
                        </div>
                      </div>
                      <div className="detail-item row">
                        <div className="label col-5">
                          <svg
                            className="detailsIcon icon-calendar"
                            viewBox="0 0 34 32"
                          >
                            <path
                              fill="none"
                              stroke="#9598a6"
                              strokeLinejoin="miter"
                              strokeLinecap="butt"
                              strokeMiterlimit="10"
                              strokeWidth="2.4"
                              d="M29.516 24.44c0 0.48-0.107 0.973-0.333 1.453s-0.52 0.933-0.907 1.36c-0.653 0.72-1.373 1.24-2.187 1.573-0.8 0.333-1.667 0.507-2.6 0.507-1.36 0-2.813-0.32-4.347-0.973s-3.067-1.533-4.587-2.64c-1.533-1.12-2.987-2.36-4.373-3.733-1.373-1.387-2.613-2.84-3.72-4.36-1.093-1.52-1.973-3.040-2.613-4.547-0.64-1.52-0.96-2.973-0.96-4.36 0-0.907 0.16-1.773 0.48-2.573 0.32-0.813 0.827-1.56 1.533-2.227 0.853-0.84 1.787-1.253 2.773-1.253 0.373 0 0.747 0.080 1.080 0.24 0.347 0.16 0.653 0.4 0.893 0.747l3.093 4.36c0.24 0.333 0.413 0.64 0.533 0.933 0.12 0.28 0.187 0.56 0.187 0.813 0 0.32-0.093 0.64-0.28 0.947-0.173 0.307-0.427 0.627-0.747 0.947l-1.013 1.053c-0.147 0.147-0.213 0.32-0.213 0.533 0 0.107 0.013 0.2 0.040 0.307 0.040 0.107 0.080 0.187 0.107 0.267 0.24 0.44 0.653 1.013 1.24 1.707 0.6 0.693 1.24 1.4 1.933 2.107 0.72 0.707 1.413 1.36 2.12 1.96 0.693 0.587 1.267 0.987 1.72 1.227 0.067 0.027 0.147 0.067 0.24 0.107 0.107 0.040 0.213 0.053 0.333 0.053 0.227 0 0.4-0.080 0.547-0.227l1.013-1c0.333-0.333 0.653-0.587 0.96-0.747 0.307-0.187 0.613-0.28 0.947-0.28 0.253 0 0.52 0.053 0.813 0.173s0.6 0.293 0.933 0.52l4.413 3.133c0.347 0.24 0.587 0.52 0.733 0.853 0.133 0.333 0.213 0.667 0.213 1.040z"
                            ></path>
                          </svg>{' '}
                          Contact details:
                        </div>
                        <div className="value col-7">
                          <span>{contactName}</span>
                          <br />
                          <a href={`tel:${phone1}`}>{phone1}</a>
                          <br />
                          {phone2 && <a href={`tel:${phone2}`}>{phone2}</a>}
                          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="payment-actions">
                    <button
                      className="submit-btn"
                      disabled={!selectedWorkshopId}
                      onClick={handleTransferWorkshopRequest}
                    >
                      Continue
                    </button>
                  </div>
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
          getWorkshopDetails={getWorkshopDetails}
          setSelectedWorkshopId={setSelectedWorkshopId}
          setSelectedDates={setSelectedDates}
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
        />
      </main>
    </>
  );
};
Scheduling.hideFooter = true;
export default Scheduling;
