/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { formatDateRange, tConvert } from '@utils';
import dayjs from 'dayjs';
import { ABBRS, COURSE_MODES } from '@constants';
import { useAnalytics } from 'use-analytics';
import moment from 'moment';
var advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const WorkshopSelectModal = React.memo(
  ({
    setShowWorkshopSelectModal,
    getWorkshopDetails,
    setSelectedWorkshopId,
    setSelectedDates,
    setShowLocationModal,
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
    workshopMaster,
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
      setShowLocationModal(false);
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
                            <span className="icon-aol iconaol-monitor-mobile"></span>
                          ) : (
                            <span className="icon-aol iconaol-profile-users"></span>
                          )}
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
          {/*<div className="event-type-pills">
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
                  Enjoy your experience from the comfort of your own home (or
                  anywhere quiet you choose). A more flexible choice for busy
                  folks!
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
                  Within a relaxing venue, you’ll leave everyday distractions
                  and stresses behind, enabling an immersive journey and
                  connection to a like-minded community in real life.
                </p>
              </div>
            </div>
          </div>*/}
          {/*<div className="specific-teacher-text">
            Are you looking for a course with a specific teacher?{' '}
            <a href={`/us-en/courses/${slug}`}>Click here</a>
                  </div>*/}
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
          <div className="additionalInfo">
            <span className="icon-aol iconaol-info-circle"></span> Flexible
            rescheduling at no additional cost
          </div>
        </Modal.Body>
      </Modal>
    );
  },
);

export default WorkshopSelectModal;
