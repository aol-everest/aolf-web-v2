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
  }) => {
    const { track } = useAnalytics();
    const [localSelectedWorksop, setLocalSelectedWorksop] = useState(null);
    const [backPressed, setBackPressed] = useState(false);
    const handleWorkshopSelect = async (workshop) => {
      setLocalSelectedWorksop(workshop);
    };

    const handleWorkshopSelectForCheckout = async () => {
      setShowWorkshopSelectModal((prevValue) => !prevValue);
      const workshopDetail = await getWorkshopDetails(localSelectedWorksop?.id);
      setSelectedWorkshopId(workshopDetail?.id);
      track('program_date_button', {
        program_id: localSelectedWorksop?.id,
        program_name: workshopDetail?.title,
        program_date: workshopDetail?.eventStartDate,
        program_time: workshopDetail?.eventStartTime,
        category: 'All',
      });
    };

    const handleModalToggle = () => {
      setSelectedDates([]);
      setActiveWorkshop({});
      setSelectedWorkshopId(null);
      setLocalSelectedWorksop(null);
      setShowWorkshopSelectModal(false);
      setShowLocationModal(false);
    };

    const getSelectedAvailabelDate = () => {
      const index = dateAvailable.findIndex((obj) => {
        return obj.allDates.every((date) => selectedDates.includes(date));
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
        setLocalSelectedWorksop(null);
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
        setSelectedDates(maxDateObject?.allDates);
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
        <Modal.Header closeButton>Available Time</Modal.Header>
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
              {selectedDates.length > 0 && formatDateRange(selectedDates)}
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
                          {workshop?.mode === COURSE_MODES.ONLINE.name ? (
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
                            value={localSelectedWorksop?.id}
                            defaultChecked={
                              localSelectedWorksop?.id === workshop.id
                            }
                            checked={localSelectedWorksop?.id === workshop.id}
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
                  <div class="specific-teacher-text">
                    No Workshops available
                  </div>
                )}
          </div>
          <div class="specific-teacher-text">
            Are you looking for a course with a specific teacher?{' '}
            <a href="/us-en/course">Click here</a>
          </div>
          <div className="slot-action">
            <button
              type="button"
              disabled={!localSelectedWorksop}
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

export default WorkshopSelectModal;
