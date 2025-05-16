/* eslint-disable react/display-name */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import { formatDateRange, tConvert } from '@utils';
import dayjs from 'dayjs';
import { ABBRS, COURSE_MODES } from '@constants';
import { useAnalytics } from 'use-analytics';
import moment from 'moment';
import styles from './ScheduleWorkshopModal.module.scss';
var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const WorkshopSelectModal = React.memo(
  ({
    setShowWorkshopSelectModal,
    setSelectedWorkshopId,
    setSelectedDates,
    setShowLocationModal,
    dateAvailable,
    selectedDates,
    showWorkshopSelectModal,
    workshops,
    handleWorkshopModalCalendarMonthChange,
    currentMonthYear,
    loading,
    setActiveWorkshop,
    handleAutoScrollForMobile,
    workshopMaster,
    handleNavigateToDetailsPage,
    resetCalender,
  }) => {
    const { track } = useAnalytics();
    const [selection, setSelection] = useState({
      workshop: null,
      isOnlineCourse: null,
      backPressed: false,
    });

    // Define handleWorkshopSelect first
    const handleWorkshopSelect = useCallback(
      (workshop, isOnlineCourse) => {
        setSelection((prev) => ({
          ...prev,
          workshop,
          isOnlineCourse,
        }));
        track('cmodal_course_select');
      },
      [track],
    );

    // Memoize date-related computations
    const dateInfo = useMemo(() => {
      const getSelectedAvailabelDate = () => {
        return dateAvailable.findIndex((obj) => {
          return obj.allDates.every((date) => selectedDates?.includes(date));
        });
      };

      const dateIndex = getSelectedAvailabelDate();
      const currentUserMonth = parseInt(moment(new Date())?.format('M'), 10);
      const currentSelectedMonth = parseInt(
        moment(currentMonthYear, 'YYYY-M')?.format('M'),
        10,
      );

      return {
        dateIndex,
        currentUserMonth,
        currentSelectedMonth,
        hasNextDate: !!dateAvailable[dateIndex + 1],
      };
    }, [dateAvailable, selectedDates, currentMonthYear]);

    // Auto-select single workshop
    useEffect(() => {
      if (workshops?.length === 1) {
        const isOnlineCourse = workshops[0]?.mode === COURSE_MODES.ONLINE.value;
        handleWorkshopSelect(workshops[0], isOnlineCourse);
      }
    }, [workshops, handleWorkshopSelect]);

    // Add effect to handle modal visibility when workshops change
    useEffect(() => {
      if (workshops?.length > 0 && showWorkshopSelectModal) {
        setShowWorkshopSelectModal(true);
      }
    }, [workshops, showWorkshopSelectModal, setShowWorkshopSelectModal]);

    // Handle back navigation effect
    useEffect(() => {
      if (
        dateAvailable.length > 0 &&
        showWorkshopSelectModal &&
        selection.backPressed
      ) {
        let maxDateObject = null;
        let maxDate = null;
        const newMonthDate = moment(currentMonthYear, 'YYYY-M').format(
          'YYYY-MM',
        );

        dateAvailable.forEach((item) => {
          if (item.firstDate.startsWith(newMonthDate)) {
            const lastDate = item.allDates[item.allDates.length - 1];
            if (!maxDate || lastDate > maxDate) {
              maxDate = lastDate;
              maxDateObject = item;
            }
          }
        });

        setSelectedDates(maxDateObject?.allDates || []);
        setSelection((prev) => ({ ...prev, backPressed: false }));
      }
    }, [
      dateAvailable,
      showWorkshopSelectModal,
      currentMonthYear,
      setSelectedDates,
    ]);

    const handleWorkshopSelectForCheckout = useCallback(() => {
      track('cmodal_course_continue');
      track(
        'view_item',
        {
          ecommerce: {
            currency: 'USD',
            value: workshopMaster?.unitPrice,
            course_format: workshopMaster?.productTypeId,
            course_name: workshopMaster?.title,
            items: [
              {
                item_id: 'NA',
                item_name: workshopMaster?.title,
                affiliation: 'NA',
                coupon: '',
                discount: 0.0,
                index: 0,
                item_brand: workshopMaster?.orgnization,
                item_category: workshopMaster?.title,
                item_category2: workshopMaster?.mode,
                item_category3: 'paid',
                item_category4: 'NA',
                item_category5: 'NA',
                item_list_id: workshopMaster?.productTypeId,
                item_list_name: workshopMaster?.title,
                item_variant: 'NA',
                location_id: 'NA',
                price: workshopMaster?.unitPrice,
                quantity: 1,
              },
            ],
          },
        },
        {
          plugins: {
            all: false,
            'gtm-ecommerce-plugin': true,
          },
        },
      );

      setShowWorkshopSelectModal(false);
      handleAutoScrollForMobile();
      setSelectedWorkshopId(selection.workshop?.id);
      handleNavigateToDetailsPage(
        selection.isOnlineCourse,
        selection.workshop?.id,
      );
    }, [
      track,
      workshopMaster,
      selection,
      setShowWorkshopSelectModal,
      handleAutoScrollForMobile,
      setSelectedWorkshopId,
      handleNavigateToDetailsPage,
    ]);

    const handleModalToggle = useCallback(() => {
      setSelectedDates([]);
      setActiveWorkshop({});
      resetCalender();
      setSelectedWorkshopId(null);
      setSelection({
        workshop: null,
        isOnlineCourse: null,
        backPressed: false,
      });
      setShowWorkshopSelectModal(false);
      setShowLocationModal(false);
    }, [
      setSelectedDates,
      setActiveWorkshop,
      setSelectedWorkshopId,
      setShowWorkshopSelectModal,
      setShowLocationModal,
    ]);

    const handleGoBack = useCallback(() => {
      const targetDate = moment(selectedDates[0]);
      const currentDate = moment();
      const targetYear = parseInt(targetDate.format('YYYY'), 10);
      const currentYear = parseInt(currentDate.format('YYYY'), 10);
      const targetMonth = parseInt(targetDate.format('M'), 10);
      const currentMonth = parseInt(currentDate.format('M'), 10);

      if (dateAvailable[dateInfo.dateIndex - 1]?.allDates) {
        setSelectedDates(dateAvailable[dateInfo.dateIndex - 1]?.allDates);
      } else if (
        currentYear < targetYear ||
        (currentYear === targetYear && currentMonth < targetMonth)
      ) {
        setSelection((prev) => ({ ...prev, backPressed: true }));
        handleWorkshopModalCalendarMonthChange(true);
      }
    }, [
      selectedDates,
      dateInfo.dateIndex,
      dateAvailable,
      handleWorkshopModalCalendarMonthChange,
      setSelectedDates,
    ]);

    const handleGoForward = useCallback(() => {
      if (dateAvailable[dateInfo.dateIndex + 1]) {
        const nextDates = dateAvailable[dateInfo.dateIndex + 1];
        const nextFirstDate = nextDates.firstDate;

        // Change month first if needed
        const nextMonth = moment(nextFirstDate).format('YYYY-M');
        if (nextMonth !== currentMonthYear) {
          handleWorkshopModalCalendarMonthChange(false, nextFirstDate);
        }

        // Then set the selected dates
        setSelectedDates(nextDates.allDates);
      }
    }, [
      dateInfo.dateIndex,
      dateAvailable,
      currentMonthYear,
      handleWorkshopModalCalendarMonthChange,
      setSelectedDates,
    ]);

    // Memoize workshop list rendering
    const workshopList = useMemo(() => {
      return workshops.map((workshop) => {
        const isOnlineCourse = workshop?.mode === COURSE_MODES.ONLINE.value;
        return (
          <div
            className={styles.slotItem}
            onClick={() => handleWorkshopSelect(workshop, isOnlineCourse)}
            key={workshop?.sfid}
          >
            <div className={styles.slotType}>
              <div className={styles.slotInfo}>
                {isOnlineCourse ? (
                  <span className="icon-aol iconaol-monitor-mobile"></span>
                ) : (
                  <span className="icon-aol iconaol-profile-users"></span>
                )}
                {isOnlineCourse ? (
                  workshop.mode
                ) : workshop.isLocationEmpty ? (
                  <>
                    {workshop?.city}, {workshop?.state}
                  </>
                ) : (
                  `${workshop.locationStreet ? workshop.locationStreet + ',' : ''}
                   ${workshop.locationCity ? workshop.locationCity + ',' : ''}
                   ${workshop.locationProvince ? workshop.locationProvince + ',' : ''}`
                )}
              </div>
              <div className={styles.slotSelect}>
                <input
                  type="radio"
                  value={selection.workshop?.id}
                  defaultChecked={selection.workshop?.id === workshop.id}
                  checked={selection.workshop?.id === workshop.id}
                />
              </div>
            </div>
            <div className={styles.slotPrice}>
              <div className={styles.priceTotal}>
                Total: $
                {`${
                  workshop.unitPrice
                    ? workshop.unitPrice.toFixed(2) || '0'.toFixed(2)
                    : workshopMaster.unitPrice
                }`}
              </div>
              <div className={styles.pricePm}>
                <div>
                  ${workshop?.instalmentAmount}/
                  <span className={styles.month}>month</span>
                </div>
                <div className={styles.forMonths}>for 12 months</div>
              </div>
            </div>
            {workshop.timings.map((timing, index) => {
              return (
                <div className={styles.slotTiming} key={index}>
                  <div className={styles.slotDate}>
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

                  <div className={styles.slotTime}>
                    {tConvert(timing.startTime)}-{tConvert(timing.endTime)}{' '}
                    {ABBRS[timing.timeZone]}
                  </div>
                </div>
              );
            })}
          </div>
        );
      });
    }, [workshops, handleWorkshopSelect]);

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
            <button className="prev-slot" onClick={handleGoBack}>
              <img src="/img/chevron-left.svg" alt="Previous" />
            </button>
            <div className="slot-info">
              {selectedDates?.length > 0 && formatDateRange(selectedDates)}
            </div>
            <button
              className="next-slot"
              disabled={!dateInfo.hasNextDate}
              onClick={handleGoForward}
            >
              <img src="/img/chevron-right.svg" alt="Next" />
            </button>
          </div>
          {loading ? (
            <div className={styles.modalMessageContainer}>
              <div className={styles.loaderSpinner}></div>
              <p>Loading available workshops...</p>
            </div>
          ) : workshops.length > 0 ? (
            <>
              <div className="slot-listing">
                {workshops.map((workshop) => {
                  const isOnlineCourse =
                    workshop?.mode === COURSE_MODES.ONLINE.value;
                  return (
                    <div
                      className="slot-item"
                      onClick={() =>
                        handleWorkshopSelect(workshop, isOnlineCourse)
                      }
                      key={workshop?.sfid}
                    >
                      <div className="slot-type">
                        <div className="slot-info">
                          {isOnlineCourse ? (
                            <span className="icon-aol iconaol-monitor-mobile"></span>
                          ) : (
                            <span className="icon-aol iconaol-profile-users"></span>
                          )}
                          {isOnlineCourse ? (
                            workshop.mode
                          ) : workshop.isLocationEmpty ? (
                            <>
                              {workshop?.city}, {workshop?.state}
                            </>
                          ) : (
                            `${workshop.locationStreet ? workshop.locationStreet + ',' : ''}
                             ${workshop.locationCity ? workshop.locationCity + ',' : ''}
                             ${workshop.locationProvince ? workshop.locationProvince + ',' : ''}`
                          )}
                        </div>
                        <div className="slot-select form-item">
                          <input
                            type="radio"
                            value={selection.workshop?.id}
                            defaultChecked={
                              selection.workshop?.id === workshop.id
                            }
                            checked={selection.workshop?.id === workshop.id}
                          />
                        </div>
                      </div>
                      <div className="slot-price">
                        <div className="price-total">
                          Total: $
                          {`${
                            workshop.unitPrice
                              ? workshop.unitPrice.toFixed(2) || '0'.toFixed(2)
                              : workshopMaster.unitPrice
                          }`}
                        </div>
                        <div className="price-pm">
                          <div>
                            ${workshop?.instalmentAmount}/
                            <span className="month">month</span>
                          </div>
                          <div className="for-months">for 12 months</div>
                        </div>
                      </div>
                      {workshop.timings.map((timing, index) => (
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
                            {tConvert(timing.endTime)} {ABBRS[timing.timeZone]}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
              <div className="slot-action">
                <button
                  type="button"
                  disabled={!selection.workshop}
                  className="btn btn-primary find-courses submit-btn"
                  onClick={handleWorkshopSelectForCheckout}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <div className={styles.modalMessageContainer}>
              <p>No workshops available for the selected dates.</p>
            </div>
          )}
          <div className="additionalInfo">
            <span className="icon-aol iconaol-info-circle"></span>
            Flexible rescheduling at no additional cost
          </div>
        </Modal.Body>
      </Modal>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.showWorkshopSelectModal === nextProps.showWorkshopSelectModal &&
      prevProps.selectedDates === nextProps.selectedDates &&
      prevProps.workshops === nextProps.workshops &&
      prevProps.currentMonthYear === nextProps.currentMonthYear &&
      prevProps.loading === nextProps.loading
    );
  },
);

export default WorkshopSelectModal;
