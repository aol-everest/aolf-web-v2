import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const MobileBottomBar = ({ workshop, toggleDetailMobileModal }) => {
  const {
    eventStartDate,
    eventEndDate,

    isGenericWorkshop,
    title,
  } = workshop || {};

  return (
    <div className="course-popup d-lg-none d-block">
      <div className="course-card">
        <div className="course-card__info">
          <div className="course-card__info-wrapper">
            <div className="d-flex justify-content-between align-items-center">
              {!isGenericWorkshop && (
                <p className="course-card__date">
                  {dayjs
                    .utc(eventStartDate)
                    .isSame(dayjs.utc(eventEndDate), "month") && (
                    <li className="tw-text-sm tw-truncate tw-tracking-tighter">{`${dayjs
                      .utc(eventStartDate)
                      .format("MMMM DD")}-${dayjs
                      .utc(eventEndDate)
                      .format("DD, YYYY")}`}</li>
                  )}
                  {!dayjs
                    .utc(eventStartDate)
                    .isSame(dayjs.utc(eventEndDate), "month") && (
                    <li className="tw-text-sm tw-truncate tw-tracking-tighter">{`${dayjs
                      .utc(eventStartDate)
                      .format("MMMM DD")}-${dayjs
                      .utc(eventEndDate)
                      .format("MMMM DD, YYYY")}`}</li>
                  )}
                </p>
              )}
              {isGenericWorkshop && <p className="course-card__date"></p>}
              <button
                id="course-details"
                className="link"
                onClick={toggleDetailMobileModal}
              >
                See details
              </button>
            </div>
            <h3 className="course-card__course-name">{title}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomBar;
